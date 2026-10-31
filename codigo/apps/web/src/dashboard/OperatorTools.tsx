import { useState } from "react";
import type { CatalogResponse, LedgerEvent } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { describeError } from "../lib/messages.js";
import { Button, Select } from "../ui/index.js";

export function OperatorTools(props: {
  catalog: CatalogResponse | undefined;
  packId: string;
  enabledOverride: boolean;
  ledger: readonly LedgerEvent[];
  /** The operator token from the dashboard gate (memory only); it is checked before this renders. */
  adminToken: string;
  onCreated: (jobId: string) => void;
}) {
  const { api, newId } = useDeps();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const demo = async () => {
    const city = props.catalog?.cities.find((c) => c.id === "munich");
    const store = city?.stores[0];
    const product = city?.products[0];
    if (!store || !product) return;
    setBusy(true);
    setError(null);
    try {
      const job = await api.createJob(
        {
          packId: props.packId,
          source: "demo",
          externalRef: `demo-${newId("req")}`,
          input: { productEan: product.ean, stores: [{ id: store.id }] },
        },
        props.adminToken,
      );
      props.onCreated(job.job.id);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };
  const override = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.override(submissionId, props.adminToken);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setBusy(false);
    }
  };
  const submissions = [
    ...new Set(
      props.ledger
        .filter((e) => e.kind === "VERDICT" && e.note.toUpperCase().startsWith("FAIL"))
        .flatMap((e) => (e.refs["submissionId"] ? [e.refs["submissionId"]] : [])),
    ),
  ];
  return (
    <section className="dcard operator" aria-label="Operator tools">
      <h2 className="dh2">Test job</h2>
      <p className="dsub">
        Creates a job directly in the engine, without a Sokosumi Task or Masumi escrow: use it to
        test the worker app, the verifier and the worker payout. The verifier fee (x402) and the
        payout for a passing photo are real preprod payments; no brand fee is charged or refunded.
        Real brand orders come from /b.
      </p>
      <Button variant="plain" disabled={busy || !props.catalog} onClick={() => void demo()}>
        Create test job
      </Button>
      <h2 className="dh2">Override</h2>
      {props.enabledOverride ? (
        <>
          <Select
            label="Rejected submission"
            value={submissionId}
            placeholder="Select a submission"
            options={submissions.map((id) => ({ value: id, label: id }))}
            onChange={setSubmissionId}
          />
          <Button variant="plain" disabled={busy || !submissionId} onClick={() => void override()}>
            Override to pass
          </Button>
        </>
      ) : (
        <p className="footnote">Override is disabled on this engine.</p>
      )}
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}
