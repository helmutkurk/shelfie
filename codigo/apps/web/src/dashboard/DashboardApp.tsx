import { useCallback, useState } from "react";
import { useDeps } from "../deps.js";
import { usePolling, useLedger } from "../lib/hooks.js";
import { ExplorerProvider, Logo, Toast } from "../ui/index.js";
import { DEFAULT_EXPLORER_TX_BASE } from "../lib/format.js";
import "../styles/dashboard.css";
import { Banners } from "./Banners.js";
import { DashboardNav } from "./Nav.js";
import type { NavSection } from "./Nav.js";
import { Header } from "./Header.js";
import { JOB_WINDOW } from "./model.js";
import { Overview, OverviewTiles } from "./Overview.js";
import { TxBaseContext } from "./TxChip.js";
import { JobDetail } from "./JobDetail.js";
import { JobList } from "./JobList.js";
import { LedgerView } from "./LedgerView.js";
import type { JobView, OrderView } from "@shelfie/core/browser";
import { OrderStatus } from "./OrderStatus.js";
import { OperatorTools } from "./OperatorTools.js";
import { describeError } from "../lib/messages.js";
import { RequestForm } from "./RequestForm.js";

/** In-app view state (not in the URL). `new` and `job` belong to the Orders section. */
type View =
  | { name: "overview" }
  | { name: "orders" }
  | { name: "new" }
  | { name: "job"; id: string }
  | { name: "ledger" }
  | { name: "operator" };

function sectionOf(view: View): NavSection {
  switch (view.name) {
    case "new":
    case "job":
    case "orders":
      return "orders";
    default:
      return view.name;
  }
}

