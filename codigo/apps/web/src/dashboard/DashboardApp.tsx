import { useCallback, useMemo, useState } from "react";
import { useDeps } from "../deps.js";
import { usePolling, useLedger } from "../lib/hooks.js";
import { ExplorerProvider, Segmented, Toast } from "../ui/index.js";
import { DEFAULT_EXPLORER_TX_BASE } from "../lib/format.js";
import { Banners } from "./Banners.js";
import { JobDetail } from "./JobDetail.js";
import { JobList } from "./JobList.js";
import { LedgerView } from "./LedgerView.js";
import { RequestForm } from "./RequestForm.js";

type View = { name: "jobs" } | { name: "new" } | { name: "job"; id: string } | { name: "ledger" };
type Section = "requests" | "ledger";

/** Customer dashboard (`/dashboard`): stage layout, list-detail from 1024 px. */
export function DashboardApp() {
  const { api, env } = useDeps();
  const [view, setView] = useState<View>({ name: "jobs" });
  const [adminToken, setAdminToken] = useState(""); // memory only (security.md: no localStorage)
  const [toast, setToast] = useState<string | null>(null);
  const stage =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("stage");

  const { data: config } = usePolling((s) => api.config(s), 30_000);
  const { data: health, error: healthError } = usePolling((s) => api.health(s), 3000);
  const { data: catalog } = usePolling((s) => api.catalog(s), 60_000);
  const { data: jobs } = usePolling(async (signal) => {
    const list = await api.jobs(signal);
    // verify Friday: GET /api/jobs carries no counts, so each recent job is read once more.
    return Promise.all(list.jobs.slice(0, 10).map((j) => api.job(j.id, signal)));
  }, 3000);
  const ledger = useLedger();

  const section: Section = view.name === "ledger" ? "ledger" : "requests";
  const detailOpen = view.name !== "jobs";
  const onCreated = useCallback((id: string) => {
    setToast("Request sent");
    setView({ name: "job", id });
  }, []);

  const detail = useMemo(() => {
    switch (view.name) {
      case "new":
        return (
          <RequestForm
            catalog={catalog}
            packId={config?.packId ?? "shelf-check"}
            adminToken={adminToken}
            onAdminToken={setAdminToken}
            onCreated={onCreated}
          />
        );
      case "job":
        return (
          <JobDetail
            jobId={view.id}
            catalog={catalog}
            ledger={ledger.entries}
            onBack={() => setView({ name: "jobs" })}
          />
        );
      case "ledger":
        return <LedgerView entries={ledger.entries} status={ledger.status} health={health} />;
      case "jobs":
        return null;
    }
  }, [view, catalog, config, adminToken, onCreated, ledger.entries, ledger.status, health]);

  return (
    <ExplorerProvider value={config?.explorerTxBase ?? DEFAULT_EXPLORER_TX_BASE}>
      <div className={`app app-dashboard ${stage ? "stage" : ""}`}>
        <Banners
          health={health}
          healthError={healthError}
          config={config}
          demoBadges={env.VITE_DEMO_BADGES}
        />
        <div className="dash" data-detail={detailOpen}>
          <aside className="dash-list">
            <Segmented<Section>
              label="Section"
              value={section}
              onChange={(s) => setView(s === "ledger" ? { name: "ledger" } : { name: "jobs" })}
              options={[
                { value: "requests", label: "Requests" },
                { value: "ledger", label: "Ledger" },
              ]}
            />
            <JobList
              jobs={jobs}
              catalog={catalog}
              selectedId={view.name === "job" ? view.id : null}
              onOpen={(id) => setView({ name: "job", id })}
              onNew={() => setView({ name: "new" })}
            />
            {!stage ? (
              <button
                type="button"
                className="button button-primary new-check"
                onClick={() => setView({ name: "new" })}
              >
                New shelf check
              </button>
            ) : null}
          </aside>
          <div className="dash-detail">{detail}</div>
        </div>
      </div>
      <Toast message={toast} onDone={() => setToast(null)} />
    </ExplorerProvider>
  );
}
