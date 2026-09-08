---
title: "The Standard Reserve: Whitepaper"
source: "https://www.standardreserve.xyz/whitepaper/"
author:
published:
created: 2026-09-08
description: "The Standard Reserve whitepaper: the full design of a sovereign onchain central bank and its reflexive monetary policy."
tags:
  - "clippings"
---
STANDARD is a closed monetary economy with one currency (**$STANDARD**), one market (ETH <> $STANDARD pool on Uniswap v4), one signal that affects monetary policy (net ETH flow through that market), and one authority (the central bank, 4,000 lines of immutable code). Bankers (you) hold charters, charters operate bank branches, bank branches earn the currency issued by the central bank.

Capital flowing in loosens policy, increases **$STANDARD** issuance, and stacks hard reserves (tokenized gold). Capital flowing out tightens policy, triggers buybacks and burns, and prices the exits. Every path through the economy either burns **$STANDARD** or brings the central bank hard assets.

There are six entities. Everything in the system is a relationship between them.

| Entity | What it is | TLDR |
| --- | --- | --- |
| $STANDARD | ERC-20, 1B hard cap | Minted at exactly one moment (a withdrawal). Burned constantly. |
| The pool | ETH <> $STANDARD on a hooked Uniswap v4 pool | Every swap feeds the bank ETH. Net flow is measured here. |
| The central bank | The issuing authority | Reads net flow, sets the issuance rate, routes fees. |
| A charter | Initially soulbound NFT that makes you a banker. One charter = one bank, holding 1 to 10 bank branches | 1,000 at genesis. New ones are minted only when someone buys one at the daily ETH auction. |
| A branch | The yield accrual vehicle inside your charter. Each branch accrues a pro-rata share of daily issuance, so more branches = a bigger cut | Open new branches by burning $STANDARD. Cash out by burning the yield vehicles (branches). |
| The vaults | Where fees land | Expansion vault stacks reserves. Contraction vault buys back and burns |

The mental model for charters and branches: **a charter is a company, branches are its stores.** The company earns through its stores, reinvests earnings to open more, and pays its owner by closing stores, one at a time or all at once. Closing the last store dissolves the company.

