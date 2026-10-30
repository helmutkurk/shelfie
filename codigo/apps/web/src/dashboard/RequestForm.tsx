import { useMemo, useState } from "react";
import { isAppError, IntakeRejectedDetailsSchema } from "@shelfie/core/browser";
import type { CatalogResponse } from "@shelfie/core/browser";
import { useDeps } from "../deps.js";
import { describeError } from "../lib/messages.js";
import { Button, Field, Select } from "../ui/index.js";

/**
 * B1 / C1: new shelf check. City, store and product are native selects fed by GET /api/catalog;
 * the form sends ids only (ADR-17). The admin token lives in memory (state), never in storage.
 */
export function RequestForm(props: {
  catalog: CatalogResponse | undefined;
  packId: string;
  adminToken: string;
  onAdminToken: (token: string) => void;
  onCreated: (jobId: string) => void;
}) {
  const deps = useDeps();
  const [cityId, setCityId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [ean, setEan] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const city = useMemo(
    () => props.catalog?.cities.find((c) => c.id === cityId),
    [props.catalog, cityId],
  );
  const ready = cityId !== "" && storeId !== "" && ean !== "" && props.adminToken !== "";

  const send = async (input: { storeId: string; ean: string }) => {
    setBusy(true);
    setError(null);
    try {
      const res = await deps.api.createJob(
        {
          packId: props.packId,
          source: "demo",
          externalRef: `demo-${deps.newId("req")}`,
          input: { productEan: input.ean, stores: [{ id: input.storeId }] },
          windowSec: 900,
        },
        props.adminToken,
      );
      props.onCreated(res.job.id);
    } catch (err) {
      if (isAppError(err) && err.code === "intake_rejected") {
        const details = IntakeRejectedDetailsSchema.safeParse(err.details);
        setError(
          details.success
            ? `${err.message} (${details.data.reasons.map((r) => r.code).join(", ")})`
            : err.message,
        );
      } else {
        setError(describeError(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const demoJob = () => {
    const c = props.catalog?.cities[0];
    const store = c?.stores[0];
    const product = c?.products[0];
    if (store && product) void send({ storeId: store.id, ean: product.ean });
  };

  const hint =
    !ready && !busy
      ? props.adminToken === ""
        ? "Enter the operator token below to send."
        : "Choose city, store and product."
      : undefined;
  return (
    <section className="dcard dform" aria-label="New shelf check">
      <h2 className="dh2">New shelf check</h2>
      <form
        className="request-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) void send({ storeId, ean });
        }}
      >
        <Select
          label="City"
          value={cityId}
          placeholder="Select a city"
          options={(props.catalog?.cities ?? []).map((c) => ({ value: c.id, label: c.name }))}
          onChange={(v) => {
            setCityId(v);
            setStoreId("");
            setEan("");
          }}
        />
        <Select
          label="Store"
          value={storeId}
          placeholder="Select a store"
          disabled={!city}
          help={city ? undefined : "Choose a city first"}
          options={(city?.stores ?? []).map((s) => ({
            value: s.id,
            label: `${s.name}, ${s.address}`,
          }))}
          onChange={setStoreId}
        />
        <Select
          label="Product"
          value={ean}
          placeholder="Select a product"
          disabled={storeId === ""}
          help={storeId === "" ? "Choose a store first" : undefined}
          options={(city?.products ?? []).map((p) => ({ value: p.ean, label: p.name }))}
          onChange={setEan}
        />
        <p className="footnote">
          Only stores and products in our Munich catalog can be requested. Time to complete: 15 min
          (fixed in the MVP). Price: shown by the Sokosumi quote.
        </p>
        <Button type="submit" disabled={!ready || busy}>
          {busy ? "Sending…" : "Request check"}
        </Button>
        {hint ? <p className="footnote">{hint}</p> : null}
      </form>

      <section className="operator" aria-label="Operator">
        <h3 className="dh3">Operator</h3>
        <Field
          label="Operator token"
          type="password"
          value={props.adminToken}
          onChange={props.onAdminToken}
          autoComplete="off"
          help="Needed to create a job. Stays in this tab's memory only."
        />
        <Button variant="plain" disabled={props.adminToken === "" || busy} onClick={demoJob}>
          Demo job
        </Button>
      </section>
      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
