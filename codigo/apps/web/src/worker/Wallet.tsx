import type { SubmissionView, TaskListItem } from "@shelfie/core/browser";
import { formatAda } from "../lib/format.js";
import { S } from "../lib/messages.js";
import { Button, EmptyState, Group, Row, TxLink } from "../ui/index.js";
import { AddressCopy } from "./AddressCopy.js";
import { payoutStatusWords } from "./Result.js";

/** The latest photo of this page session, with the verdict once Result has polled it. */
export interface SessionResult {
  task: TaskListItem;
  submissionId: string;
  view: SubmissionView | null;
}

/**
 * Wallet tab: the stored payout address, what payouts are, and the latest result of this session.
 * No balance and no fiat amounts: there is no balance or history endpoint yet.
 */
export function Wallet(props: {
  payoutAddress: string | null;
  result: SessionResult | null;
  onGoProfile: () => void;
}) {
  return (
    <section className="tab-section" aria-labelledby="wallet-title">
      <div className="page-head">
        <h1 id="wallet-title">Wallet</h1>
      </div>

      <div className="address-card">
        <p className="card-label">Payout address</p>
        {props.payoutAddress ? (
          <AddressCopy address={props.payoutAddress} />
        ) : (
          <>
            <p className="body">No payout address yet.</p>
            <Button variant="plain" onClick={props.onGoProfile}>
              Add a payout address
            </Button>
          </>
        )}
        <p className="footnote">{S.walletNote}</p>
      </div>

      <h2 className="section-title">Latest result in this session</h2>
      {props.result ? (
        <SessionPayout result={props.result} />
      ) : (
        <EmptyState
          text="No verified photo in this session yet."
          help="When a photo is checked, its payout status and explorer link show here."
        />
      )}
      <p className="footnote wallet-history">{S.walletHistoryNote}</p>
    </section>
  );
}

function SessionPayout(props: { result: SessionResult }) {
  const { task, view } = props.result;
  let status: string;
  if (view === null) {
    status = "Checking your photo";
  } else if (view.state === "PASSED") {
    status = payoutStatusWords(view.payout?.state);
  } else if (view.state === "REJECTED" || view.state === "ERROR_FINAL") {
    status = "Not accepted. No payout for this photo.";
  } else {
    status = "Checking your photo";
  }
  const txHash = view?.payout?.txHash ?? null;
  return (
    <Group>
      <Row
        title={task.productName}
        secondary={`${task.storeName} · reward`}
        trailing={formatAda(task.payoutAmount)}
      />
      <Row title="Status" trailing={status} />
      {txHash ? (
        <div className="row tx-row">
          <TxLink hash={txHash} explorerUrl={view?.payout?.explorerUrl} label="Tx" />
        </div>
      ) : null}
    </Group>
  );
}
