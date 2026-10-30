import { appForPath, navigate, usePath } from "./lib/router.js";
import { useEffect } from "react";
import { DashboardApp } from "./dashboard/DashboardApp.js";
import { WorkerApp } from "./worker/WorkerApp.js";

/** `/dashboard` is the customer app; everything else is the worker app (`/w`). */
export function App() {
  const path = usePath();
  useEffect(() => {
    if (path === "/") navigate("/w");
  }, [path]);
  return appForPath(path) === "dashboard" ? <DashboardApp /> : <WorkerApp />;
}
