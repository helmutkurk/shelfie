// Theme preference: light, dark or system. Only this one value is stored (key shelfie.theme),
// never anything else. The palette lives in styles/tokens.css: :root is light and
// [data-theme="dark"] is dark. "system" follows the OS setting and reacts to changes.

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "shelfie.theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

export function isThemePref(value: unknown): value is ThemePref {
  return value === "light" || value === "dark" || value === "system";
}

/** Stored preference, or "system" when nothing valid is stored or storage is blocked. */
export function loadThemePref(): ThemePref {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePref(stored) ? stored : "system";
  } catch {
    return "system";
  }
}

/** Saves the preference. Blocked storage (private mode) is ignored: the choice still applies. */
export function saveThemePref(pref: ThemePref): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage unavailable: nothing to persist.
  }
}

function darkQuery(): MediaQueryList | null {
  return typeof window.matchMedia === "function" ? window.matchMedia(DARK_QUERY) : null;
}

function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref !== "system") return pref;
  return darkQuery()?.matches ? "dark" : "light";
}

let stopFollowingSystem: (() => void) | null = null;

/**
 * Sets document.documentElement.dataset.theme to "light" or "dark". For "system" it follows
 * prefers-color-scheme until another preference is applied. Returns the resolved theme.
 */
export function applyTheme(pref: ThemePref): ResolvedTheme {
  stopFollowingSystem?.();
  stopFollowingSystem = null;

  const set = (): ResolvedTheme => {
    const resolved = resolveTheme(pref);
    document.documentElement.dataset.theme = resolved;
    return resolved;
  };
  const resolved = set();

  if (pref === "system") {
    const mql = darkQuery();
    if (mql) {
      const onChange = (): void => {
        set();
      };
      mql.addEventListener("change", onChange);
      stopFollowingSystem = () => mql.removeEventListener("change", onChange);
    }
  }
  return resolved;
}
