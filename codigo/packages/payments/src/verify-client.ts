import {
  AppError,
  ErrorBodySchema,
  VerifyRequestSchema,
  VerifyResponseSchema,
} from "@shelfie/core";
import type {
  EngineEnv,
  Logger,
  VerifyClient,
  VerifyRequest,
  VerifyResponse,
} from "@shelfie/core";
import { ExactCardanoScheme } from "@x402/cardano/exact/client";
import { toClientCardanoSigner } from "@x402/cardano";
import { x402Client, x402HTTPClient, wrapFetchWithPayment } from "@x402/fetch";
import { FakeVerifyClient } from "./fakes.js";
import { BLOCKFROST_PREPROD_URL } from "./payout-adapter.js";

// Verify clients: what the engine uses to get a verdict (contracts.md section 3.3).
//
//  - X402VerifyClient: x402 buyer, wrapFetchWithPayment from the template buyer.ts, signer from the
//    W-VBUY mnemonic, spend cap per payment, one payment in flight per wallet, receipts per
//    idempotency key.
//  - DryVerifyClient: VERIFIER_PAYMENT=off, calls POST /v1/verify-dry. No money moves; the
//    returned "tx hash" is `dry-run:<key>` and is not a hash (isRealTxHash is false).
//  - FakeVerifyClient (./fakes.ts): scripted verdicts, no network.
//
// A payment is never re-signed after an unclear outcome (x402 runbook section 5, domain-model 3):
// the key is marked uncertain and verify() refuses until an operator resolves it.

const NETWORK = "cardano:preprod";

export interface VerifyClientOptions {
  verifierUrl: string;
  engineToken?: string | undefined;
  /** Admin token for the dry endpoint (DryVerifyClient only). */
  adminToken?: string | undefined;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  logger: Logger;
}

function parseVerdict(body: unknown): VerifyResponse {
  const parsed = VerifyResponseSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError("dependency_unavailable", "Verifier answered with an unexpected body.", undefined, {
      reason: "bad_verdict",
    });
  }
  return parsed.data;
}

function mapErrorResponse(status: number, body: unknown): AppError {
  const parsed = ErrorBodySchema.safeParse(body);
  if (parsed.success) {
    const e = parsed.data.error;
    return new AppError(e.code, e.message, status, e.details);
  }
  return new AppError(
    status >= 500 ? "dependency_unavailable" : "invalid_request",
    "Verifier request failed.",
    status,
    { reason: "unparsed_error" },
  );
}

