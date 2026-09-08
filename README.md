# srsv — Standard Reserve sentinel + charter guide

Tooling for [Standard Reserve](https://www.standardreserve.xyz/whitepaper/), the sovereign
onchain central bank: one currency (`$STANDARD`), one market (ETH ⇄ `$STANDARD` on a hooked
Uniswap v4 pool), one signal (net ETH flow), one authority (immutable code).

This repo holds two things:

- **`src/` — net-flow sentinel agent** (TypeScript). Tracks `F_n = buys − sells` per epoch,
  computes `signal_n = F_{n-1} + F_{n-2}`, classifies expansion vs contraction, forecasts flips,
  and fires Telegram alerts on regime transitions. Mock-first; goes live via RPC when the
  pool deploys.
- **`web/` — interactive charter guide** (static page, deployed to GitHub Pages). Visual walkthrough
  of becoming a banker: seats, branch yield, license auctions, charter auctions, exits,
  regime flips, contraction defense — sliders, selects, and live graphs throughout.

## Quickstart

```bash
npm install
cp .env.example .env   # then fill in TELEGRAM_* / RPC_URL as needed
npm run build
npm test
```

## Sentinel CLI

```bash
node dist/cli.js demo --scenario=trend|chop|bankrun [--seed=42]
node dist/cli.js status        # latest signal as JSON
node dist/cli.js history --n=10
node dist/cli.js watch         # autonomous loop + Telegram alerts on flips
node dist/cli.js test-alert    # verify the Telegram wiring
npm run serve                  # HTTP API on :8787
```

## Downstream-agent polling contract

`GET /signal` → `{epoch, fn, signal, feeRoute, issuanceRegime, partialFn,
ethToFlipFee, ethToFlipIssuance, pFlipFee, pFlipIssuance, updatedAt}`.
Poll every `POLL_MS` (30s); act on `feeRoute`/`issuanceRegime` transitions or
`ethToFlip*` crossing your threshold, not every tick.

## Architecture

```
FlowSource (mock | live v4) → aggregate → classify → forecast → store → CLI + HTTP
src/math.ts ──tsc──▶ web/vendor/math.js (single source of truth for protocol math)
```

- `src/aggregate.ts` — buckets swaps into epochs.
- `src/classify.ts` — fee route on `sign(F_n)`, issuance on `sign(signal_n)`; zero = contraction.
- `src/forecast.ts` — intra-epoch `ethToFlip` + flip probability.
- `src/math.ts` — canonical pure math (yield, Dutch decay, resolution fee, flip needs,
  buyback trajectory). Tested in `test/`; compiled to `web/vendor/math.js` (gitignored, generated).
- `src/sources/mock.ts` — deterministic `trend|chop|bankrun` simulator (pre-launch default).
- `src/sources/live.ts` — viem `PoolManager Swap` filter by `PoolId`; epochs finalize
  `CONFIRMATIONS` blocks behind tip (reorg-safe). Needs `RPC_URL` + `POOL`.
- `src/alerts/telegram.ts` — transitions-only alerts; no-op without credentials.

## Web guide

```bash
python3 -m http.server 8138 --directory web  # → http://localhost:8138
```

Zero-backend static page (`index.html` + `styles.css` + `app.js` + `data.js`);
slider state persists in the URL hash for shareable scenarios.
Deploys to GitHub Pages via `.github/workflows/pages.yml` (rebuilds `web/vendor` in CI).

## Config

All settings via environment (see `.env.example`): `SOURCE`, `PORT`, `POLL_MS`,
`EPOCH_LEN_SEC`, `CONFIRMATIONS`, `RPC_URL`, `POOL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

## Notes

- Whitepaper v0.1 redacts exact launch params, so the guide uses illustrative placeholders,
  flagged in-UI. Swap them in `web/data.js` at launch.
- `whitepaper.md` is a saved reference clipping of the official whitepaper.
- Experimental tooling, not investment advice. Standard Reserve is unaudited pre-launch code;
  verify everything onchain before acting on it.