<svg viewBox="0 0 560 1120" role="img" aria-label="Map of the six entities. Traders swap with the pool. The pool reports net flow and fee ETH to the central bank. The bank issues $STANDARD pro rata to bankers' branches; bankers burn $STANDARD on licenses and exit through the pool. Charter auction ETH feeds the bank, and the bank splits fees to the vaults by regime."><defs><marker id="wp-arr-m" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="8" markerHeight="8" orient="auto"><path d="M2 1.5 L8 5 L2 8.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></marker></defs><rect x="120" y="30" width="320" height="96" rx="3" fill="none" stroke="currentColor"></rect><rect x="120" y="30" width="320" height="34" rx="3" fill="none" stroke="currentColor"></rect><text x="280" y="52" text-anchor="middle" fill="currentColor">TRADERS</text> <text x="280" y="100" text-anchor="middle" fill="currentColor">anyone, no charter needed</text> <line x1="215" y1="126" x2="215" y2="207" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor" stroke-opacity="0.2"></line><line x1="345" y1="207" x2="345" y2="130" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor" stroke-opacity="0.2"></line><text x="203" y="172" text-anchor="end" fill="currentColor">BUYS</text> <text x="357" y="172" text-anchor="start" fill="currentColor">SELLS</text> <rect x="120" y="219" width="320" height="96" rx="3" fill="none" stroke="currentColor"></rect><rect x="120" y="219" width="320" height="34" rx="3" fill="none" stroke="currentColor"></rect><text x="280" y="241" text-anchor="middle" fill="currentColor">THE POOL</text> <text x="280" y="289" text-anchor="middle" fill="currentColor">ETH ⇆ $STANDARD · v4 hook</text> <path d="M 280 315 V 392" fill="none" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor"></path><text x="266" y="358" text-anchor="end" fill="currentColor">NET FLOW + FEE ETH</text> <polygon points="280,404 390,494 280,584 170,494" fill="none" stroke="currentColor"></polygon><text x="280" y="488" text-anchor="middle" fill="currentColor">THE CENTRAL</text> <text x="280" y="506" text-anchor="middle" fill="currentColor">BANK</text> <line x1="245" y1="556" x2="245" y2="642" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor" stroke-opacity="0.2"></line><line x1="315" y1="642" x2="315" y2="556" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor" stroke-opacity="0.2"></line><text x="231" y="596" text-anchor="end" fill="currentColor">ISSUANCE,</text><text x="231" y="614" text-anchor="end" fill="currentColor">PRO RATA</text> <text x="329" y="596" text-anchor="start" fill="currentColor">LICENSES,</text><text x="329" y="614" text-anchor="start" fill="currentColor">BURNED</text> <rect x="120" y="654" width="320" height="110" rx="3" fill="none" stroke="currentColor"></rect><rect x="120" y="654" width="320" height="34" rx="3" fill="none" stroke="currentColor"></rect><text x="280" y="676" text-anchor="middle" fill="currentColor">BANKERS</text> <text x="280" y="710" text-anchor="middle" fill="currentColor">one charter · up to 10 branches</text> <rect x="187" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="206" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="225" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="244" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="263" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="282" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="301" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="320" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="339" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><rect x="358" y="726" width="15" height="15" rx="2" fill="none" stroke="currentColor"></rect><path d="M 420 654 V 327" fill="none" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor"></path><text x="432" y="470" text-anchor="start" fill="currentColor">EXITS</text> <text x="432" y="488" text-anchor="start" fill="currentColor">withdrawn tokens</text> <text x="432" y="504" text-anchor="start" fill="currentColor">sell here</text> <rect x="120" y="824" width="320" height="96" rx="3" fill="none" stroke="currentColor"></rect><rect x="120" y="824" width="320" height="34" rx="3" fill="none" stroke="currentColor"></rect><text x="280" y="846" text-anchor="middle" fill="currentColor">THE VAULTS</text> <text x="280" y="894" text-anchor="middle" fill="currentColor">expansion · contraction</text> <path d="M 170 494 H 57 Q 45 494 45 506 V 860 Q 45 872 57 872 H 108" fill="none" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor"></path><text x="57" y="800" text-anchor="start" fill="currentColor">FEE SPLIT, BY REGIME</text> <rect x="120" y="980" width="320" height="96" rx="3" fill="none" stroke="currentColor"></rect><rect x="120" y="980" width="320" height="34" rx="3" fill="none" stroke="currentColor"></rect><text x="280" y="1002" text-anchor="middle" fill="currentColor">CHARTER AUCTION</text> <text x="280" y="1050" text-anchor="middle" fill="currentColor">daily Dutch, in ETH</text> <path d="M 120 1028 H 32 Q 20 1028 20 1016 V 473 Q 20 461 32 461 H 196" fill="none" marker-end="url(#wp-arr-m)" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" stroke="currentColor"></path><text x="32" y="952" text-anchor="start" fill="currentColor">AUCTION ETH</text></svg>

Every path through the economy either burns $STANDARD or brings the central bank hard assets. Most do both.

The flows between them:

- **Traders ⇄ pool.** Anyone can buy or sell $STANDARD, no charter needed. Every swap feeds the bank a trading fee in ETH.
- **Pool → central bank.** The v4 hook on the pool reports net flow: ETH in from buys minus ETH out from sells. This is the bank's only input.
- **Central bank → branches.** Each epoch the bank issues $STANDARD to all branches, pro rata. A banker's share of the issue equals their share of total branches.
- **Bankers → bank.** Bankers spend earned $STANDARD on expansion licenses to open more branches. Every token spent this way is burned.
- **Bankers → pool.** To realize earnings, a banker retires a branch: its share of the balance is liquidated and minted to their wallet, minus the resolution fee.
- **New bankers → central bank.** New charters are bought at a daily ETH auction. The ETH flows into the same fee engine as trading fees.

0M

hard cap, 18 decimals

0M

genesis, protocol-owned liquidity

0M

issuance budget

