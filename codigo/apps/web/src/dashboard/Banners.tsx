import type { ConfigResponse, HealthResponse } from "@shelfie/core/browser";
import { isAppError } from "@shelfie/core/browser";
import { Banner } from "../ui/index.js";

/** Mandatory system-state banners (.claude/rules/web.md): fake payments, verifier stub, override. */
export function Banners(props: {
  health: HealthResponse | undefined;
  healthError: unknown;
  config: ConfigResponse | undefined;
  demoBadges: boolean;
}) {
  const { health, config } = props;
  const lowBalance =
    health !== undefined &&
    // verify Friday: /api/health has no MIN_WALLET_LOVELACE; only an empty wallet is flagged here.
    (health.wallets.pay.balanceLovelace === "0" || health.wallets.vbuy.balanceLovelace === "0");
  return (
    <div className="banners">
      {props.healthError !== undefined && !health ? (
        <Banner tone="error" title="Engine not reachable.">
          {isAppError(props.healthError)
            ? props.healthError.message
            : "Check that the engine is running."}
        </Banner>
      ) : null}
      {health?.fakes.payments ? (
        <Banner tone="error" title="Fake payments.">
          No real transactions are made. Do not use this run as evidence.
        </Banner>
      ) : null}
      {health?.fakes.verifier ? (
        <Banner tone="error" title="Verifier stub.">
          Verdicts do not come from the real vision model.
        </Banner>
      ) : null}
      {config?.demoOverrideEnabled || props.demoBadges ? (
        <Banner tone="warning" title="Operator override enabled.">
          A verdict can be changed by hand. Overrides are marked in the ledger.
        </Banner>
      ) : null}
      {lowBalance ? (
        <Banner tone="error" title="A wallet is empty.">
          Payouts stay queued until it is funded.
        </Banner>
      ) : null}
    </div>
  );
}
