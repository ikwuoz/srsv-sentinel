// Core domain types for the Standard Reserve net-flow sentinel.
// Whitepaper §4: F_n = buys_ETH - sells_ETH per epoch; signal_n = F_{n-1} + F_{n-2}.

export type Regime = "expansion" | "contraction";

export interface Swap {
  tx: string;
  timestamp: number; // unix seconds
  ethDelta: number; // +ETH in (buy) as positive, -ETH out (sell) as negative
  isBuy: boolean;
}

export interface EpochFlow {
  n: number;
  start: number;
  end: number;
  buys: number; // gross ETH in from buys
  sells: number; // gross ETH out from sells (positive number)
  fn: number; // buys - sells
  signal: number | null; // F_{n-1}+F_{n-2}, null until n>=2
  feeRoute: Regime | null; // sign(F_n): >0 expansion, <=0 contraction
  issuanceRegime: Regime | null; // sign(signal_n)
  finalized: boolean;
}

export interface SignalOutput {
  epoch: number;
  fn: number | null;
  signal: number | null;
  feeRoute: Regime | null;
  issuanceRegime: Regime | null;
  // intra-epoch forecast (partial current epoch)
  partialFn: number;
  ethToFlipFee: number; // ETH needed to flip fee route (0 if already expansion)
  ethToFlipIssuance: number; // ETH needed to flip issuance signal
  pFlipFee: number; // 0..1 heuristic
  pFlipIssuance: number;
  updatedAt: string;
}
