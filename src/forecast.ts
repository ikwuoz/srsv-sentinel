import type { EpochFlow, SignalOutput } from "./types.js";
import { flipNeeds } from "./math.js";

// Intra-epoch forecast: how much ETH is needed to flip the current fee route
// and the next issuance signal, plus a simple momentum-based flip probability.
export function forecast(
  finalized: EpochFlow[],
  partialFn: number,
  partialBuys = 0,
  partialSells = 0,
): SignalOutput {
  const last = finalized[finalized.length - 1];
  const epoch = last ? last.n + 1 : 0;
  const prevFn = last?.fn ?? 0;

  // Fee route flips on sign(partialFn): sells pressure needs +ETH buys to overcome.
  // Next issuance signal = prevFn (F_{n-1}) + partialFn (F_n proxy).
  const { needFee, needIssuance, impliedSignal } = flipNeeds(prevFn, partialFn);
  const ethToFlipFee = needFee + (partialFn > 0 ? 0 : 1e-9);
  const ethToFlipIssuance = needIssuance + (impliedSignal > 0 ? 0 : 1e-9);

  // Heuristic probability: closer to flip + strong buy momentum => higher p.
  const total = partialBuys + partialSells;
  const momentum = total > 0 ? partialBuys / total : 0.5; // 0..1 buy share
  const pFlipFee = clamp01(0.5 * momentum + 0.5 * proximity(partialFn));
  const pFlipIssuance = clamp01(0.5 * momentum + 0.5 * proximity(impliedSignal));

  return {
    epoch,
    fn: last?.fn ?? null,
    signal: last?.signal ?? null,
    feeRoute: last?.feeRoute ?? null,
    issuanceRegime: last?.issuanceRegime ?? null,
    partialFn,
    ethToFlipFee: round(ethToFlipFee),
    ethToFlipIssuance: round(ethToFlipIssuance),
    pFlipFee: round(pFlipFee, 3),
    pFlipIssuance: round(pFlipIssuance, 3),
    updatedAt: new Date().toISOString(),
  };
}

function proximity(x: number): number {
  // Near zero => near flip => ~1; far => ~0. Scale: 5 ETH band.
  return Math.max(0, 1 - Math.abs(x) / 5);
}
function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}
function round(x: number, d = 4): number {
  return Number(x.toFixed(d));
}
