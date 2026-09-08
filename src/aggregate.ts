import type { EpochFlow, Swap } from "./types.js";

// Bucket swaps into fixed-length epochs starting at genesisTime.
export function aggregate(swaps: Swap[], genesisTime: number, epochLenSec: number): EpochFlow[] {
  if (swaps.length === 0) return [];
  const sorted = [...swaps].sort((a, b) => a.timestamp - b.timestamp);
  const epochOf = (t: number) => Math.floor((t - genesisTime) / epochLenSec);
  const byEpoch = new Map<number, Swap[]>();
  for (const s of sorted) {
    if (s.timestamp < genesisTime) continue;
    const n = epochOf(s.timestamp);
    if (!byEpoch.has(n)) byEpoch.set(n, []);
    byEpoch.get(n)!.push(s);
  }
  const out: EpochFlow[] = [];
  for (const [n, list] of [...byEpoch.entries()].sort((a, b) => a[0] - b[0])) {
    let buys = 0;
    let sells = 0;
    for (const s of list) {
      if (s.isBuy) buys += Math.abs(s.ethDelta);
      else sells += Math.abs(s.ethDelta);
    }
    out.push({
      n,
      start: genesisTime + n * epochLenSec,
      end: genesisTime + (n + 1) * epochLenSec,
      buys,
      sells,
      fn: buys - sells,
      signal: null,
      feeRoute: null,
      issuanceRegime: null,
      finalized: false,
    });
  }
  return out;
}
