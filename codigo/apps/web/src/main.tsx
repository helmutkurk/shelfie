import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.js";
import { createBrowserDeps, DepsProvider } from "./deps.js";
import { readWebEnv } from "./lib/env.js";
import { applyTheme, loadThemePref } from "./ui/theme.js";
import "./styles/tokens.css";
import "./styles/components.css";

// Theme before the first render, so the page never paints the wrong palette.
applyTheme(loadThemePref());

// Only VITE_ names that are public by design reach the bundle (contracts.md 5.5).
const env = readWebEnv({
  VITE_API_BASE: import.meta.env.VITE_API_BASE,
  VITE_DEMO_BADGES: import.meta.env.VITE_DEMO_BADGES,
});

const root = document.getElementById("root");
if (!root) throw new Error("#root missing");
createRoot(root).render(
  <StrictMode>
    <DepsProvider value={createBrowserDeps(env)}>
      <App />
    </DepsProvider>
  </StrictMode>,
);
