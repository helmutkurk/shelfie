import { useMemo } from "react";
import type { CatalogResponse, LedgerEvent } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { formatAda, formatTime } from "../lib/format.js";
import { usePolling } from "../lib/hooks.js";
import { describeError } from "../lib/messages.js";
import { Group, LargeTitle, NavBar, Pill, Row, TxLink } from "../ui/index.js";
import {
  describeJob,
  entriesForJob,
  jobSentence,
  jobStatus,
  receiptLabel,
  taskStatus,
} from "./model.js";

interface Receipt {
  label: string;
  hash: string;
  explorerUrl?: string | undefined;
}

/** B3 / B4: job detail with verdicts, receipts (tx links) and the report. */
export function JobDetail(props: {
  jobId: string;
  catalog: CatalogResponse | undefined;
  ledger: readonly LedgerEvent[];
  onBack: () => void;
}) {
  const { api } = useDeps();
  const { data: view, error } = usePolling((s) => api.job(props.jobId, s), 3000);
  const { data: payouts } = usePolling((s) => api.payouts(props.jobId, s), 3000);

  const entries = useMemo(
    () => (view ? entriesForJob(props.ledger, view) : []),
    [view, props.ledger],
  );

  const receipts = useMemo(() => {
    const out: Receipt[] = [];
    const seen = new Set<string>();
    const add = (r: Receipt) => {
      const key = `${r.label}:${r.hash}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push(r);
    };
    for (const e of entries) {
      const label = receiptLabel(e.kind);
      if (label && e.txHash) add({ label, hash: e.txHash, explorerUrl: e.explorerUrl });
    }
    for (const p of payouts?.payouts ?? []) {
      if (p.txHash)
        add({ label: "Worker payout", hash: p.txHash, explorerUrl: p.explorerUrl ?? undefined });
    }
    for (const [name, hash] of Object.entries(view?.settlement?.txHashes ?? {})) {
      if (hash) add({ label: name, hash });
    }
    return out;
  }, [entries, payouts, view]);

  if (!view) {
    return (
      <section className="screen">
        <NavBar back={{ label: "Requests", onClick: props.onBack }} />
        {error ? (
          <p className="error-text" role="alert">
            {describeError(error)}
          </p>
        ) : (
          <p className="body">Loading…</p>
        )}
      </section>
    );
  }

  const { title, subtitle } = describeJob(view, props.catalog);
  const status = jobStatus(view.job.state);
  const verdicts = entries.filter((e) => e.kind === "VERDICT" || e.kind === "OVERRIDE");
  const report = view.job.reportMd;
  const oos = view.tasks.some((t) => t.acceptedOutcome === "OUT_OF_STOCK");

  return (
    <section className="screen" aria-label="Request detail">
      <NavBar back={{ label: "Requests", onClick: props.onBack }} />
      <LargeTitle
        title={title}
        subtitle={`${subtitle}. Window ends ${formatTime(view.job.windowEndsAt)}.`}
      />
      <p className="status-line">
        <Pill tone={oos && status.tone === "success" ? "success" : status.tone}>
          {oos && status.tone === "success" ? "Not on the shelf" : status.label}
        </Pill>{" "}
        <span>{jobSentence(view)}</span>
      </p>

      <Group label="Progress">
        <Row title="Passed" trailing={`${view.counts.passed} of ${view.job.k}`} />
        <Row title="Open" trailing={String(view.counts.open)} />
        <Row title="Failed attempts" trailing={String(view.counts.failed)} />
      </Group>

      <Group label="Tasks">
        {view.tasks.map((t) => {
          const s = taskStatus(t.state);
          return (
            <Row
              key={t.id}
              title={t.acceptedOutcome === "OUT_OF_STOCK" ? "Not on the shelf" : "Price photo"}
              secondary={`Attempts used: ${t.attempts}`}
              trailing={<Pill tone={s.tone}>{s.label}</Pill>}
            />
          );
        })}
      </Group>

      <Group label="Verdicts" footer="Derived from the ledger. A photo viewer is not built yet.">
        {verdicts.length === 0 ? (
          <Row title="No verdict yet" />
        ) : (
          verdicts.map((e) => (
            <Row
              key={e.seq}
              title={
                e.note.length > 0
                  ? e.note
                  : e.kind === "OVERRIDE"
                    ? "Verdict overridden"
                    : "Verdict"
              }
              secondary={formatTime(e.ts)}
              trailing={
                e.flags["demoOverride"] || e.kind === "OVERRIDE" ? (
                  <Pill tone="warning">Override</Pill>
                ) : undefined
              }
            />
          ))
        )}
      </Group>

      <Group label="Receipts">
        {receipts.length === 0 ? (
          <Row title="No transactions yet" />
        ) : (
          receipts.map((r) => (
            <div className="row" key={`${r.label}:${r.hash}`}>
              <TxLink hash={r.hash} explorerUrl={r.explorerUrl} label={r.label} />
            </div>
          ))
        )}
        {(payouts?.payouts ?? []).map((p) => (
          <Row key={p.id} title="Payout" secondary={p.state} trailing={formatAda(p.amount)} />
        ))}
      </Group>

      <Group label="Report">
        {view.decision === "WITHHOLD" ? (
          <Row title="Result withheld. Your fee is refunded." />
        ) : report ? (
          <div className="group-pad">
            <pre className="report" translate="no">
              {report}
            </pre>
            <a
              className="text-button"
              href={`data:text/markdown;charset=utf-8,${encodeURIComponent(report)}`}
              download={`${view.job.id}-report.md`}
            >
              Download report
            </a>
          </div>
        ) : (
          <Row title="The report appears when the job is decided." />
        )}
      </Group>
    </section>
  );
}
