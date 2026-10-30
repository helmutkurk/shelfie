import {
  AppError,
  MAX_PAYOUT_LOVELACE,
  PayoutAddressSchema,
  LovelaceSchema,
  newPayoutId,
  payoutIdempotencyKey,
  payoutMetadataTag,
  randomIdGenerator,
  transition,
} from "@shelfie/core";
import type {
  Clock,
  IdGenerator,
  Logger,
  Payout,
  PayoutAdapter,
  PayoutQueue,
} from "@shelfie/core";
import type { PayoutStore } from "./payout-store.js";

// Payout queue (domain-model.md sections 2.4 and 6). One queue = one sender wallet, concurrency 1.
//
//  1. enqueue: unique `payout:<taskId>`; same task twice returns the same Payout.
//  2. write-ahead: QUEUED -> SENDING with attempts+1 and `sendingSince`, durable BEFORE send().
//  3. send() returns a hash -> SUBMITTED. Anything else after write-ahead -> UNKNOWN.
//  4. UNKNOWN is resolved only by reconcile: found by metadata tag -> SUBMITTED; provably absent
//     after the settling delay -> QUEUED (the ONLY route back, with proof); otherwise it stays
//     UNKNOWN and nothing is ever resent.
//  5. Insufficient funds (or a cap) pauses the queue; payouts stay QUEUED, never dropped.

export interface PayoutQueueDeps {
  adapter: PayoutAdapter;
  store: PayoutStore;
  clock: Clock;
  logger: Logger;
  ids?: IdGenerator;
  /** Label of the sender wallet (for example "pay-1"). */
  walletId?: string;
  /** Per-payout hard cap. Never above MAX_PAYOUT_LOVELACE. */
  maxPayoutLovelace?: string;
  /** Payouts started per UTC day (PAYOUT_DAILY_CAP_LOVELACE). verify Friday: default value. */
  dailyCapLovelace?: string;
  /** PAYOUT_MAX_ATTEMPTS, default 3. */
  maxAttempts?: number;
  /** Wait after write-ahead before "no tx found" counts as proof. Default 120 s (design: >= 2 min). */
  settleDelaySec?: number;
  /** Balance must cover amount plus this reserve for fees. Default 500_000. */
  feeReserveLovelace?: string;
  /** Observer for the evidence ledger (PAYOUT_QUEUED, PAYOUT_SUBMITTED, ...). */
  onEvent?: (event: PayoutEvent) => void;
}

export type PayoutEvent =
  | { kind: "PAYOUT_QUEUED"; payout: Payout }
  | { kind: "PAYOUT_SENDING"; payout: Payout }
  | { kind: "PAYOUT_SUBMITTED"; payout: Payout }
  | { kind: "PAYOUT_CONFIRMED"; payout: Payout }
  | { kind: "PAYOUT_UNKNOWN"; payout: Payout }
  | { kind: "PAYOUT_RECONCILED"; payout: Payout; result: "found" | "absent" }
  | { kind: "PAYOUT_FAILED_FINAL"; payout: Payout }
  | { kind: "QUEUE_PAUSED"; reason: string };

export interface QueueStatus {
  paused: boolean;
  reason: string | null;
  depth: number;
  unknown: number;
}

const DEFAULT_DAILY_CAP = "50000000"; // 50 tADA, verify Friday
const FEE_RESERVE = "500000";

export class DefaultPayoutQueue implements PayoutQueue {
  private readonly ids: IdGenerator;
  private readonly walletId: string;
  private readonly maxPayout: bigint;
  private readonly dailyCap: bigint;
  private readonly maxAttempts: number;
  private readonly settleDelayMs: number;
  private readonly feeReserve: bigint;
  private chain: Promise<void> = Promise.resolve();
  private createLock: Promise<unknown> = Promise.resolve();
  private pending = 0;
  private pausedReason: string | null = null;

  constructor(private readonly deps: PayoutQueueDeps) {
    this.ids = deps.ids ?? randomIdGenerator;
    this.walletId = deps.walletId ?? "pay-1";
    const hardCap = BigInt(MAX_PAYOUT_LOVELACE);
    const wanted = BigInt(LovelaceSchema.parse(deps.maxPayoutLovelace ?? MAX_PAYOUT_LOVELACE));
    this.maxPayout = wanted < hardCap ? wanted : hardCap;
    this.dailyCap = BigInt(LovelaceSchema.parse(deps.dailyCapLovelace ?? DEFAULT_DAILY_CAP));
    this.maxAttempts = deps.maxAttempts ?? 3;
    this.settleDelayMs = (deps.settleDelaySec ?? 120) * 1000;
    this.feeReserve = BigInt(LovelaceSchema.parse(deps.feeReserveLovelace ?? FEE_RESERVE));
  }