async function readJson(res: Response): Promise<unknown> {
  try {
    return (await res.json());
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- dry
export class DryVerifyClient implements VerifyClient {
  constructor(private readonly opts: VerifyClientOptions) {}

  async verify(
    req: VerifyRequest,
    key: string,
  ): Promise<{ verdict: VerifyResponse; txHash: string; receipt: unknown }> {
    const body = VerifyRequestSchema.parse(req);
    const doFetch = this.opts.fetchImpl ?? fetch;
    let res: Response;
    try {
      res = await doFetch(`${this.opts.verifierUrl.replace(/\/+$/, "")}/v1/verify-dry`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": key,
          ...(this.opts.engineToken ? { "x-engine-token": this.opts.engineToken } : {}),
          ...(this.opts.adminToken ? { "x-admin-token": this.opts.adminToken } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.opts.timeoutMs ?? 60_000),
      });
    } catch {
      throw new AppError("dependency_unavailable", "Verifier unreachable.", undefined, {
        reason: "network_or_timeout",
      });
    }
    const json = await readJson(res);
    if (!res.ok) throw mapErrorResponse(res.status, json);
    return { verdict: parseVerdict(json), txHash: `dry-run:${key}`, receipt: { dry: true } };
  }
}

// ---------------------------------------------------------------- x402
export interface X402Wallet {
  id: string;
  /** `wrapFetchWithPayment(inner, client)` for this wallet; `inner` lets us observe the requests. */
  wrap: (inner: typeof fetch) => typeof fetch;
}

export interface X402VerifyClientOptions extends VerifyClientOptions {
  /** One entry per W-VBUY wallet (round-robin by load). */
  wallets: readonly X402Wallet[];
  /** Decode `PAYMENT-RESPONSE` into the settlement transaction hash. */
  settle: (headers: Headers) => { transaction: string; success: boolean };
}

interface Receipt {
  txHash: string;
  verdict: VerifyResponse;
  receipt: unknown;
}

export class X402VerifyClient implements VerifyClient {
  private readonly receipts = new Map<string, Receipt>();
  private readonly inflight = new Map<string, Promise<Receipt>>();
  private readonly uncertain = new Set<string>();
  private readonly tails: Promise<unknown>[];
  private readonly load: number[];

  constructor(private readonly opts: X402VerifyClientOptions) {
    if (opts.wallets.length === 0) throw new Error("X402VerifyClient needs at least one wallet");
    this.tails = opts.wallets.map(() => Promise.resolve());
    this.load = opts.wallets.map(() => 0);
  }

  /** Keys whose payment outcome is unclear. Operator action only. */
  get uncertainKeys(): string[] {
    return [...this.uncertain];
  }

  /** Operator: after checking the wallet history on the explorer, allow a new attempt. */
  resolveUncertain(key: string): void {
    this.uncertain.delete(key);
  }

  async verify(
    req: VerifyRequest,
    key: string,
  ): Promise<{ verdict: VerifyResponse; txHash: string; receipt: unknown }> {
    const body = VerifyRequestSchema.parse(req);
    const stored = this.receipts.get(key);
    if (stored) return { ...stored, verdict: { ...stored.verdict, cached: true } };
    if (this.uncertain.has(key)) {
      throw new AppError("dependency_unavailable", "An earlier payment for this check is unclear.", undefined, {
        reason: "payment_uncertain",
        key,
      });
    }
    const running = this.inflight.get(key);
    if (running) return running;
    const task = this.runOnWallet(body, key);
    this.inflight.set(key, task);
    try {
      return await task;
    } finally {
      this.inflight.delete(key);
    }
  }

  private runOnWallet(body: VerifyRequest, key: string): Promise<Receipt> {
    // pick the wallet with the fewest queued payments; each wallet runs one payment at a time
    let idx = 0;
    for (let i = 1; i < this.load.length; i++) if ((this.load[i] ?? 0) < (this.load[idx] ?? 0)) idx = i;
    this.load[idx] = (this.load[idx] ?? 0) + 1;
    const wallet = this.opts.wallets[idx] as X402Wallet;
    const run = (this.tails[idx] as Promise<unknown>).then(
      () => this.attempt(wallet, body, key),
      () => this.attempt(wallet, body, key),
    );
    this.tails[idx] = run.catch(() => undefined);
    return run.finally(() => {
      this.load[idx] = (this.load[idx] ?? 1) - 1;
    });
  }

  private async attempt(wallet: X402Wallet, body: VerifyRequest, key: string): Promise<Receipt> {
    const { logger } = this.opts;
    let paymentSent = false;
    const base = this.opts.fetchImpl ?? fetch;
    const observing: typeof fetch = (input, init) => {
      const headers = new Headers(init?.headers);
      if (headers.has("payment-signature") || headers.has("x-payment")) paymentSent = true;
      return base(input, init);
    };
    let res: Response;
    try {
      res = await wallet.wrap(observing)(`${this.opts.verifierUrl.replace(/\/+$/, "")}/v1/verify`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": key,
          ...(this.opts.engineToken ? { "x-engine-token": this.opts.engineToken } : {}),
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(this.opts.timeoutMs ?? 120_000),
      });
    } catch {
      if (!paymentSent) {
        // nothing was offered or signed: safe to retry with the same key
        throw new AppError("dependency_unavailable", "Verifier unreachable.", undefined, {
          reason: "network_or_timeout",
          paymentSent: false,
        });
      }
      // A payment was sent and the connection broke: it may still settle. The key is frozen,
      // no automatic re-sign (double-pay guard); an operator checks the explorer first.
      this.uncertain.add(key);
      logger.error("verify payment outcome unclear, key frozen", {
        submissionId: body.submissionId,
        key,
        walletId: wallet.id,
      });
      throw new AppError("dependency_unavailable", "Verifier call failed, payment outcome unclear.", undefined, {
        reason: "payment_uncertain",
        key,
      });
    }

    const json = await readJson(res);
    if (res.status === 402) {
      // payment was refused after we offered one (or no scheme matched): not retried automatically
      throw new AppError("payment_required", "The verifier did not accept the payment.", 402, {
        reason: "payment_refused",
        key,
      });
    }
    if (!res.ok) {
      const parsedError = ErrorBodySchema.safeParse(json);
      if (!parsedError.success && paymentSent && res.status >= 500) {
        // not our error body: the failure may have happened around settlement
        this.uncertain.add(key);
        throw new AppError("dependency_unavailable", "Verifier failed after payment, outcome unclear.", undefined, {
          reason: "payment_uncertain",
          key,
        });
      }
      throw mapErrorResponse(res.status, json); // our handler failed: x402 cancelled settlement
    }
    const verdict = parseVerdict(json);
    let settle: { transaction: string; success: boolean };
    try {
      settle = this.opts.settle(res.headers);
    } catch {
      this.uncertain.add(key);
      throw new AppError("dependency_unavailable", "Verdict received without a payment receipt.", undefined, {
        reason: "missing_payment_receipt",
        key,
      });
    }
    if (!settle.success || !settle.transaction) {
      this.uncertain.add(key);
      throw new AppError("dependency_unavailable", "Payment settlement was not confirmed.", undefined, {
        reason: "settlement_not_confirmed",
        key,
      });
    }
    const receipt: Receipt = {
      txHash: settle.transaction,
      verdict,
      receipt: { transaction: settle.transaction, network: NETWORK },
    };
    this.receipts.set(key, receipt);
    logger.info("verify paid", {
      submissionId: body.submissionId,
      key,
      txHash: settle.transaction,
      walletId: wallet.id,
      pass: verdict.pass,
    });
    return receipt;
  }
}

