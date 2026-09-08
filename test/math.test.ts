import { describe, expect, it } from "vitest";
import {
  feeRegime,
  issuanceRegime,
  branchDailyYield,
  licensePrice,
  resolutionFee,
  flipNeeds,
  buybackTrajectory,
} from "../src/math.js";

describe("math (canonical, also compiled to web/vendor)", () => {
  it("yield splits base*m across N branches", () => {
    expect(branchDailyYield(1_000_000, 1, 3, 12_000)).toBeCloseTo(250);
    expect(branchDailyYield(1_000_000, 1, 0, 12_000)).toBe(0);
    expect(branchDailyYield(1_000_000, 1, 3, 0)).toBe(0);
  });

  it("license decay hits floor at 24h, open at 0h", () => {
    expect(licensePrice(8400, 924, 0)).toBeCloseTo(8400);
    expect(licensePrice(8400, 924, 24)).toBeCloseTo(924);
    expect(licensePrice(8400, 924, 30)).toBeCloseTo(924); // clamped
  });

  it("resolution fee is quadratic floor->ceiling", () => {
    expect(resolutionFee(0, 0.005, 0.25, 0.3)).toBeCloseTo(0.005);
    expect(resolutionFee(0.3, 0.005, 0.25, 0.3)).toBeCloseTo(0.25);
    expect(resolutionFee(99, 0.005, 0.25, 0.3)).toBeCloseTo(0.25); // saturates
    expect(feeRegime(0)).toBe("contraction");
    expect(issuanceRegime(0.01)).toBe("expansion");
  });

  it("flipNeeds matches whitepaper signal definition", () => {
    const f = flipNeeds(2, -1.5);
    expect(f.impliedSignal).toBeCloseTo(0.5);
    expect(f.needFee).toBeCloseTo(1.5);
    expect(f.needIssuance).toBe(0);
  });

  it("buyback spends min(10% V, 0.2% R) per tick and drains", () => {
    const { ticks, total, remaining } = buybackTrajectory(100, 10_000, 3);
    // tick1: min(10, 20) = 10
    expect(ticks[0].spend).toBeCloseTo(10);
    // tick2: min(9, 20) = 9
    expect(ticks[1].spend).toBeCloseTo(9);
    expect(total).toBeCloseTo(10 + 9 + 8.1);
    expect(remaining).toBeCloseTo(100 - total);
    // thin pool caps spend at 0.2% of R
    const thin = buybackTrajectory(10_000, 1_000, 2);
    expect(thin.ticks[0].spend).toBeCloseTo(2);
  });
});