  // ---------------------------------------------------------------- public port
  async enqueue(p: { taskId: string; toAddress: string; lovelace: string }): Promise<Payout> {
    const amount = this.validate(p);
    const key = payoutIdempotencyKey(p.taskId);
    // creation is serialised so two concurrent enqueues of one task cannot both insert
    const created = this.withCreateLock(async () => {
      const existing = await this.deps.store.getByKey(key);
      if (existing) return { payout: existing, created: false };
      const id = newPayoutId(this.ids);
      const payout: Payout = {
        id,
        taskId: p.taskId as Payout["taskId"],
        idempotencyKey: key,
        toAddress: p.toAddress,
        amount: amount.toString(),
        state: "QUEUED",
        txHash: null,
        metadataTag: payoutMetadataTag(id),
        attempts: 0,
        lastError: null,
        walletId: this.walletId,
        sendingSince: null,
      };
      return this.deps.store.insert(payout);
    });
    const { payout, created: isNew } = await created;
    if (isNew) {
      this.deps.logger.info("payout queued", {
        taskId: p.taskId,
        payoutId: payout.id,
        lovelace: payout.amount,
      });
      this.emit({ kind: "PAYOUT_QUEUED", payout });
      this.schedule();
    }
    return payout;
  }

  async get(id: string): Promise<Payout> {
    const p = await this.deps.store.get(id);
    if (!p) throw new AppError("not_found", "Payout not found.");
    return p;
  }

  async reconcile(id: string): Promise<Payout> {
    return this.serial(async () => {
      let p = await this.get(id);
      if (p.state === "SENDING") p = await this.toUnknown(p, "reconcile requested while SENDING");
      if (p.state !== "UNKNOWN") return p;
      return this.reconcileOne(p, { skipDelay: false });
    });
  }

  // ---------------------------------------------------------------- operations
  status(): Promise<QueueStatus> {
    return this.deps.store.list().then((all) => ({
      paused: this.pausedReason !== null,
      reason: this.pausedReason,
      depth: all.filter((p) => p.state === "QUEUED").length,
      unknown: all.filter((p) => p.state === "UNKNOWN").length,
    }));
  }

  /** Clear a pause (after funding the wallet or raising a cap) and continue. */
  resume(): void {
    if (this.pausedReason !== null) {
      this.deps.logger.warn("payout queue resumed", { was: this.pausedReason });
      this.pausedReason = null;
    }
    this.schedule();
  }

  /**
   * Start-up recovery: every payout left in SENDING (crash between write-ahead and hash) becomes
   * UNKNOWN and is reconciled; UNKNOWN ones are reconciled again. Nothing is resent without proof.
   */
  recover(): Promise<void> {
    return this.serial(async () => {
      for (const p of await this.deps.store.list(["SENDING", "UNKNOWN"])) {
        const unknown = p.state === "SENDING" ? await this.toUnknown(p, "recovered after restart") : p;
        await this.reconcileOne(unknown, { skipDelay: false });
      }
      this.schedule();
    });
  }

  /** Poll confirmations of SUBMITTED payouts. */
  pollConfirmations(): Promise<void> {
    return this.serial(async () => {
      for (const p of await this.deps.store.list(["SUBMITTED"])) {
        if (!p.txHash) continue;
        let confirmations: number;
        try {
          confirmations = await this.deps.adapter.confirmations(p.txHash);
        } catch {
          continue; // try again on the next poll
        }
        if (confirmations >= 1) {
          const next = { ...p, state: transition("payout", p.state, "confirmed") };
          await this.deps.store.update(next);
          this.emit({ kind: "PAYOUT_CONFIRMED", payout: next });
        } else if (confirmations < 0) {
          const next = {
            ...p,
            state: transition("payout", p.state, "rejected_by_node"),
            lastError: "rejected_by_node",
          };
          await this.deps.store.update(next);
          this.deps.logger.error("payout rejected by node", { payoutId: p.id, taskId: p.taskId });
          this.emit({ kind: "PAYOUT_FAILED_FINAL", payout: next });
        }
      }
    });
  }

  /** Operator: FAILED_FINAL -> QUEUED. */
  retry(id: string): Promise<Payout> {
    return this.serial(async () => {
      const p = await this.get(id);
      const next = { ...p, state: transition("payout", p.state, "operator_retry"), attempts: 0 };
      await this.deps.store.update(next);
      this.schedule();
      return next;
    });
  }