- **Hard cap:** 1,000,000,000 $STANDARD. 18 decimals.
- **Genesis:** 100,000,000 as protocol-owned liquidity locked into the v4 pool. This is the only pre-mint. The position is full-range, owned by the protocol, and can never be withdrawn.
- **Issuance budget:** 900,000,000 tokens (the cap minus the genesis liquidity). When cumulative issuance reaches the budget, base issuance stops permanently and the economy runs closed-loop on recycled fees.

**$STANDARD** is **minted on demand**. Issuance credits a banker’s balance as a ledger entry; actual tokens are minted only when a banker withdraws. Tokens are burned by expansion licenses (100%), open market buybacks (100%), and resolution fees (50%). Supply therefore obeys a single identity at every block:

$$
S_{circ}(t) \;=\; \underbrace{100{,}000{,}000}_{\text{genesis liquidity}} \;+\; \underbrace{M(t)}_{\text{withdrawal mints}} \;-\; \underbrace{B(t)}_{\text{cumulative burns}}
$$
 (3.1)

and because burned tokens are gone forever, the maximum supply that can ever exist is strictly non-increasing:

$$
S_{max}(t) \;=\; 1{,}000{,}000{,}000 \;-\; B(t)
$$
 (3.2)

Circulating supply is a receipt.

It equals value withdrawn from the system minus everything the bank has clawed back and burned. One onchain number tells you whether the economy is eating or bleeding.

The pool’s hook counts, per epoch, gross ETH entering from buys and gross ETH leaving from sells. Net flow for epoch $n$ is the difference, and the policy signal aggregates the last two completed epochs:

$$
F_n \;=\; \rule[-1em]{4.5em}{2.4em} \;-\; \rule[-1em]{4.5em}{2.4em} \qquad\qquad signal_n \;=\; F_{n-1} + F_{n-2}
$$
 (4.1)

The issuance rate moves on $signal_n$; fee routing moves on $sign(F_n)$ alone. Properties that matter:

- **It is measured at the canonical pool.** There is exactly one place ETH enters or leaves this economy: through trading.
- **It is denominated in real capital.** ETH, not token amounts, not trade counts. To move the signal you must move actual capital.
- **The issuance decision uses the trailing two epochs**, so one manipulated hour cannot swing the rate. The fee routing decision uses the current epoch’s sign, so defense reacts fast. Slow lever for issuance, fast lever for fees.

Issuance runs at a **base rate of $STANDARD per day**, scaled by a policy multiplier **m**. An epoch of $d$ days issues

$$
I_n \;=\; \rule[-0.24em]{3.4em}{0.95em} \times d \times m_n
$$
 (5.1)

split pro rata and streamed second by second across the epoch. Balances tick up in real time, and a new branch earns from the moment it opens. A single branch’s daily yield in a system of $N$ branches is $\,\rule[-0.24em]{3.4em}{0.95em} \times m / N$. The multiplier itself follows one rule, evaluated every epoch:

$$
m_{n+1} \;=\; \rule[-1.9em]{15em}{4.2em}
$$
 (5.2)

| Parameter | Value |
| --- | --- |
| Multiplier range |  |
| Launch value |  |
| Epoch length |  |
| Rate cut |  |
| Rate raise |  |

The asymmetry is deliberate: **cuts are immediate, raises must be earned.** From launch, sustained inflows reach full issue in days and the ceiling in . A sustained exodus drives the rate from ceiling to floor in , cutting dilution by while it happens. The bank turns defensive faster than it turns generous.

The multiplier m, epoch by epoch

