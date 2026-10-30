import { useSyncExternalStore } from "react";

// A tiny router: two apps, no nested routes. Customer routes beyond /dashboard are not in
// contracts.md, so the dashboard keeps its views in component state.

function subscribe(listener: () => void): () => void {
  window.addEventListener("popstate", listener);
  window.addEventListener("shelfie:navigate", listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener("shelfie:navigate", listener);
  };
}
const getPath = () => window.location.pathname;

export function usePath(): string {
  return useSyncExternalStore(subscribe, getPath, () => "/");
}

export function navigate(to: string): void {
  window.history.pushState(null, "", to);
  window.dispatchEvent(new Event("shelfie:navigate"));
}

export type AppName = "worker" | "dashboard";

export function appForPath(path: string): AppName {
  return path === "/dashboard" || path.startsWith("/dashboard/") ? "dashboard" : "worker";
}