  /** Operator: record an out-of-band payment. The ledger flags it; see domain-model 6.7. */
  markPaid(id: string, txHash: string): Promise<Payout> {
    return this.serial(async () => {
      const p = await this.get(id);
      const next = {
        ...p,
        state: transition("payout", p.state, "operator_mark_paid"),
        txHash,
        lastError: "marked_paid_by_operator",
      };
      await this.deps.store.update(next);
      this.emit({ kind: "PAYOUT_CONFIRMED", payout: next });
      return next;
    });
  }

  /** Resolves when everything queued so far has been processed (tests, graceful shutdown). */
  async drain(): Promise<void> {
    while (this.pending > 0) await this.chain;
  }

  // ---------------------------------------------------------------- internals
  private validate(p: { taskId: string; toAddress: string; lovelace: string }): bigint {
    if (!/^[A-Za-z0-9_.:-]{1,128}$/.test(p.taskId)) {
      throw new AppError("invalid_request", "Malformed taskId.");
    }
    if (!PayoutAddressSchema.safeParse(p.toAddress).success) {
      throw new AppError("invalid_payout_address", "Payout address must be a preprod address.");
    }
    if (!LovelaceSchema.safeParse(p.lovelace).success) {
      throw new AppError("unprocessable", "Payout amount must be an integer in lovelace.", undefined, {
        reason: "amount_not_integer",
      });
    }
    const amount = BigInt(p.lovelace);
    if (amount <= 0n) {
      throw new AppError("unprocessable", "Payout amount must be positive.", undefined, {
        reason: "amount_not_positive",
      });
    }
    if (amount > this.maxPayout) {
      throw new AppError("unprocessable", "Payout amount is above the hard cap.", undefined, {
        reason: "amount_above_cap",
        maxLovelace: this.maxPayout.toString(),
      });
    }
    return amount;
  }

