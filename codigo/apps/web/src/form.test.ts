// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RequestForm } from "./dashboard/RequestForm.js";
import { catalogFixture, errorResponse, h, makeDeps, renderWithDeps } from "./testing.js";
import type { FetchRoutes } from "./testing.js";

afterEach(cleanup);

function setup(routes: FetchRoutes = {}, adminToken = "") {
  const created: string[] = [];
  const tokens: string[] = [];
  const { deps, calls } = makeDeps({ routes });
  renderWithDeps(
    h(RequestForm, {
      catalog: catalogFixture(),
      packId: "shelf-check",
      adminToken,
      onAdminToken: (t: string) => void tokens.push(t),
      onCreated: (id: string) => void created.push(id),
    }),
    deps,
  );
  return { created, calls };
}

const pick = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });

describe("request form", () => {
  it("is made of dropdowns only: no free-text input inside the request form", () => {
    setup();
    const form = document.querySelector("form.request-form") as HTMLFormElement;
    expect(form).not.toBeNull();
    expect(form.querySelectorAll("select")).toHaveLength(3);
    expect(form.querySelectorAll("input, textarea")).toHaveLength(0);
  });

  it("enables store after city and product after store; button waits for all three", () => {
    setup({}, "token");
    const store = screen.getByLabelText<HTMLSelectElement>("Store");
    const product = screen.getByLabelText<HTMLSelectElement>("Product");
    const button = screen.getByRole<HTMLButtonElement>("button", { name: "Request check" });
    expect(store.disabled).toBe(true);
    expect(product.disabled).toBe(true);
    pick("City", "munich");
    expect(store.disabled).toBe(false);
    expect(product.disabled).toBe(true);
    pick("Store", "s1");
    expect(product.disabled).toBe(false);
    expect(button.disabled).toBe(true);
    pick("Product", "4000000000000");
    expect(button.disabled).toBe(false);
  });

  it("sends ids only, with the admin token header", async () => {
    const { created, calls } = setup(
      {
        "POST /api/jobs": {
          job: {
            id: "job_01",
            state: "COLLECTING",
            n: 1,
            k: 1,
            windowEndsAt: "2026-10-30T10:15:00Z",
          },
          tasks: [],
        },
      },
      "token",
    );
    pick("City", "munich");
    pick("Store", "s1");
    pick("Product", "4000000000000");
    fireEvent.click(screen.getByRole("button", { name: "Request check" }));
    await waitFor(() => expect(created).toEqual(["job_01"]));
    const call = calls.find((c) => c.method === "POST");
    expect(call?.headers["X-Admin-Token"]).toBe("token");
    expect(call?.body).toEqual({
      packId: "shelf-check",
      source: "demo",
      externalRef: "demo-req_01",
      input: { productEan: "4000000000000", stores: [{ id: "s1" }] },
      windowSec: 900,
    });
  });

  it("demo job uses the first catalog store and product", async () => {
    const { created, calls } = setup(
      {
        "POST /api/jobs": {
          job: {
            id: "job_02",
            state: "COLLECTING",
            n: 1,
            k: 1,
            windowEndsAt: "2026-10-30T10:15:00Z",
          },
          tasks: [],
        },
      },
      "token",
    );
    fireEvent.click(screen.getByRole("button", { name: "Demo job" }));
    await waitFor(() => expect(created).toEqual(["job_02"]));
    expect((calls[0]?.body as { input: unknown }).input).toEqual({
      productEan: "4000000000000",
      stores: [{ id: "s1" }],
    });
  });

  it("shows intake rejection reasons", async () => {
    setup(
      {
        "POST /api/jobs": () =>
          errorResponse("intake_rejected", "Store is not in the supported Munich catalog.", 422, {
            reasons: [{ code: "unknown_store", field: "input.stores[0].id" }],
          }),
      },
      "token",
    );
    fireEvent.click(screen.getByRole("button", { name: "Demo job" }));
    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/unknown_store/)).toBeTruthy();
  });
});