// ---------------------------------------------------------------- factory
type VerifyClientEnv = Pick<
  EngineEnv,
  | "VERIFIER_URL"
  | "VERIFIER_PAYMENT"
  | "FAKE_PAYMENTS"
  | "ENGINE_TOKEN"
  | "ADMIN_TOKEN"
  | "VERIFY_MAX_PRICE_LOVELACE"
  | "VBUY_WALLETS"
  | "VBUY_MNEMONIC_1"
  | "VBUY_MNEMONIC_2"
  | "BLOCKFROST_PROJECT_ID"
>;

export interface CreateVerifyClientOptions {
  /** Expected W-SELL address (SELLER_ADDRESS). Payments to any other payee are refused. */
  expectedPayTo?: string;
  fetchImpl?: typeof fetch;
}

/**
 * Precedence: `VERIFIER_PAYMENT=off` -> DryVerifyClient (real gates, no money); else
 * `FAKE_PAYMENTS` -> FakeVerifyClient (scripted); else the x402 buyer.
 */
export function createVerifyClient(
  env: VerifyClientEnv,
  logger: Logger,
  opts: CreateVerifyClientOptions = {},
): VerifyClient {
  const base = {
    verifierUrl: env.VERIFIER_URL,
    engineToken: env.ENGINE_TOKEN,
    logger,
    ...(opts.fetchImpl ? { fetchImpl: opts.fetchImpl } : {}),
  };
  if (env.VERIFIER_PAYMENT === "off") {
    logger.warn("VERIFIER_PAYMENT=off: verdicts come from /v1/verify-dry, no x402 payment");
    return new DryVerifyClient({ ...base, adminToken: env.ADMIN_TOKEN });
  }
  if (env.FAKE_PAYMENTS) {
    logger.warn("FAKE_PAYMENTS: verdicts are scripted, no x402 payment");
    return new FakeVerifyClient();
  }
  const mnemonics = [env.VBUY_MNEMONIC_1, env.VBUY_MNEMONIC_2].slice(0, env.VBUY_WALLETS);
  if (mnemonics.some((m) => !m) || !env.BLOCKFROST_PROJECT_ID) {
    throw new AppError("internal", "VBUY wallet(s) or BLOCKFROST_PROJECT_ID not configured.");
  }
  const cap = env.VERIFY_MAX_PRICE_LOVELACE;
  const wallets = mnemonics.map((mnemonic, i): X402Wallet => {
    const client = new x402Client().setSpendControls({
      // lovelace is rejected by default (not USD-pegged), so it is allowed explicitly and capped
      allowedAssets: [{ network: "cardano:*", asset: "lovelace", maxAmountPerPayment: cap }],
    });
    if (opts.expectedPayTo) {
      const payTo = opts.expectedPayTo;
      client.registerPolicy((_version, reqs) =>
        reqs.filter((r) => r.payTo === payTo && BigInt(r.amount) <= BigInt(cap)),
      );
    }
    const signer = toClientCardanoSigner({
      mnemonic: mnemonic as string,
      network: NETWORK,
      // verify Friday: Blockfrost base URL (the template reads it from its env)
      provider: {
        blockfrost: { baseUrl: BLOCKFROST_PREPROD_URL, projectId: env.BLOCKFROST_PROJECT_ID },
      },
    });
    client.register("cardano:*", new ExactCardanoScheme(signer));
    return {
      id: `vbuy-${String(i + 1)}`,
      wrap: (inner) => wrapFetchWithPayment(inner, client),
    };
  });
  const httpClient = new x402HTTPClient(new x402Client());
  return new X402VerifyClient({
    ...base,
    wallets,
    settle: (headers) => {
      const r = httpClient.getPaymentSettleResponse((n) => headers.get(n));
      return { transaction: r.transaction, success: r.success };
    },
  });
}
