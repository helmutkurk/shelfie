import { z } from "zod";
import { LovelaceSchema, NetworkSchema } from "./common.js";
export { loadEnv } from "./load-env.js";
export { WebEnvSchema } from "./web-env.js";
export type { WebEnv } from "./web-env.js";

// Env schemas, one per component (contracts.md section 5). Names only live in .env.example.
// Rules: fail fast; preprod only (mainnet refused); error messages carry NAMES and problems,
// never values.

/** Hard cap on a single worker payout (security.md P4 decision: 5 tADA). */
export const MAX_PAYOUT_LOVELACE = "5000000";

const flag = (def: boolean) => z.stringbool().default(def);
const intVar = (def: number) => z.coerce.number().int().positive().default(def);
const lovelaceVar = (def: string) => LovelaceSchema.default(def);
const optStr = () => z.string().min(1).optional();
const optUrl = () => z.url().optional();
const tokenVar = () => z.string().min(8).optional();

const DEV_ADMIN_TOKEN = "dev-admin-token";
const DEV_SHELL_TOKEN = "dev-shell-token";
const DEV_ENGINE_TOKEN = "dev-engine-token";

/** Shared (5.1). */
export const sharedEnvShape = {
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NETWORK: NetworkSchema.default("preprod"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  PACK_ID: z.string().min(1).default("shelf-check"),
  ADMIN_TOKEN: tokenVar(),
  EXPLORER_TX_BASE: z.string().default("https://preprod.cardanoscan.io/transaction/"),
  // verify Friday: default not given in contracts.md
  EXPLORER_ADDRESS_BASE: z.string().default("https://preprod.cardanoscan.io/address/"),
};

type Issue = (name: string, message: string) => void;

/** Mainnet guard on values that identify a network. Messages never echo the value. */
function guardPreprod(v: Record<string, unknown>, add: Issue): void {
  const addr = v["SELLER_ADDRESS"];
  if (typeof addr === "string" && !addr.startsWith("addr_test1")) {
    add("SELLER_ADDRESS", "must be a preprod address (addr_test1...); mainnet is refused");
  }
  const bf = v["BLOCKFROST_PROJECT_ID"];
  if (typeof bf === "string" && bf.toLowerCase().startsWith("mainnet")) {
    add("BLOCKFROST_PROJECT_ID", "looks like a mainnet project; mainnet is refused");
  }
}

function refineWith<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  check: (v: T, add: Issue) => void,
) {
  return schema.superRefine((v, ctx) => {
    check(v, (name, message) => {
      ctx.addIssue({ code: "custom", path: [name], message });
    });
  });
}

/**
 * Optional secret tokens: required when NODE_ENV=production, defaulted to a clearly-fake
 * development value otherwise (so fakes run without any setup).
 */
function withDevTokens<T extends Record<string, unknown>, K extends string>(
  schema: z.ZodType<T>,
  defaults: Record<K, string>,
): z.ZodType<Omit<T, K> & Record<K, string>> {
  const keys = Object.keys(defaults) as K[];
  return refineWith(schema, (v, add) => {
    if (v["NODE_ENV"] !== "production") return;
    for (const k of keys) if (v[k] === undefined) add(k, "required when NODE_ENV=production");
  }).transform((v) => {
    const out: Record<string, unknown> = { ...v };
    for (const k of keys) out[k] ??= defaults[k];
    return out as Omit<T, K> & Record<K, string>;
  });
}

// ---------------------------------------------------------------- Shared only
export const SharedEnvSchema = withDevTokens(
  refineWith(z.object(sharedEnvShape), (v, add) => {
    guardPreprod(v, add);
  }),
  { ADMIN_TOKEN: DEV_ADMIN_TOKEN },
);
export type SharedEnv = z.output<typeof SharedEnvSchema>;

