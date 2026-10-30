// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePref,
  loadThemePref,
  saveThemePref,
} from "./ui/theme.js";

type Listener = (event: { matches: boolean }) => void;

/** matchMedia stub for "(prefers-color-scheme: dark)". change() flips it and notifies listeners. */
function stubDarkQuery(matches: boolean) {
  const listeners = new Set<Listener>();
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn((_type: string, listener: Listener) => {
      listeners.add(listener);
    }),
    removeEventListener: vi.fn((_type: string, listener: Listener) => {
      listeners.delete(listener);
    }),
  };
  window.matchMedia = vi.fn(() => mql) as unknown as typeof window.matchMedia;
  return {
    mql,
    listenerCount: () => listeners.size,
    change(next: boolean) {
      mql.matches = next;
      for (const listener of listeners) listener({ matches: next });
    },
  };
}

// jsdom has no matchMedia; remember whatever is there and put it back after each test.
const originalMatchMedia: unknown = Reflect.get(window, "matchMedia");

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  applyTheme("light"); // drops any system listener left by a test
  window.localStorage.clear();
  Reflect.set(window, "matchMedia", originalMatchMedia);
  vi.restoreAllMocks();
});

describe("theme preference storage", () => {
  it("defaults to system when nothing is stored", () => {
    expect(loadThemePref()).toBe("system");
  });

  it("saves and loads light and dark under the shelfie.theme key", () => {
    saveThemePref("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(loadThemePref()).toBe("dark");

    saveThemePref("light");
    expect(loadThemePref()).toBe("light");
  });

  it("treats an invalid stored value as system", () => {
    window.localStorage.setItem(THEME_STORAGE_KEY, "purple");
    expect(loadThemePref()).toBe("system");
    window.localStorage.setItem(THEME_STORAGE_KEY, "");
    expect(loadThemePref()).toBe("system");
  });

  it("falls back to system and does not throw when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(loadThemePref()).toBe("system");
    expect(() => saveThemePref("dark")).not.toThrow();
  });

  it("accepts only the three preference values", () => {
    expect(isThemePref("light")).toBe(true);
    expect(isThemePref("dark")).toBe(true);
    expect(isThemePref("system")).toBe(true);
    expect(isThemePref("Dark")).toBe(false);
    expect(isThemePref(null)).toBe(false);
  });
});

describe("applyTheme", () => {
  it("sets data-theme to light or dark", () => {
    stubDarkQuery(false);
    expect(applyTheme("dark")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");

    expect(applyTheme("light")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("resolves system through matchMedia", () => {
    stubDarkQuery(true);
    expect(applyTheme("system")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("resolves system to light when the OS is light", () => {
    stubDarkQuery(false);
    expect(applyTheme("system")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("resolves system to light when matchMedia is unavailable", () => {
    window.matchMedia = undefined as unknown as typeof window.matchMedia;
    expect(applyTheme("system")).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("follows OS changes while system is chosen, and stops once another choice is applied", () => {
    const query = stubDarkQuery(false);
    applyTheme("system");
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(query.listenerCount()).toBe(1);

    query.change(true);
    expect(document.documentElement.dataset.theme).toBe("dark");

    query.change(false);
    expect(document.documentElement.dataset.theme).toBe("light");

    applyTheme("dark");
    expect(query.listenerCount()).toBe(0);
    query.change(false);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});
