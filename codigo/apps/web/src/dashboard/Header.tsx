import type { HealthResponse } from "@shelfie/core/browser";
import type { StreamStatus } from "../lib/sse.js";
/** Top strip: engine status and network. Banners sit below it. */
export function Header(props: {
  health: HealthResponse | undefined;
  healthError: unknown;
  stream: StreamStatus;
}) {
  const { health } = props;
  const state: "ok" | "warn" | "down" = health
    ? health.ok && health.verifier === "up"
      ? "ok"
      : "warn"
    : props.healthError !== undefined
      ? "down"
      : "warn";
  const label = health
    ? health.ok
      ? health.verifier === "up"
        ? "Engine connected"
        : "Verifier down"
      : "Engine degraded"
    : props.healthError !== undefined
      ? "Engine offline"
      : "Connecting";
  return (
    <header className="dhead">
      <div className="dhead-status">
        <span className={`dstatus dstatus-${state}`} role="status">
          <span className="dot" aria-hidden="true" />
          {label}
          {props.stream === "reconnecting" ? " · ledger reconnecting" : ""}
        </span>
        <span className="dnet">Cardano preprod</span>
      </div>
    </header>
  );
}