// ---------------------------------------------------------------- Engine (5.2)
const engineBase = z.object({
  ...sharedEnvShape,
  ENGINE_PORT: intVar(4000),
  SELLER_ADDRESS: optStr(),
  PAYOUT_DAILY_CAP_LOVELACE: lovelaceVar("50000000"),
  ALLOWED_HOSTS: optStr(),
  ALLOWED_ORIGINS: optStr(),
  CATALOG_DIR: optStr(),
  WEB_DIST: optStr(),
  VERIFY_CLIENT: z.enum(["fake", "real"]).optional(),
  PAYMENTS_IMPL: z.enum(["package", "engine-fake"]).optional(),
  PAYOUT_STORE_PATH: optStr(),
  EVIDENCE_RUN_LOCKED: flag(false),
  PUBLIC_BASE_URL: optUrl(),
  DEFAULT_GEOFENCE_M: intVar(150),
  ACCURACY_CAP_M: intVar(100),
  LOCATION_MAX_TRIES: intVar(3),
  ALLOW_TEST_UPLOAD: flag(false),
  SHELL_TOKEN: tokenVar(),
  ENGINE_TOKEN: tokenVar(),
  VERIFIER_URL: z.url().default("http://127.0.0.1:4021"),
  VERIFIER_PAYMENT: z.enum(["on", "off"]).default("off"),
  FAKE_PAYMENTS: flag(false),
  JOB_WINDOW_SEC: intVar(900),
  CLAIM_TTL_SEC: intVar(300),
  VERIFY_BUDGET_SEC: intVar(120),
  LOCATION_CHECK: z.enum(["on", "off"]).default("on"),
  // ADR-19: overrides the pack's challenge mode (kill switch: "card-pool" or "handwritten").
  CHALLENGE_MODE: z.enum(["gesture", "handwritten", "card-pool"]).optional(),
  MAX_ATTEMPTS: intVar(3),
  MAX_IMAGE_BYTES: intVar(2_000_000),
  PAYOUT_LOVELACE: lovelaceVar("3000000"),
  PAYOUT_MAX_ATTEMPTS: intVar(3),
  PAYOUT_WALLETS: z.coerce.number().int().min(1).max(2).default(1),
  VBUY_WALLETS: z.coerce.number().int().min(1).max(2).default(1),
  // verify Friday: default not given in contracts.md
  MIN_WALLET_LOVELACE: lovelaceVar("10000000"),
  ALLOW_DEMO_OVERRIDE: flag(false),
  STORE_PATH: z.string().default("./data/engine-events.jsonl"),
  LEDGER_PATH: z.string().default("./data/evidence-ledger.jsonl"),
  BLOCKFROST_PROJECT_ID: optStr(),
  PAY_MNEMONIC_1: optStr(),
  PAY_MNEMONIC_2: optStr(),
  VBUY_MNEMONIC_1: optStr(),
  VBUY_MNEMONIC_2: optStr(),
  VERIFY_MAX_PRICE_LOVELACE: lovelaceVar("2000000"),
  // Total x402 verify spend per engine run (security.md P5); each attempt reserves the per-payment cap.
  VERIFY_RUN_CAP_LOVELACE: lovelaceVar("50000000"),
  FACILITATOR_URL: optUrl(),
});

