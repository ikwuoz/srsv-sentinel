import { describe, expect, it } from "vitest";
import {
  feeRegime,
  issuanceRegime,
  branchDailyYield,
  licensePrice,
  resolutionFee,
  flipNeeds,
  buybackTrajectory,
  supplyProjection,
  SUPPLY_CAP,
  SUPPLY_GENESIS,
  SUPPLY_BUDGET,
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

  it("supply identity obeys the 1B cap and 900M budget", () => {
    expect(SUPPLY_CAP).toBe(1_000_000_000);
    expect(SUPPLY_GENESIS).toBe(100_000_000);
    expect(SUPPLY_BUDGET).toBe(900_000_000);
    // 1M/day gross, no burns → budget exhausts in 900 days ≈ 2.466y
    const { points, exhaustionYear } = supplyProjection({ grossPerDay: 1_000_000, burnPerDay: 0, years: 5 });
    expect(exhaustionYear).toBeCloseTo(900 / 365, 3);
    expect(points[0].sCirc).toBe(SUPPLY_GENESIS);
    expect(points[0].sMax).toBe(SUPPLY_CAP);
    const last = points[points.length - 1];
    expect(last.sCirc).toBeCloseTo(SUPPLY_GENESIS + SUPPLY_BUDGET); // gross capped
    // burns drag max supply down, circ never negative
    const burned = supplyProjection({ grossPerDay: 1_000_000, burnPerDay: 2_000_000, years: 3 });
    const bLast = burned.points[burned.points.length - 1];
    expect(bLast.sMax).toBeLessThan(SUPPLY_CAP);
    expect(bLast.sCirc).toBe(0);
    // no issuance → no exhaustion
    expect(supplyProjection({ grossPerDay: 0, burnPerDay: 0, years: 2 }).exhaustionYear).toBeNull();
    // burns can never exceed what exists: genesis + minted caps them
    const extreme = supplyProjection({ grossPerDay: 1_000_000, burnPerDay: 1_000_000_000, years: 1 });
    const xLast = extreme.points[extreme.points.length - 1];
    expect(xLast.sMax).toBeCloseTo(1_000_000_000 - (100_000_000 + 365_000_000)); // 535M
    expect(xLast.sCirc).toBe(0);
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
