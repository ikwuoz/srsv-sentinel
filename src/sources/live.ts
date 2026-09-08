// Live Uniswap v4 pool source: reads PoolManager Swap events for the
// STANDARD pool, converts them to sentinel Swap[] with ETH deltas.
//
// Setup: RPC_URL=wss|https endpoint, POOL=0x… (v4 PoolId), CHAIN_ID (default 1),
// CONFIRMATIONS (default 5; epochs only finalize behind this lag → reorg-safe).
//
// Accounting note: a v4 Swap log carries raw currency deltas (amount0/amount1).
// The hook may skim fees before settlement, so these deltas are a close proxy
// for — but not identical to — the hook's canonical F_n accounting. When the
// hook address is known, prefer its reported per-epoch flow (see HOOK_FLOW_SLOT
// TODO below) and use this log feed as a cross-check/forecast input.
import { createPublicClient, http, parseAbiItem, type Hex } from "viem";
import { mainnet } from "viem/chains";
import type { Swap } from "../types.js";
import { config } from "../config.js";

const SWAP_EVENT = parseAbiItem(
  "event Swap(bytes32 indexed id, address indexed sender, int128 amount0, int128 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick, uint24 fee)",
);

// TODO(hook): replace delta-proxy with canonical hook accounting once known:
// const HOOK_ADDRESS = process.env.HOOK as Hex;
// const HOOK_FLOW_SLOT = "F_n per epoch from hook storage / HookFlowReported event";

const BLOCK_TIME_SEC = 12; // L1 approx; only used to bound log queries

function client() {
  if (!config.rpcUrl) throw new Error("live source: set RPC_URL first");
  return createPublicClient({ chain: mainnet, transport: http(config.rpcUrl) });
}

function poolId(): Hex {
  if (!config.pool || config.pool.length !== 66)
    throw new Error("live source: set POOL to the v4 PoolId (bytes32 hex) first");
  return config.pool as Hex;
}

export async function latestFinalizedBlock(): Promise<bigint> {
  const c = client();
  const latest = await c.getBlockNumber();
  return latest - BigInt(config.confirmations);
}

// Fetch swaps in [fromTs, toTs] (unix seconds), capped at the finalized tip.
export async function getLiveSwaps(fromTs: number, toTs: number): Promise<Swap[]> {
  const c = client();
  const id = poolId();
  const tip = await latestFinalizedBlock();
  const spanBlocks = BigInt(Math.ceil(Math.max(0, toTs - fromTs) / BLOCK_TIME_SEC) + 2);
  const toBlock = tip;
  const fromBlock = tip > spanBlocks ? tip - spanBlocks : 0n;

  const logs = await c.getLogs({
    address: poolManager(),
    event: SWAP_EVENT,
    args: { id },
    fromBlock,
    toBlock,
    strict: true,
  });

  const out: Swap[] = [];
  for (const log of logs) {
    const block = await c.getBlock({ blockNumber: log.blockNumber });
    const ts = Number(block.timestamp);
    if (ts < fromTs || ts > toTs) continue;
    // Currency order: currency0 < currency1 by address; native ETH is address(0)
    // so ETH is currency0. amount0<0 means ETH left the pool (a sell of STANDARD
    // for ETH); amount0>0 means ETH entered (a buy). Hook skim is second-order.
    const amount0 = Number(log.args.amount0);
    const ethIn = amount0 > 0;
    out.push({
      tx: log.transactionHash,
      timestamp: ts,
      ethDelta: ethIn ? amount0 / 1e18 : amount0 / 1e18, // signed ETH delta
      isBuy: ethIn,
    });
  }
  return out.sort((a, b) => a.timestamp - b.timestamp);
}

function poolManager(): Hex {
  // Uniswap v4 PoolManager singleton (mainnet); override via POOL_MANAGER if needed.
  return (process.env.POOL_MANAGER ??
    "0x000000000004444c5dc75db4a02524e985775b4a") as Hex;
}
