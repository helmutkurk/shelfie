import type { ConfigResponse, HealthResponse } from "@shelfie/core/browser";
import type { StreamStatus } from "../lib/sse.js";
import { Segmented } from "../ui/index.js";

export type Section = "requests" | "ledger";

/** Brand header: wordmark, network pill, connection status and the section switch. */
export function Header(props: {
  health: HealthResponse | undefined;
  healthError: unknown;
  config: ConfigResponse | undefined;
  stream: StreamStatus;
  section: Section;
  onSection: (s: Section) => void;
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
      <div className="dbrand">
        <span className="dlogo" aria-hidden="true" />
        <span className="dword">Shelfie</span>
        <span className="dnet">Cardano preprod</span>
      </div>
      <div className="dhead-end">
        <span className={`dstatus dstatus-${state}`} role="status">
          <span className="dot" aria-hidden="true" />
          {label}
          {props.stream === "reconnecting" ? " · ledger reconnecting" : ""}
        </span>
        <Segmented<Section>
          label="Section"
          value={props.section}
          onChange={props.onSection}
          options={[
            { value: "requests", label: "Requests" },
            { value: "ledger", label: "Ledger" },
          ]}
        />
      </div>
    </header>
  );
}
