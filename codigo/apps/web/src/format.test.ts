import { expect, it } from "vitest";
import { DEFAULT_EXPLORER_TX_BASE, shortAddress, txLink } from "./lib/format.js";

it("uses the shared explorer's canonical hash URL and hides fake hashes", () => {
  expect(txLink("AB".repeat(32), null, DEFAULT_EXPLORER_TX_BASE)).toBe(
    `${DEFAULT_EXPLORER_TX_BASE}${"ab".repeat(32)}`,
  );
  expect(txLink("fake_tx_1", null, DEFAULT_EXPLORER_TX_BASE)).toBeUndefined();
  expect(shortAddress(`addr_test1${"q".repeat(50)}`)).toBe(`addr_test1qq...${"q".repeat(6)}`);
});