  private withCreateLock<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.createLock.then(fn, fn);
    this.createLock = run.catch(() => undefined);
    return run;
  }

  private serial<T>(fn: () => Promise<T>): Promise<T> {
    this.pending++;
    const run = this.chain.then(fn, fn);
    this.chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run.finally(() => {
      this.pending--;
    });
  }

  private schedule(): void {
    this.serial(() => this.loop()).catch((err: unknown) => {
      this.deps.logger.error("payout queue loop failed", {
        name: err instanceof Error ? err.name : "unknown",
      });
    });
  }

  private pause(reason: string): void {
    if (this.pausedReason === null) {
      this.pausedReason = reason;
      this.deps.logger.error("payout queue paused", { reason });
      this.emit({ kind: "QUEUE_PAUSED", reason });
    }
  }

  private emit(event: PayoutEvent): void {
    try {
      this.deps.onEvent?.(event);
    } catch {
      // observers must never break the queue
    }
  }

  private async loop(): Promise<void> {
    while (this.pausedReason === null) {
      const [next] = await this.deps.store.list(["QUEUED"]);
      if (!next) return;
      // A previous payout still UNKNOWN blocks nothing else: only the same task is guarded by key.
      await this.sendOne(next);
    }
  }

  private async sendOne(p0: Payout): Promise<void> {
    let p = p0;
    if (p.attempts >= this.maxAttempts) {
      p = { ...p, state: transition("payout", p.state, "max_attempts") };
      await this.deps.store.update(p);
      this.deps.logger.error("payout failed final (max attempts)", { payoutId: p.id, taskId: p.taskId });
      this.emit({ kind: "PAYOUT_FAILED_FINAL", payout: p });
      return;
    }
    const amount = BigInt(p.amount);

    // caps and funds are checked BEFORE the write-ahead: a refusal leaves the payout QUEUED
    if (amount > this.maxPayout) {
      this.pause("amount_above_cap");
      return;
    }
    if ((await this.startedToday(p.id)) + amount > this.dailyCap) {
      this.pause("daily_cap_reached");
      return;
    }
    try {
      const balance = BigInt(await this.deps.adapter.balance());
      if (balance < amount + this.feeReserve) {
        this.pause("insufficient_funds");
        return;
      }
    } catch {
      this.pause("balance_check_failed");
      return;
    }

    // write-ahead: durable before the adapter is called
    p = {
      ...p,
      state: transition("payout", p.state, "dequeued"),
      attempts: p.attempts + 1,
      sendingSince: this.deps.clock.nowIso(),
      lastError: null,
    };
    await this.deps.store.update(p);
    this.emit({ kind: "PAYOUT_SENDING", payout: p });

    let txHash: string;
    try {
      ({ txHash } = await this.deps.adapter.send({
        toAddress: p.toAddress,
        lovelace: p.amount,
        metadataTag: p.metadataTag,
      }));
    } catch (err) {
      const notSent = err instanceof AppError && err.details["notSent"] === true;
      const detailReason = err instanceof AppError ? err.details["reason"] : undefined;
      const reason =
        typeof detailReason === "string" ? detailReason : err instanceof AppError ? err.code : "unknown_error";
      this.deps.logger.warn("payout send failed", { payoutId: p.id, taskId: p.taskId, reason, notSent });
      const unknown = await this.toUnknown(p, reason);
      await this.reconcileOne(unknown, { skipDelay: notSent });
      if (notSent && reason === "insufficient_funds") this.pause("insufficient_funds");
      return;
    }

    try {
      const next = { ...p, state: transition("payout", p.state, "hash_obtained"), txHash };
      await this.deps.store.update(next);
      this.deps.logger.info("payout submitted", { payoutId: p.id, taskId: p.taskId, txHash });
      this.emit({ kind: "PAYOUT_SUBMITTED", payout: next });
    } catch (err) {
      // The transfer is out but we could not record the hash. Stop sending; on restart `recover`
      // finds it by metadata tag. The hash is logged so an operator can use markPaid.
      this.deps.logger.error("payout hash could not be persisted", {
        payoutId: p.id,
        taskId: p.taskId,
        txHash,
        name: err instanceof Error ? err.name : "unknown",
      });
      this.pause("persist_failed");
    }
  }

  private async toUnknown(p: Payout, reason: string): Promise<Payout> {
    const next = {
      ...p,
      state: transition("payout", p.state, "timeout_or_crash"),
      lastError: reason,
    };
    await this.deps.store.update(next);
    this.emit({ kind: "PAYOUT_UNKNOWN", payout: next });
    return next;
  }

  /**
   * Reconcile one UNKNOWN payout. Never resends. QUEUED again only when the lookup succeeded,
   * found nothing, and the settling delay has passed (or the adapter attested that nothing was
   * sent, and the lookup still found nothing).
   */
  private async reconcileOne(p: Payout, opts: { skipDelay: boolean }): Promise<Payout> {
    const since = p.sendingSince ?? new Date(0).toISOString();
    let found: { txHash: string } | null;
    try {
      found = await this.deps.adapter.find({ metadataTag: p.metadataTag, sinceIso: since });
    } catch {
      this.deps.logger.warn("payout reconcile inconclusive (lookup failed)", {
        payoutId: p.id,
        taskId: p.taskId,
      });
      return p; // stays UNKNOWN; operator alert via log, no resend
    }
    if (found) {
      const next = {
        ...p,
        state: transition("payout", p.state, "reconcile_found"),
        txHash: found.txHash,
        lastError: null,
      };
      await this.deps.store.update(next);
      this.deps.logger.info("payout reconciled: transfer found", {
        payoutId: p.id,
        taskId: p.taskId,
        txHash: found.txHash,
      });
      this.emit({ kind: "PAYOUT_RECONCILED", payout: next, result: "found" });
      this.emit({ kind: "PAYOUT_SUBMITTED", payout: next });
      return next;
    }
    const waited = this.deps.clock.nowMs() - Date.parse(since);
    if (!opts.skipDelay && waited < this.settleDelayMs) {
      this.deps.logger.warn("payout reconcile inconclusive (settling delay not over)", {
        payoutId: p.id,
        taskId: p.taskId,
        waitedMs: waited,
      });
      return p;
    }
    const next = {
      ...p,
      state: transition("payout", p.state, "reconcile_proved_absent", {
        reconcileProvedAbsent: true,
      }),
    };
    await this.deps.store.update(next);
    this.emit({ kind: "PAYOUT_RECONCILED", payout: next, result: "absent" });
    this.schedule();
    return next;
  }

  private async startedToday(excludeId: string): Promise<bigint> {
    const day = this.deps.clock.nowIso().slice(0, 10);
    const all = await this.deps.store.list(["SENDING", "SUBMITTED", "CONFIRMED", "UNKNOWN"]);
    let sum = 0n;
    for (const p of all) {
      if (p.id !== excludeId && p.sendingSince?.slice(0, 10) === day) sum += BigInt(p.amount);
    }
    return sum;
  }
}

export function createPayoutQueue(deps: PayoutQueueDeps): DefaultPayoutQueue {
  return new DefaultPayoutQueue(deps);
}
