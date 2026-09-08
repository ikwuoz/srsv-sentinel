// Canonical protocol math shared by the sentinel (Node) and the web guide.
// This file must stay dependency-free so it can be compiled standalone to
// web/vendor/math.js via `npm run build:web-math`. Whitepaper refs in comments.

export type Regime = "expansion" | "contraction";

// §4–§5: fee routing moves on sign(F_n) alone; zero/negative = contraction.
export function feeRegime(fn: number): Regime {
  return fn > 0 ? "expansion" : "contraction";
}

// §4.1: issuance moves on signal_n = F_{n-1} + F_{n-2}.
export function issuanceRegime(signal: number): Regime {
  return signal > 0 ? "expansion" : "contraction";
}

// §5.1: a single branch's daily yield = base * m / N.
export function branchDailyYield(base: number, m: number, myBranches: number, n: number): number {
  if (n <= 0 || myBranches <= 0) return 0;
  return (base * m * myBranches) / n;
}

// §7.1: Dutch auction exponential decay from open to floor across 24h.
export function licensePrice(pStart: number, pFloor: number, tHrs: number): number {
  if (pStart <= 0 || pFloor <= 0) return 0;
  const t = Math.min(24, Math.max(0, tHrs));
  return pStart * Math.pow(pFloor / pStart, t / 24);
}

// §9.1: resolution fee — quadratic from floor to ceiling, saturating at pressureSat.
export function resolutionFee(p: number, floor: number, ceiling: number, sat: number): number {
  const x = Math.min(1, Math.max(0, p) / sat);
  return floor + (ceiling - floor) * x * x;
}

// Flip analysis shared by sentinel forecast + web regime widget: given the last
// finalized epoch flow and the current partial flow, how much ETH of buys is
// needed to flip the fee route and the next issuance signal?
export function flipNeeds(prevFn: number, partialFn: number): {
  needFee: number;
  needIssuance: number;
  impliedSignal: number;
} {
  const needFee = partialFn > 0 ? 0 : Math.abs(partialFn);
  const impliedSignal = prevFn + partialFn;
  const needIssuance = impliedSignal > 0 ? 0 : Math.abs(impliedSignal);
  return { needFee, needIssuance, impliedSignal };
}

// §3: supply identity. Hard cap 1B; 100M genesis POL (never withdrawable);
// 900M issuance budget. S_circ(t) = genesis + M(t) − B(t); S_max(t) = cap − B(t).
export const SUPPLY_CAP = 1_000_000_000;
export const SUPPLY_GENESIS = 100_000_000;
export const SUPPLY_BUDGET = SUPPLY_CAP - SUPPLY_GENESIS;

export interface SupplyPoint {
  t: number; // years since launch
  sCirc: number;
  sMax: number;
}

// Project circulating vs max supply under constant gross issuance and burns.
// Gross issuance stops permanently once cumulative M hits the budget
// (closed-loop on recycled fees thereafter); burns continue.
export function supplyProjection(opts: {
  grossPerDay: number;
  burnPerDay: number;
  years: number;
  stepsPerYear?: number;
}): { points: SupplyPoint[]; exhaustionYear: number | null } {
  const gross = Math.max(0, opts.grossPerDay);
  const burn = Math.max(0, opts.burnPerDay);
  const years = Math.max(1, opts.years);
  const steps = Math.max(8, Math.floor(opts.stepsPerYear ?? 12));
  const exhaustionYear = gross > 0 ? SUPPLY_BUDGET / (gross * 365) : null;
  const points: SupplyPoint[] = [];
  const total = Math.ceil(years * steps);
  for (let i = 0; i <= total; i++) {
    const tt = i / steps; // years
    const m = Math.min(SUPPLY_BUDGET, gross * 365 * tt);
    // Burns can't exceed what exists (genesis + minted).
    const b = Math.min(burn * 365 * tt, SUPPLY_GENESIS + m);
    points.push({
      t: tt,
      sCirc: Math.max(0, SUPPLY_GENESIS + m - b),
      sMax: Math.max(0, SUPPLY_CAP - b),
    });
  }
  return { points, exhaustionYear };
}

// §11.1: contraction-vault buyback trajectory. Each hourly tick spends
// min(0.10 * V, 0.002 * R); unspent balance rolls forward; the vault never sells.
export function buybackTrajectory(
  v0: number,
  r: number,
  hours: number,
): { ticks: { h: number; spend: number; cumulative: number; remaining: number }[]; total: number; remaining: number } {
  const ticks: { h: number; spend: number; cumulative: number; remaining: number }[] = [];
  let v = Math.max(0, v0);
  let cumulative = 0;
  const n = Math.max(1, Math.floor(hours));
  for (let h = 1; h <= n; h++) {
    const spend = Math.min(0.1 * v, 0.002 * Math.max(0, r));
    v -= spend;
    cumulative += spend;
    ticks.push({ h, spend, cumulative, remaining: v });
    if (v <= 1e-9) break;
  }
  return { ticks, total: cumulative, remaining: v };
}
