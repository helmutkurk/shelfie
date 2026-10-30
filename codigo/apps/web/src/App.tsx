import { appForPath, usePath } from "./lib/router.js";
import { useEffect } from "react";
import { DashboardApp } from "./dashboard/DashboardApp.js";
import { WorkerApp } from "./worker/WorkerApp.js";

/**
 * `/dashboard` is the customer app; everything else is the worker app (`/w`). The site root
 * opens the static story page (`public/story/`), which links back to both apps.
 */
export function App() {
  const path = usePath();
  useEffect(() => {
    if (path === "/") window.location.replace("/story/index.html");
  }, [path]);
  return appForPath(path) === "dashboard" ? <DashboardApp /> : <WorkerApp />;
}
