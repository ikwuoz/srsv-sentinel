import { describe, expect, it } from "vitest";
import { aggregate } from "../src/aggregate.js";
import { classify, feeRegime, issuanceRegime } from "../src/classify.js";
import { forecast } from "../src/forecast.js";

const G = 1_000_000;
const E = 86_400;

describe("aggregate", () => {
  it("computes F_n = buys - sells", () => {
    const epochs = aggregate(
      [
        { tx: "a", timestamp: G + 10, ethDelta: 2, isBuy: true },
        { tx: "b", timestamp: G + 20, ethDelta: -0.5, isBuy: false },
      ],
      G,
      E,
    );
    expect(epochs).toHaveLength(1);
    expect(epochs[0].fn).toBeCloseTo(1.5);
  });
});

describe("classify", () => {
  it("fee route: zero is contraction", () => {
    expect(feeRegime(0)).toBe("contraction");
    expect(feeRegime(0.01)).toBe("expansion");
  });
  it("issuance uses trailing two epochs; spike alone cannot flip", () => {
    const epochs = classify([
      { n: 0, start: 0, end: 1, buys: 1, sells: 2, fn: -1, signal: null, feeRoute: null, issuanceRegime: null, finalized: false },
      { n: 1, start: 0, end: 1, buys: 1, sells: 2, fn: -1, signal: null, feeRoute: null, issuanceRegime: null, finalized: false },
      { n: 2, start: 0, end: 1, buys: 10, sells: 0, fn: 10, signal: null, feeRoute: null, issuanceRegime: null, finalized: false },
    ]);
    // signal_2 = F1+F0 = -2 → contraction despite F2 spike
    expect(epochs[2].signal).toBeCloseTo(-2);
    expect(epochs[2].issuanceRegime).toBe("contraction");
    expect(issuanceRegime(0.1)).toBe("expansion");
  });
});

describe("forecast", () => {
  it("reports ETH needed to flip", () => {
    const finalized = classify([
      { n: 0, start: 0, end: 1, buys: 3, sells: 1, fn: 2, signal: null, feeRoute: null, issuanceRegime: null, finalized: false },
      { n: 1, start: 0, end: 1, buys: 3, sells: 1, fn: 2, signal: null, feeRoute: null, issuanceRegime: null, finalized: false },
    ]);
    const sig = forecast(finalized, -1.5, 0.5, 2);
    expect(sig.ethToFlipFee).toBeCloseTo(1.5, 3);
    // implied signal = 2 + (-1.5) = 0.5 > 0 → no ETH needed for issuance
    expect(sig.ethToFlipIssuance).toBe(0);
  });
});
