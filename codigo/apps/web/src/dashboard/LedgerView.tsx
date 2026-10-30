import type { HealthResponse, LedgerEvent } from "@shelfie/core/browser";
import type { StreamStatus } from "../lib/sse.js";
import { formatAda, formatTime } from "../lib/format.js";
import { Banner, Group, LargeTitle, Pill, Row, TxLink } from "../ui/index.js";

/** B5 / C4: the ledger as a real table, wallet balances above it. */
export function LedgerView(props: {
  entries: readonly LedgerEvent[];
  status: StreamStatus;
  health: HealthResponse | undefined;
}) {
  const rows = [...props.entries].reverse();
  return (
    <section className="screen" aria-label="Ledger">
      <LargeTitle title="Ledger" />
      {props.status === "reconnecting" ? (
        <Banner tone="warning" title="Reconnecting.">
          The ledger refreshes every few seconds meanwhile.
        </Banner>
      ) : null}
      {props.health ? (
        <Group label="Wallets">
          <Row
            title="Verification wallet"
            trailing={formatAda(props.health.wallets.vbuy.balanceLovelace)}
          />
          <Row
            title="Payout wallet"
            trailing={formatAda(props.health.wallets.pay.balanceLovelace)}
            secondary={`Queue ${props.health.wallets.pay.queueDepth ?? 0}`}
          />
        </Group>
      ) : null}
      <div className="table-wrap">
        <table className="ledger">
          <thead>
            <tr>
              <th scope="col">Seq</th>
              <th scope="col">Time</th>
              <th scope="col">Event</th>
              <th scope="col">Detail</th>
              <th scope="col">Transaction</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>No entries yet.</td>
              </tr>
            ) : (
              rows.map((e) => (
                <tr key={e.seq}>
                  <td className="num">{e.seq}</td>
                  <td className="num">{formatTime(e.ts)}</td>
                  <td>
                    {e.kind} {e.flags["demoOverride"] ? <Pill tone="warning">Override</Pill> : null}
                  </td>
                  <td>{e.note || Object.values(e.refs).join(", ")}</td>
                  <td>
                    {e.txHash ? <TxLink hash={e.txHash} explorerUrl={e.explorerUrl} /> : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
