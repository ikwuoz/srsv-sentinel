import type { EpochFlow } from "./types.js";
import { feeRegime, issuanceRegime } from "./math.js";

// Re-exported so existing importers keep working; canonical defs live in math.ts.
export { feeRegime, issuanceRegime };

// Attach signal + regimes to a finalized epoch sequence (sorted by n).
export function classify(epochs: EpochFlow[]): EpochFlow[] {
  const fnByN = new Map(epochs.map((e) => [e.n, e.fn]));
  return epochs.map((e) => {
    const a = fnByN.get(e.n - 1);
    const b = fnByN.get(e.n - 2);
    const signal = a !== undefined && b !== undefined ? a + b : null;
    return {
      ...e,
      signal,
      feeRoute: feeRegime(e.fn),
      issuanceRegime: signal === null ? null : issuanceRegime(signal),
      finalized: true,
    };
  });
}
