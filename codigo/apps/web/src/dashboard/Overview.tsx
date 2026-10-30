import type { HealthResponse, JobView } from "@shelfie/core/browser";
import { formatAda } from "../lib/format.js";
import { ACTIVE_JOB_STATES } from "./model.js";

/** Stage overview shown while no request is selected: counts and wallet balances. */
export function Overview(props: {
  jobs: JobView[] | undefined;
  health: HealthResponse | undefined;
}) {
  const jobs = props.jobs ?? [];
  const active = jobs.filter((j) => ACTIVE_JOB_STATES.includes(j.job.state)).length;
  const delivered = jobs.filter((j) => ["DELIVERED", "SETTLED"].includes(j.job.state)).length;
  const photos = jobs.reduce((n, j) => n + j.counts.passed, 0);
  return (
    <section className="dcard dover" aria-label="Overview">
      <h2 className="dh2">Live overview</h2>
      <div className="tiles tiles-big">
        <div className="tile">
          <span className="tile-label">Active requests</span>
          <span className="tile-value">{active}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Delivered</span>
          <span className="tile-value">{delivered}</span>
        </div>
        <div className="tile">
          <span className="tile-label">Verified photos</span>
          <span className="tile-value">{photos}</span>
        </div>
        {props.health ? (
          <div className="tile">
            <span className="tile-label">Payout wallet</span>
            <span className="tile-value">
              {formatAda(props.health.wallets.pay.balanceLovelace)}
            </span>
          </div>
        ) : null}
      </div>
      <p className="dsub">Select a request to see its timeline, transactions and report.</p>
    </section>
  );
}