<svg viewBox="0 0 560 340" role="img" aria-label="Staircase of the policy multiplier across epochs: consecutive positive epochs raise it in fixed steps from the launch value to the ceiling; negative epochs cut it in larger steps down to the floor. Values redacted until launch."><line x1="70" y1="50" x2="520" y2="50" stroke="currentColor" stroke-opacity="0.2"></line><line x1="70" y1="260" x2="520" y2="260" stroke="currentColor" stroke-opacity="0.2"></line><line x1="70" y1="286" x2="520" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><line x1="295" y1="44" x2="295" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><rect x="70" y="29" width="34" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="111" y="39" style="font-size: 15px;" fill="currentColor">ceiling</text> <rect x="70" y="272" width="28" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="105" y="282" style="font-size: 15px;" fill="currentColor">floor</text> <text x="520" y="306" text-anchor="end" style="font-size: 14.5px;" fill="currentColor">epochs</text> <g transform="rotate(-35.0 226.4 111.5)"><rect x="176.42531386907598" y="101.50228029164684" width="32" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="214.42531386907598" y="111.50228029164684" style="font-size: 14.5px;" fill="currentColor">per epoch</text></g> <g transform="rotate(47.4 382.0 188.7)"><rect x="331.95890143449793" y="178.68858156200884" width="32" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="369.95890143449793" y="188.68858156200884" style="font-size: 14.5px;" fill="currentColor">per epoch</text></g> <path d="M 70 140 H 102.1 V 140.0 H 134.3 V 120.0 H 166.4 V 100.0 H 198.6 V 80.0 H 230.7 V 60.0 H 262.9 V 50.0 H 295.0 V 80.0 H 327.1 V 110.0 H 359.3 V 140.0 H 391.4 V 170.0 H 423.6 V 200.0 H 455.7 V 230.0 H 487.9 V 260.0 H 520.0" fill="none" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" style="stroke-linecap: butt;" stroke="currentColor"></path><circle cx="70" cy="140" r="5" fill="none" stroke="currentColor"></circle><text x="84" y="164" style="font-size: 14.5px;" fill="currentColor">launch,</text><rect x="133" y="154" width="26" height="12" rx="2" fill="none" stroke="currentColor"></rect></svg>

The bank turns defensive faster than it turns generous.

**The two regimes.** Each epoch is either expansion (net flow positive) or contraction (net flow negative or zero):

|  | Expansion | Contraction |
| --- | --- | --- |
| Issuance | climbing (if sustained) | cut immediately |
| Fee routing | expansion vault: hard reserve assets | contraction vault: buyback and burn |
| Licenses | cost more (floor scales with the rate) | cost less |
| Exits | cheap, floor | priced by the crowd, up to |
| Rational move | expand; every new branch burns supply | stay; exit fees pay those who remain |

