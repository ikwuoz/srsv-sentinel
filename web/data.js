// Canonical math lives in ../src/math.ts (single source of truth) and is
// compiled to ./vendor/math.js via `npm run build:web-math`. This module adds
// the illustrative pre-launch placeholders + mock series on top of it.
import {
  branchDailyYield,
  licensePrice,
  resolutionFee,
  feeRegime,
  issuanceRegime,
  flipNeeds,
  buybackTrajectory,
  supplyProjection,
  SUPPLY_CAP,
  SUPPLY_GENESIS,
  SUPPLY_BUDGET,
} from "./vendor/math.js";

export {
  branchDailyYield,
  licensePrice,
  resolutionFee,
  feeRegime,
  issuanceRegime,
  flipNeeds,
  buybackTrajectory,
  supplyProjection,
  SUPPLY_CAP,
  SUPPLY_GENESIS,
  SUPPLY_BUDGET,
};

// Illustrative pre-launch placeholders. Whitepaper v0.1 redacts exact numbers;
// these ranges are sensible + deterministic so graphs feel real. Flagged as such in UI.
export const PARAMS = {
  baseIssuanceOptions: [500_000, 1_000_000, 2_000_000], // $STANDARD / day
  defaultBase: 1_000_000,
  multiplierMin: 0.1,
  multiplierMax: 3.0,
  licensesPerDay: 100,
  maxLicensesPerCharterPerDay: 3,
  licenseOpenMult: 2, // Pstart = 2 x Plast
  charterOpenMult: 3, // Pstart = 3 x Plast
  branchesMax: 10,
  systemBranchesDefault: 12_000,
  // Resolution fee: quadratic floor -> ceiling over pressure P = W/(D+W)
  feeFloor: 0.005, // 0.5% quiet
  feeCeiling: 0.25, // 25% bank run
  pressureSat: 0.3, // saturates at 30% exiting in 7d
  presets: { quiet: 0.01, elevated: 0.05, heavy: 0.12, bankrun: 0.28 },
};

// Deterministic PRNG (same family as sentinel mock) for stable mock series.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 30-day mock closes for license auction (in $STANDARD), regime-aware wobble.
export function mockLicenseCloses(seed = 7) {
  const rnd = mulberry32(seed);
  const out = [];
  let p = 4200;
  for (let d = 0; d < 30; d++) {
    const regime = d % 7 < 4 ? 1 : -1;
    p = Math.max(900, p * (1 + regime * 0.06 * rnd() - 0.025 + (rnd() - 0.5) * 0.08));
    out.push(Math.round(p));
  }
  return out;
}

// Back-compat wrapper used by app.js: feeAt(P, PARAMS).
export const feeAt = (P, { feeFloor, feeCeiling, pressureSat }) =>
  resolutionFee(P, feeFloor, feeCeiling, pressureSat);