export const EngineEnvSchema = withDevTokens(
  refineWith(engineBase, (v, add) => {
    guardPreprod(v, add);
    if (v.CLAIM_TTL_SEC + v.VERIFY_BUDGET_SEC >= v.JOB_WINDOW_SEC) {
      add("JOB_WINDOW_SEC", "must exceed CLAIM_TTL_SEC + VERIFY_BUDGET_SEC (claim cutoff)");
    }
    if (BigInt(v.PAYOUT_LOVELACE) > BigInt(MAX_PAYOUT_LOVELACE)) {
      add("PAYOUT_LOVELACE", "exceeds the hard payout cap (MAX_PAYOUT_LOVELACE)");
    }
    if (BigInt(v.VERIFY_RUN_CAP_LOVELACE) < BigInt(v.VERIFY_MAX_PRICE_LOVELACE)) {
      add("VERIFY_RUN_CAP_LOVELACE", "must be at least VERIFY_MAX_PRICE_LOVELACE");
    }
    if (!v.FAKE_PAYMENTS) {
      if (v.BLOCKFROST_PROJECT_ID === undefined) {
        add("BLOCKFROST_PROJECT_ID", "required when FAKE_PAYMENTS is off");
      }
      if (v.PAY_MNEMONIC_1 === undefined)
        add("PAY_MNEMONIC_1", "required when FAKE_PAYMENTS is off");
      if (v.PAYOUT_WALLETS >= 2 && v.PAY_MNEMONIC_2 === undefined) {
        add("PAY_MNEMONIC_2", "required when PAYOUT_WALLETS >= 2");
      }
      if (v.VERIFIER_PAYMENT === "on") {
        if (v.SELLER_ADDRESS === undefined)
          add("SELLER_ADDRESS", "required for real paid verification");
        if (v.VBUY_MNEMONIC_1 === undefined)
          add("VBUY_MNEMONIC_1", "required for VERIFIER_PAYMENT=on");
        if (v.VBUY_WALLETS >= 2 && v.VBUY_MNEMONIC_2 === undefined) {
          add("VBUY_MNEMONIC_2", "required when VBUY_WALLETS >= 2");
        }
        if (v.FACILITATOR_URL === undefined)
          add("FACILITATOR_URL", "required for VERIFIER_PAYMENT=on");
      }
    }
  }),
  { ADMIN_TOKEN: DEV_ADMIN_TOKEN, SHELL_TOKEN: DEV_SHELL_TOKEN, ENGINE_TOKEN: DEV_ENGINE_TOKEN },
);
export type EngineEnv = z.output<typeof EngineEnvSchema>;

// ---------------------------------------------------------------- Verifier (5.3)
const verifierBase = z.object({
  ...sharedEnvShape,
  VERIFIER_PORT: intVar(4021),
  VERIFIER_PAYMENT: z.enum(["on", "off"]).default("on"),
  VISION_RUN_CAP: z.coerce.number().int().positive().optional(),
  SELLER_ADDRESS: optStr(),
  FACILITATOR_URL: optUrl(),
  BLOCKFROST_PROJECT_ID: optStr(),
  VERIFY_PRICE_LOVELACE: lovelaceVar("1000000"),
  // not in contracts section 5; named in repo-layout section 3
  VERIFIER_MODE: z.enum(["stub", "live"]).default("stub"),
  VISION_PROVIDER: optStr(),
  VISION_MODEL: optStr(),
  VISION_BASE_URL: optUrl(),
  VISION_API_KEY: optStr(),
  VISION_FALLBACK_BASE_URL: optUrl(),
  VISION_FALLBACK_MODEL: optStr(),
  VISION_FALLBACK_API_KEY: optStr(),
  // verify Friday: defaults not given in contracts.md
  VISION_TIMEOUT_MS: intVar(20_000),
  VISION_MAX_TOKENS: intVar(1024),
  ENABLE_DRY: z.stringbool().optional(),
  IDEMPOTENCY_CACHE_PATH: z.string().default("./data/idempotency-cache.json"),
  IDEMPOTENCY_TTL_SEC: intVar(7200),
  X_ENGINE_TOKEN_REQUIRED: flag(false),
  ENGINE_TOKEN: tokenVar(),
});

export const VerifierEnvSchema = withDevTokens(
  refineWith(verifierBase, (v, add) => {
    if (v.NODE_ENV === "production" && v.VERIFIER_PAYMENT === "off")
      add("VERIFIER_PAYMENT", "must be on in production");
    // security.md P6: evidence runs use NODE_ENV=production; no unpaid route, engine token required
    if (v.NODE_ENV === "production" && v.ENABLE_DRY === true)
      add("ENABLE_DRY", "must be off in production (dry and extract routes stay absent)");
    if (v.NODE_ENV === "production" && !v.X_ENGINE_TOKEN_REQUIRED)
      add("X_ENGINE_TOKEN_REQUIRED", "must be on in production");
    guardPreprod(v, add);
    if (!(v.ENABLE_DRY ?? v.VERIFIER_PAYMENT === "off")) {
      if (v.SELLER_ADDRESS === undefined) add("SELLER_ADDRESS", "required unless ENABLE_DRY is on");
      if (v.FACILITATOR_URL === undefined)
        add("FACILITATOR_URL", "required unless ENABLE_DRY is on");
    }
    if (v.VERIFIER_MODE === "live") {
      if (v.VISION_BASE_URL === undefined)
        add("VISION_BASE_URL", "required when VERIFIER_MODE=live");
      if (v.VISION_MODEL === undefined) add("VISION_MODEL", "required when VERIFIER_MODE=live");
      if (v.VISION_API_KEY === undefined) add("VISION_API_KEY", "required when VERIFIER_MODE=live");
    }
    if (v.X_ENGINE_TOKEN_REQUIRED && v.ENGINE_TOKEN === undefined) {
      add("ENGINE_TOKEN", "required when X_ENGINE_TOKEN_REQUIRED is on");
    }
  }).transform((v) => ({ ...v, ENABLE_DRY: v.ENABLE_DRY ?? v.VERIFIER_PAYMENT === "off" })),
  { ADMIN_TOKEN: DEV_ADMIN_TOKEN },
);
export type VerifierEnv = z.output<typeof VerifierEnvSchema>;

