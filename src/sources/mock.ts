// Deterministic mock flow source (pre-launch stand-in for the v4 pool).
// Scenarios: trend | chop | bankrun. Seeded PRNG so runs are reproducible.
import type { Swap } from "../types.js";

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Scenario = "trend" | "chop" | "bankrun";

export function genSwaps(opts: {
  genesisTime: number;
  epochLenSec: number;
  epochs?: number;
  swapsPerEpoch?: number;
  scenario?: Scenario;
  seed?: number;
}): Swap[] {
  const { genesisTime, epochLenSec, epochs = 5, swapsPerEpoch = 40, scenario = "trend", seed = 42 } = opts;
  const rnd = mulberry32(seed);
  const out: Swap[] = [];
  let i = 0;
  for (let n = 0; n < epochs; n++) {
    for (let k = 0; k < swapsPerEpoch; k++) {
      const timestamp = genesisTime + n * epochLenSec + Math.floor((k / swapsPerEpoch) * epochLenSec);
      let pBuy = 0.55;
      if (scenario === "chop") pBuy = 0.5;
      if (scenario === "bankrun") pBuy = n < epochs - 1 ? 0.55 : 0.2;
      const isBuy = rnd() < pBuy;
      const ethDelta = Number(((0.1 + rnd() * 0.9) * (isBuy ? 1 : -1)).toFixed(4));
      out.push({ tx: `mock-${n}-${k}`, timestamp, ethDelta, isBuy });
      i++;
    }
  }
  void i;
  return out;
}