![](https://www.standardreserve.xyz/assets/towers-D5pCDDlk.webp)

A charter is an initially soulbound NFT. Holding one makes you a banker: it is the license to operate a bank and receive issuance.

- **Genesis: 1,000 Founding Charters, free.** An allowlist portion and a public portion, limit one per wallet. There is no sale and no proceeds; the team seeds the genesis liquidity itself.
- **After genesis: daily Dutch auctions in ETH.** Auction proceeds enter the fee engine like every other ETH flow.
- **Lifecycle.** A charter lives until its last branch is retired, at which point the NFT burns. The only way back in is buying a new charter at auction. There are no revolving doors.

Every charter opens with its first branch, and can grow to **10 branches** maximum. Each branch is one share of every epoch’s issue.

Additional branches require an **expansion license**, sold at a daily Dutch auction:

| Parameter | Value |
| --- | --- |
| Licenses per day |  |
| Per-charter limit |  |
| Payment | $STANDARD, 100% burned |
| Start price |  |
| Floor price |  |
| Decay |  |

Formally, with $N$ total branches in the system, the floor is , and the price decays exponentially from open to floor across the day:

$$
P_{floor} \;=\; \rule[-0.9em]{6.5em}{2.2em} \qquad\qquad P(t) \;=\; P_{start}\left(\frac{P_{floor}}{P_{start}}\right)^{t/24h}
$$
 (7.1)

where $P_{start} = \rule[-0.24em]{3.4em}{0.95em}$.

Daily license auction, price over 24h

<svg viewBox="0 0 560 340" role="img" aria-label="Exponential price decay of the daily Dutch auction: the price opens at a multiple of the previous close and falls continuously toward the floor across 24 hours. Buyers stepping in mid-curve set the market price. Values redacted until launch."><line x1="70" y1="60" x2="520" y2="60" stroke="currentColor" stroke-opacity="0.2"></line><line x1="70" y1="250" x2="520" y2="250" stroke="currentColor" stroke-opacity="0.2"></line><line x1="70" y1="286" x2="520" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><text x="70" y="49" style="font-size: 15px;" fill="currentColor">P start =</text> <rect x="146" y="39" width="66" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="450" y="272" text-anchor="end" style="font-size: 15px;" fill="currentColor">floor ≈</text> <rect x="456" y="262" width="64" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="70" y="306" style="font-size: 14.5px;" fill="currentColor">0h</text> <text x="520" y="306" text-anchor="end" style="font-size: 14.5px;" fill="currentColor">24h</text> <path d="M 70 60 C 140 88, 190 165, 265 208 C 330 243, 440 249, 520 250" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" style="stroke-linecap: butt;" fill="none" stroke="currentColor"></path><circle cx="238" cy="190.5" r="5" fill="none" stroke="currentColor"></circle><text x="252" y="184" style="font-size: 14.5px;" fill="currentColor">buyers step in: this is the market price</text></svg>

The auction starts high and decays until buyers step in, so every license finds its market price; the floor only prevents literal-zero sales. A branch begins earning the second it opens: issuance streams continuously, so its take is exactly proportional to how long it has existed.

This is the engine of the expansion flywheel: **the most rational move inside the system, growing your bank, permanently shrinks the float.**

Both sales in the system run on one mechanism: a daily falling-price Dutch auction. The price opens high, decays toward a floor over 24 hours, and purchases execute instantly at the current price, first come, first served. There are no bids, no escrow, no refunds, and nothing to snipe. The two auctions differ only in what they sell, what they are paid in, and where the payment goes: licenses are paid in **$STANDARD** and burned; charters are paid in ETH that flows to the fee engine.

### The license auction (daily, Dutch, in $STANDARD)

Once per day, initially 100 expansion licenses go on sale at a price that starts high and falls continuously toward the floor over 24 hours.

### The charter auction (daily, Dutch, in ETH)

When enabled (the count per day starts at zero and is policy-controlled), each day’s new charters sell on the same curve, denominated in ETH:

01Open

License

The day opens at $P_{start} = 2 \times P_{last}$, twice yesterday’s closing sale price. If yesterday sold nothing, the day opens at twice the floor.

Charter

The day opens at 3× the previous day's closing sale. If nothing sold, it opens at 3× the floor; the floor is the admin-set reserve price.

02Decay

License

The price falls exponentially along the curve in section 7. Early in the day licenses are expensive; by the end they approach the floor (about two days of one branch's yield).

Charter

The price falls exponentially toward the floor over 24 hours.

03Purchase

License

First-come-first-served at the current price. Each charter can buy at most three licenses per day. Payment is burned on receipt.

Charter

First-come-first-served at the current price. The charter mints to the buyer in the same transaction, first branch included. Payment routes to the fee engine.

04Close

License

The day ends when 100 licenses sell or 24 hours pass, whichever comes first. Unsold licenses do not roll over; the last (lowest) base price that sold becomes $P_{last}$ for tomorrow’s open.

Charter

The day ends when the day's count sells or 24 hours pass, whichever comes first. Unsold charters are never minted and do not roll over; the last sale sets tomorrow's open.

The design has two intentional consequences:

- **Buyers set the price, not the protocol.** Every buyer faces the same tradeoff: buy early and pay a premium for certainty, or wait for a lower price and risk the daily supply selling out. Where that tension resolves *is* the market price. The floor exists only to prevent literal-zero sales.
- **Repricing is asymmetric.** In downturns, the price decays to the floor faster, meaning expansion is cheapest during contractions. In upturns, the price series can rise at most 2× per day, so demand can never push a sale above the open, and each open is at most 2× yesterday’s close. A demand spike sells days out instantly while the opens double until price catches demand (~100× in a week).

The same asymmetric repricing applies: a seat gets cheap within a day of demand dying, and a demand spike triples the open each day until price catches it. Charters open higher than licenses (3× vs 2×) because scarce seats should reprice into demand faster than a daily commodity.

Issuance accrues to a charter’s balance continuously. To take profits, a banker **retires** branches. Retirement is two things at once: it liquidates the branch’s share of the accrued balance into tokens in your wallet, and it permanently retires the vehicle that was producing the yield.

- **Pro rata rule.** Retiring one branch of ten liquidates one tenth of the balance. Retiring all ten liquidates everything and burns the charter.
- The released amount is minted to the banker’s wallet, minus the **resolution fee**.
- **Minting has an equal and opposite reaction.** Every withdrawal retires the branch that earned it, permanently reducing your share of all future yield. You cannot extract value and keep the vehicle that produced it.

The resolution fee is congestion pricing on the exit door. Let $W$ be tokens withdrawn system-wide over the trailing 7 days and $D$ be everything still held at the bank. Exit pressure and the fee it commands are:

$$
P \;=\; \frac{W}{\max(D + W,\; \rule[-0.24em]{4em}{0.95em})} \qquad\qquad fee \;=\; \rule[-0.7em]{9em}{1.8em}
$$
 (9.1)

A quadratic curve from a floor to a ceiling, saturating when of the bank tries to leave in a week:

| System-wide exit pressure | Fee |
| --- | --- |
| Quiet () |  |
| Elevated () |  |
| Heavy () |  |
| Bank run () |  |

Resolution fee vs. 7-day exit pressure

<svg viewBox="0 0 560 340" role="img" aria-label="The resolution fee curve: quadratic from a low floor to a high ceiling, saturating at heavy exit pressure. Markers show the fee on a quiet day, at elevated pressure, at heavy pressure, and during a bank run. Values redacted until launch."><line x1="70" y1="60" x2="520" y2="60" stroke="currentColor" stroke-opacity="0.2"></line><line x1="70" y1="286" x2="520" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><rect x="70" y="39" width="32" height="12" rx="2" fill="none" stroke="currentColor"></rect><text x="108" y="49" style="font-size: 15px;" fill="currentColor">ceiling</text> <text x="70" y="306" style="font-size: 14.5px;" fill="currentColor">0%</text> <rect x="432" y="297" width="26" height="11" rx="2" fill="none" stroke="currentColor"></rect><text x="520" y="324" text-anchor="end" style="font-size: 14.5px;" fill="currentColor">exit pressure</text> <path d="M 70 273 C 135 270, 205 240, 257 219 C 315 195, 405 105, 445 60 L 520 60" pathLength="1000" stroke-dashoffset="0" stroke-dasharray="0 1010" draw="0 0" style="stroke-linecap: butt;" fill="none" stroke="currentColor"></path><line x1="164" y1="259" x2="164" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><line x1="257" y1="219" x2="257" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><line x1="445" y1="60" x2="445" y2="286" stroke="currentColor" stroke-opacity="0.2"></line><circle cx="70" cy="273" r="5" fill="none" stroke="currentColor"></circle><circle cx="164" cy="259" r="5" fill="none" stroke="currentColor"></circle><circle cx="257" cy="219" r="5" fill="none" stroke="currentColor"></circle><circle cx="445" cy="60" r="5" fill="none" stroke="currentColor"></circle><text x="84" y="252" style="font-size: 14.5px;" fill="currentColor">quiet,</text><rect x="122" y="243" width="22" height="11" rx="2" fill="none" stroke="currentColor"></rect> <text x="120" y="232" text-anchor="end" style="font-size: 14.5px;" fill="currentColor">elevated,</text><rect x="124" y="223" width="26" height="11" rx="2" fill="none" stroke="currentColor"></rect> <text x="213" y="196" text-anchor="end" style="font-size: 14.5px;" fill="currentColor">heavy,</text><rect x="217" y="187" width="26" height="11" rx="2" fill="none" stroke="currentColor"></rect> <text x="457" y="84" style="font-size: 14.5px;" fill="currentColor">bank run,</text><rect x="514" y="75" width="22" height="11" rx="2" fill="none" stroke="currentColor"></rect></svg>

Half of every fee is burned. The other half is paid to every banker who stayed.

The fee curve is quadratic between the floor and the ceiling, and your rate locks the moment you commit. **Half of every fee is burned. The other half is paid to every banker who stayed.**

This inverts the payoff structure of a bank run. In a traditional run, whoever exits first is made whole and whoever waits absorbs the loss, so running first is always correct. Here, heavy exit volume raises the fee on the exiters themselves, and half of what they pay goes to the positions that stayed, so mass exits transfer value from the impatient to the patient. Withdrawals are never paused or queued at any fee level. The cost of leaving is the only control mechanism.

A dormant banker siphons issue away from working bankers, so the system removes them:

1. 01
	Report
	A wallet inactive for 30 days can be reported by anyone.
2. 02
	Bounty
	The informant earns a bounty (2% of the dormant balance, capped at 100,000 tokens).
3. 03
	Revocation
	The ghost pays a 70% revocation fee, deliberately worse than the worst-case resolution fee, so going dark is never the cheap way out. Half the fee burns, half pays the bankers still at their desks.
4. 04
	Shutdown
	Their branches are shuttered, their charter burns, and the remaining 30% is sent to their wallet.

Staying active is free: any interaction resets the clock, and a zero-cost check-in exists for bankers who simply want to hold. Lost keys, abandoned wallets, and tourists dilute no one.

**The split.** All protocol ETH, trading fees and charter auctions alike, routes each epoch:

| Share | Destination |
| --- | --- |
| 70% | the active vault (expansion or contraction, by that epoch's net flow) |
| 15% | protocol-owned liquidity (half swapped to $STANDARD, paired, added forever) |
| 15% | team |

**The expansion vault** accumulates ETH and purchases hard reserve assets (**tokenized gold** and comparable assets). Reserves are held by the bank.

**The contraction vault** buys **$STANDARD** on the open market and burns everything it buys, executing in small rate-limited steps so defense cannot be baited into one blockable shot. Each hourly tick with vault balance $V$ against pool reserves $R$ spends

$$
spend_{tick} \;=\; \min\big(0.10 \times V,\;\; 0.002 \times R\big)
$$
 (11.1)

bounding buybacks near 5% of pool depth per day at launch settings. Unspent balance rolls forward; the vault can never sell.

**Protocol-owned liquidity** only grows. The genesis position plus every epoch’s POL share compound into a floor of exit liquidity that no one can pull. Trading fees earned in **$STANDARD** is always burned.

Charters launch soulbound. A one-way switch enables transfers later, at which point selling a charter becomes a second exit path: the seat moves whole, branches and balance included. A seat sale is an exit with **zero sell pressure on $STANDARD**; the buyer replaces the seller one for one.

Four structural loops, each following directly from the mechanics above.

01

Adoption

New charters are sold for ETH, and that ETH routes into the same engine as trading fees: reserves, permanent liquidity, buybacks. Each entrant strengthens the balance sheet that made entry worth bidding on. And because total issuance is capped per day, a new banker changes how the issue is divided, not how much exists.

02

Expansion

The highest expected-value action available to an incumbent, adding branches, is also the protocol's largest supply sink: every license is paid in $STANDARD and burned. Individual self-interest and supply reduction point in the same direction by construction, with no lockups or incentives needed to align them.

03

Fee flow

Fee revenue is direction-agnostic: buys and sells both pay in ETH. In expansion regimes it accumulates as hard reserves and permanent liquidity; in contraction regimes it finances buybacks and burns. The protocol converts volatility itself into balance sheet, whichever way price moves.

04

Monetary policy

The three defensive mechanisms compound at the same moment. When capital exits: issuance cuts within one epoch, decreasing dilution; fee routing flips to buybacks, adding structural bid; and the resolution fee rises with aggregate exit volume, half burned, half redistributed to remaining positions. Each mechanism independently raises the relative payoff of holding exactly when exit pressure peaks. Downside conditions tighten the system rather than unwind it.

| Parameter | Launch value |
| --- | --- |
| Hard cap |  |
| Genesis liquidity |  |
| Base issuance |  |
| Multiplier m |  |
| Epoch |  |
| Founding Charters |  |
| Charter auctions |  |
| Branches per charter |  |
| Expansion licenses |  |
| License floor |  |
| Trading fee |  |
| Fee split |  |
| Resolution fee |  |
| Dormancy |  |
| Buyback execution |  |

Final parameters will be announced closer to launch.