/** Customer and operator dashboard (`/dashboard`). Sidebar sections; `?stage` keeps the large list and detail. */
export function DashboardApp() {
  const { api, env } = useDeps();
  const [view, setView] = useState<View>({ name: "orders" });
  const [brandToken, setBrandToken] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
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
    return Promise.all(list.jobs.slice(0, JOB_WINDOW).map((j) => api.job(j.id, signal)));
  }, 3000);
  // Keyed inner component resets fetched order state when the access code changes.
  const ledger = useLedger();

  const section = sectionOf(view);
  const gridView = view.name === "new" || view.name === "job" ? view.name : "orders";
  const onCreated = useCallback((id: string) => {
    setToast("Request sent");
    setView({ name: "job", id });
  }, []);
  const onSelect = useCallback((next: NavSection) => {
    setView((cur) => {
      // Orders keeps the open request or the new-order form when you return to it.
      if (next === "orders") return sectionOf(cur) === "orders" ? cur : { name: "orders" };
      return { name: next };
    });
  }, []);
  const explorerBase = config?.explorerTxBase ?? DEFAULT_EXPLORER_TX_BASE;

  return (
    <ExplorerProvider value={explorerBase}>
      <TxBaseContext.Provider value={explorerBase}>
        <div className={`app app-dashboard dsh ${stage ? "stage" : ""}`}>
          <div className="dshell">
            <aside className="dside">
              <Logo />
              <DashboardNav current={section} stage={stage} onSelect={onSelect} />
            </aside>
            <main className="dmain">
              <Header health={health} healthError={healthError} stream={ledger.status} />
              <Banners
                health={health}
                healthError={healthError}
                config={config}
                demoBadges={env.VITE_DEMO_BADGES}
              />

              {section === "overview" ? (
                <Overview
                  jobs={jobs}
                  catalog={catalog}
                  health={health}
                  ledger={ledger.entries}
                  onOpenJob={(id) => setView({ name: "job", id })}
                  onNew={stage ? undefined : () => setView({ name: "new" })}
                />
              ) : null}

              {/* Stays mounted while hidden: the form keeps its access code, selections and
                  idempotency keys when the brand switches sections. */}
              <div className="dpage dorders" hidden={section !== "orders"}>
                <header className="dpage-head">
                  <div>
                    <h1 className="dh1">Orders</h1>
                    <p className="dsub">
                      One shelf check per store. Follow each store to its report.
                    </p>
                  </div>
                </header>
                <div className="dgrid" data-view={gridView}>
                  {!stage ? (
                    <div className="dcol dcol-form">
                      <button
                        type="button"
                        className="dback"
                        onClick={() => setView({ name: "orders" })}
                      >
                        ‹ Requests
                      </button>
                      <RequestForm
                        catalog={catalog}
                        brandToken={brandToken}
                        onBrandToken={setBrandToken}
                        enabled={config?.orders?.enabled ?? false}
                        fake={config?.orders?.fake ?? true}
                        maxStores={config?.orders?.maxStores ?? 5}
                        maxCreditsPerTask={config?.orders?.maxCreditsPerTask}
                        onCreated={(order) => {
                          setOrderId(order.orderId);
                          setView({ name: "orders" });
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="dcol dcol-list">
                    {brandToken ? (
                      <OrdersPanel
                        key={`${brandToken}:${orderId ?? ""}`}
                        token={brandToken}
                        selectedId={orderId}
                        catalog={catalog}
                        onOpenJob={(id) => setView({ name: "job", id })}
                      />
                    ) : (
                      <p className="dsub">
                        Enter your brand access code in New order to see orders.
                      </p>
                    )}
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
                        New order
                      </button>
                    ) : null}
                  </div>
                  <div className="dcol dcol-detail">
                    {view.name === "job" ? (
                      <JobDetail
                        jobId={view.id}
                        catalog={catalog}
                        ledger={ledger.entries}
                        onBack={() => setView({ name: "orders" })}
                      />
                    ) : (
                      <NoRequestSelected jobs={jobs} />
                    )}
                  </div>
                </div>
              </div>

              {section === "ledger" ? (
                <div className="dpage">
                  <LedgerView entries={ledger.entries} status={ledger.status} health={health} />
                </div>
              ) : null}

              {!stage ? (
                <div className="dpage" hidden={section !== "operator"}>
                  <header className="dpage-head">
                    <div>
                      <h1 className="dh1">Operator tools</h1>
                      <p className="dsub">Need the operator token. These are not brand actions.</p>
                    </div>
                  </header>
                  <OperatorTools
                    catalog={catalog}
                    packId={config?.packId ?? "shelf-check"}
                    enabledOverride={config?.demoOverrideEnabled ?? false}
                    ledger={ledger.entries}
                    adminToken={adminToken}
                    onAdminToken={setAdminToken}
                    onCreated={onCreated}
                  />
                </div>
              ) : null}
            </main>
          </div>
        </div>
      </TxBaseContext.Provider>
      <Toast message={toast} onDone={() => setToast(null)} />
    </ExplorerProvider>
  );
}

/** Detail column while no request is open: the same real counts the overview shows. */
function NoRequestSelected(props: { jobs: JobView[] | undefined }) {
  return (
    <section className="dcard dhint" aria-label="Request detail">
      <h2 className="dh2">Request detail</h2>
      <p className="dsub">Select a request to see its timeline, transactions and report.</p>
      <OverviewTiles jobs={props.jobs} />
    </section>
  );
}

function OrdersPanel(props: {
  token: string;
  selectedId: string | null;
  catalog: Parameters<typeof OrderStatus>[0]["catalog"];
  onOpenJob: (id: string) => void;
}) {
  const { api } = useDeps();
  const { data, error } = usePolling(async (signal) => {
    const list = await api.orders(props.token, signal);
    if (props.selectedId && !list.orders.some((o) => o.orderId === props.selectedId)) {
      const selected = await api.order(props.selectedId, props.token, signal);
      return { orders: [selected, ...list.orders] };
    }
    return list;
  }, 3000);
  const orders: OrderView[] = data?.orders ?? [];
  return (
    <section aria-label="Orders" className="dstack">
      {error ? (
        <p role="alert" className="form-error">
          {describeError(error)}
        </p>
      ) : null}
      {orders.map((order) => (
        <OrderStatus
          key={order.orderId}
          order={order}
          catalog={props.catalog}
          onOpenJob={props.onOpenJob}
        />
      ))}
      {data && orders.length === 0 ? <p className="dsub">No orders yet.</p> : null}
    </section>
  );
}