// ---------------------------------------------------------------- Shell bridge (5.4, ours only)
// The starter/Masumi names (COWORKER_ID, EVE_*, ZAI_*, MPS_URL ...) belong to the starter's own
// loader; the shell stays JavaScript and only the bridge variables are modelled here.
export const ShellBridgeEnvSchema = withDevTokens(
  refineWith(
    z.object({
      NODE_ENV: sharedEnvShape.NODE_ENV,
      NETWORK: sharedEnvShape.NETWORK,
      LOG_LEVEL: sharedEnvShape.LOG_LEVEL,
      ENGINE_URL: z.url().default("http://127.0.0.1:4000"),
      SHELL_TOKEN: tokenVar(),
      SHELL_DECISION_POLL_SEC: intVar(25),
      SHELL_DEADLINE_MARGIN_SEC: intVar(300),
    }),
    () => undefined,
  ),
  { SHELL_TOKEN: DEV_SHELL_TOKEN },
);
export type ShellBridgeEnv = z.output<typeof ShellBridgeEnvSchema>;

// ---------------------------------------------------------------- Hub scripts (5.6)
export const HubEnvSchema = z.object({
  NETWORK: sharedEnvShape.NETWORK,
  TUNNEL_PROVIDER: optStr(),
  TUNNEL_URL_FILE: z.string().default("./tunnel-url.txt"),
  HUB_LAN_IP: optStr(),
});
export type HubEnv = z.output<typeof HubEnvSchema>;

/** Public addresses used only by the read-only funding check. */
export const FundCheckEnvSchema = refineWith(
  z.object({
    NETWORK: sharedEnvShape.NETWORK,
    BLOCKFROST_PROJECT_ID: optStr(),
    MIN_WALLET_LOVELACE: lovelaceVar("10000000"),
    SELLER_ADDRESS: optStr(),
    WALLET_ADDRESS_VBUY: optStr(),
    WALLET_ADDRESS_PAY: optStr(),
    WALLET_ADDRESS_MPS: optStr(),
  }),
  (v, add) => {
    guardPreprod(v, add);
    for (const key of [
      "WALLET_ADDRESS_VBUY",
      "WALLET_ADDRESS_PAY",
      "WALLET_ADDRESS_MPS",
    ] as const) {
      if (v[key] !== undefined && !v[key].startsWith("addr_test1"))
        add(key, "must be a preprod address (addr_test1...)");
    }
  },
);

/** Dev-server configuration, read in Node by Vite only. */
export const WebDevEnvSchema = z.object({
  VITE_ENGINE_URL: optUrl(),
  ENGINE_PORT: intVar(4000),
});

export const SmokeEnvSchema = withDevTokens(
  z.object({
    NODE_ENV: sharedEnvShape.NODE_ENV,
    NETWORK: sharedEnvShape.NETWORK,
    ENGINE_URL: z.url().default("http://127.0.0.1:4000"),
    ADMIN_TOKEN: tokenVar(),
    SHELL_TOKEN: tokenVar(),
    CATALOG_DIR: optStr(),
  }),
  { ADMIN_TOKEN: DEV_ADMIN_TOKEN, SHELL_TOKEN: DEV_SHELL_TOKEN },
);
