import { PARAMS, licensePrice, feeAt, branchDailyYield, feeRegime, issuanceRegime, flipNeeds, buybackTrajectory, supplyProjection, SUPPLY_CAP, SUPPLY_GENESIS, SUPPLY_BUDGET } from "./data.js?v=2";

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const W = 520, H = 240, PAD = 34;

// Theme: charts + accents follow document [data-theme] (dark default).
// Light mode is paper #fbfcf5, so accents switch to darker variants there.
const PALETTES = {
  dark:  { ink: "#ece9e2", dim: "#a8a49b", faint: "#6f6c65", grid: "#2a2a27", zero: "#4a4a45",
           green: "#9fd6a4", sand: "#d8c79a", blue: "#a9bfd1", clay: "#d99a8c", red: "#e39a9a" },
  light: { ink: "#1a1a18", dim: "#5c5a54", faint: "#8a877e", grid: "#e3e0d4", zero: "#b9b4a4",
           green: "#2e7d46", sand: "#8a6d2f", blue: "#2f5d7d", clay: "#b0503c", red: "#b03a2e" },
};
const themeName = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const PAL = () => PALETTES[themeName()];

// Minimal SVG line-chart helper: series [{x,y}], marker {x,y,label}.
function chart(el, { xs, series, marker, yLabel, xLabel, band }) {
  const pal = PAL();
  const allY = series.flatMap((s) => s.pts.map((p) => p.y));
  if (marker) allY.push(marker.y);
  const yMax = Math.max(...allY, 1e-9) * 1.12, yMin = Math.min(0, ...allY);
  const xMax = Math.max(...xs), xMin = Math.min(...xs);
  const X = (x) => PAD + ((x - xMin) / Math.max(1e-9, xMax - xMin)) * (W - PAD - 12);
  const Y = (y) => H - PAD - ((y - yMin) / Math.max(1e-9, yMax - yMin)) * (H - PAD - 14);
  const grid = [0.25, 0.5, 0.75].map((f) => {
    const y = H - PAD - f * (H - PAD - 14);
    return `<line x1="${PAD}" y1="${y}" x2="${W - 12}" y2="${y}" stroke="${pal.grid}"/>`;
  }).join("");
  const paths = series.map((s) => {
    const ptsStr = s.pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
    const area = s.fill
      ? `<polygon points="${X(s.pts[0].x).toFixed(1)},${Y(0).toFixed(1)} ${ptsStr} ${X(s.pts[s.pts.length - 1].x).toFixed(1)},${Y(0).toFixed(1)}" fill="${s.color}" opacity="0.14"/>`
      : "";
    return `${area}<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${ptsStr}"/>`;
  }).join("");
  const mc = marker?.color ?? pal.ink;
  const dot = marker
    ? `<circle cx="${X(marker.x)}" cy="${Y(marker.y)}" r="5" fill="${mc}" fill-opacity="0.25" stroke="${mc}" stroke-width="2"/><text x="${Math.min(X(marker.x) + 9, W - 150)}" y="${Y(marker.y) - 9}" fill="${mc}" font-size="11" font-family="monospace">${marker.label}</text>` : "";
  const zero = yMin < 0 ? `<line x1="${PAD}" y1="${Y(0)}" x2="${W - 12}" y2="${Y(0)}" stroke="${pal.zero}" stroke-dasharray="4 4"/>` : "";
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    ${grid}${zero}${band ?? ""}${paths}${dot}
    <text x="${PAD}" y="14" fill="${pal.dim}" font-size="11" font-family="monospace">${yLabel}</text>
    <text x="${W - 12}" y="${H - 8}" fill="${pal.faint}" font-size="11" text-anchor="end" font-family="monospace">${xLabel}</text>
  </svg>`;
}

// ---- 01 yield ----
function renderYield() {
  const b = +$("y-b").value, N = +$("y-n").value, m = +$("y-m").value, base = Math.max(0, +$("y-base").value || 0);
  $("y-b-out").textContent = b; $("y-n-out").textContent = fmt(N); $("y-m-out").textContent = m.toFixed(2);
  const mine = branchDailyYield(base, m, b, N);
  const one = branchDailyYield(base, m, 1, N);
  const pts = Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: branchDailyYield(base, m, i + 1, N) }));
  chart($("y-graph"), { xs: pts.map((p) => p.x), series: [{ pts, color: PAL().green, fill: true }], marker: { x: b, y: mine, label: `you: ${fmt(mine)}`, color: PAL().green }, yLabel: "$STANDARD / day", xLabel: "your branches →" });
  const paybackNote = one > 0 ? `one branch ≈ ${fmt(one)} / day` : "";
  const gross = base * m;
  const runway = gross > 0 ? SUPPLY_BUDGET / (gross * 365) : Infinity;
  $("y-read").innerHTML = `YOUR TAKE <span class="num" style="color:${PAL().green}">${fmt(mine)}</span> $STANDARD/day <span class="dim">· share ${((b / N) * 100).toFixed(3)}% · ${paybackNote}</span><br>BUDGET RUNWAY <span class="num">≈${runway === Infinity ? "∞" : runway.toFixed(1) + "y"}</span> <span class="dim">· 900M budget ÷ ${fmt(Math.round(gross))}/day gross (before burns — see 07)</span>`;
}

// ---- 02 license ----
function demandSellout(d) { return d === "hot" ? 7 : d === "cold" ? 21 : 14; }
function renderLicense() {
  const plast = +$("l-p").value, t = +$("l-t").value, d = $("l-d").value;
  $("l-p-out").textContent = fmt(plast); $("l-t-out").textContent = `${t}h`;
  const pStart = plast * PARAMS.licenseOpenMult;
  const pFloor = Math.max(500, plast * 0.22); // ≈ two days of one branch's yield, illustrative
  const xs = Array.from({ length: 49 }, (_, i) => i * 0.5);
  const pts = xs.map((x) => ({ x, y: licensePrice(pStart, pFloor, x) }));
  const price = licensePrice(pStart, pFloor, t);
  const so = demandSellout(d);
  chart($("l-graph"), { xs, series: [{ pts, color: PAL().sand, fill: true }], marker: { x: t, y: price, label: `${fmt(Math.round(price))}`, color: PAL().sand }, yLabel: "$STANDARD", xLabel: `0h → 24h · sells out ~${so}h` });
  const save = 1 - licensePrice(pStart, pFloor, 18) / licensePrice(pStart, pFloor, 6);
  $("l-read").innerHTML = `PRICE NOW <span class="num" style="color:${PAL().sand}">${fmt(Math.round(price))}</span> $STANDARD <span class="dim">· open ${fmt(pStart)} → floor ${fmt(Math.round(pFloor))} · 100/day, ≤3 per charter</span><br>DAILY SINK <span class="num" style="color:${PAL().sand}">≈${fmt(Math.round(price * 100))}</span> <span class="dim">· burned if all 100 sell — extends the 900M runway (see 07)</span>`;
  $("l-quiz").dataset.answer = `${Math.round(save * 100)}`;
}

// ---- 03 charter ----
function renderCharter() {
  const plast = +$("c-p").value, t = +$("c-t").value, seats = $("c-s").value;
  $("c-p-out").textContent = plast.toFixed(2); $("c-t-out").textContent = `${t}h`;
  if (seats === "0") {
    $("c-graph").innerHTML = `    <p style="font-family:monospace;color:${PAL().dim};padding:18px">auctions closed — count per day is policy-controlled, starts at zero.</p>`;
    $("c-read").innerHTML = `<span class="dim">NO AUCTION TODAY</span>`;
    return;
  }
  const pStart = plast * PARAMS.charterOpenMult, pFloor = Math.max(0.05, plast * 0.35);
  const xs = Array.from({ length: 49 }, (_, i) => i * 0.5);
  const pts = xs.map((x) => ({ x, y: licensePrice(pStart, pFloor, x) }));
  const price = licensePrice(pStart, pFloor, t);
  chart($("c-graph"), { xs, series: [{ pts, color: PAL().blue, fill: true }], marker: { x: t, y: price, label: `${price.toFixed(2)} ETH`, color: PAL().blue }, yLabel: "ETH", xLabel: `0h → 24h · ${seats} seat(s)/day` });
  $("c-read").innerHTML = `BID NOW <span class="num" style="color:${PAL().blue}">${price.toFixed(3)}</span> ETH <span class="dim">· open ${(pStart).toFixed(2)} (3×) → floor ${pFloor.toFixed(2)} · routes to fee engine</span>`;
}

// ---- 04 exits ----
const PRESET_KEYS = ["quiet", "elevated", "heavy", "bankrun"];
const E_XMAX = 55; // graph spans to 55% so the 50% bank-run marker isn't edge-pinned
function renderExits() {
  const notch = Math.min(3, Math.max(0, Math.round(+$("e-p").value || 0)));
  const key = PRESET_KEYS[notch];
  if ($("e-s").value !== key) $("e-s").value = key;
  const P = PARAMS.presets[key];
  $("e-p-out").textContent = `${key === "bankrun" ? "bank run" : key} · ${(P * 100).toFixed(0)}%`;
  const z = Math.max(0, +$("e-z").value || 0);
  const xs = Array.from({ length: E_XMAX * 2 + 1 }, (_, i) => (i * 0.5) / 100);
  const pts = xs.map((x) => ({ x: x * 100, y: feeAt(x, PARAMS) * 100 }));
  const fee = feeAt(P, PARAMS);
  const zoneX = 34 + (35 / E_XMAX) * (520 - 34 - 12);
  const dangerBand = `<rect x="${zoneX.toFixed(1)}" y="20" width="${(520 - 12 - zoneX).toFixed(1)}" height="186" fill="${PAL().clay}" opacity="0.08"/>`;
  chart($("e-graph"), { xs: xs.map((x) => x * 100), band: dangerBand, series: [{ pts, color: PAL().clay, fill: true }], marker: { x: P * 100, y: fee * 100, label: `${(fee * 100).toFixed(1)}%`, color: PAL().clay }, yLabel: "fee %", xLabel: "7-day exit pressure →" });
  const cost = z * fee;
  $("e-read").innerHTML = `FEE <span class="num" style="color:${PAL().clay}">${(fee * 100).toFixed(2)}%</span> · cost on ${fmt(z)} = <span class="num">${fmt(Math.round(cost))}</span> <span class="dim">· burn ${fmt(Math.round(cost / 2))} / stayers ${fmt(Math.round(cost / 2))}</span>`;
}

// ---- 05 regimes ----
function renderRegimes() {
  const a = +$("r-a").value, b = +$("r-b").value;
  $("r-a-out").textContent = `${a >= 0 ? "+" : ""}${a.toFixed(1)}`;
  $("r-b-out").textContent = `${b >= 0 ? "+" : ""}${b.toFixed(1)}`;
  const signal = a + b;
  const feeRoute = feeRegime(b);
  const iss = issuanceRegime(signal);
  const { needFee, needIssuance } = flipNeeds(a, b);
  const needFeeR = b > 0 ? 0 : needFee;
  const needIss = signal > 0 ? 0 : needIssuance;
  const xs = [-5, 5];
  const band = `<rect x="${((0 - -5) / 10) * (W - PAD - 12) + PAD - 2}" y="20" width="4" height="${H - PAD - 34}" fill="${PAL().zero}"/>`;
  chart($("r-graph"), {
    xs, band,
    series: [
      { pts: [{ x: -5, y: a }, { x: 5, y: a }], color: PAL().faint },
      { pts: [{ x: b, y: -0.4 }, { x: b, y: 4.2 }], color: feeRoute === "expansion" ? PAL().green : PAL().red },
    ],
    marker: { x: Math.max(-5, Math.min(5, b)), y: Math.abs(signal), label: `signal ${signal >= 0 ? "+" : ""}${signal.toFixed(1)}` },
    yLabel: "|signal| ETH", xLabel: "F_n partial →",
  });
  $("r-read").innerHTML = `FEE ROUTE <span class="num" style="color:${feeRoute === "expansion" ? PAL().green : PAL().clay}">${feeRoute.toUpperCase()}</span> · ISSUANCE <span class="num" style="color:${iss === "expansion" ? PAL().green : PAL().clay}">${iss.toUpperCase()}</span> <span class="dim">· flip needs ${needFeeR.toFixed(1)} ETH (fee) / ${needIss.toFixed(1)} ETH (issuance)</span>`;
}

// ---- 06 defense ----
function renderDefense() {
  const V = +$("d-v").value, R = +$("d-r").value;
  const hours = +$("d-h").value;
  $("d-v-out").textContent = fmt(V); $("d-r-out").textContent = fmt(R); $("d-h-out").textContent = `${hours}`;
  const { ticks, total, remaining } = buybackTrajectory(V, R, hours);
  const spendPts = ticks.map((t) => ({ x: t.h, y: t.spend }));
  const cumPts = ticks.map((t) => ({ x: t.h, y: t.cumulative }));
  chart($("d-graph"), {
    xs: ticks.map((t) => t.h),
    series: [
      { pts: cumPts, color: PAL().ink },
      { pts: spendPts, color: PAL().clay, fill: true },
    ],
    marker: { x: ticks[ticks.length - 1].h, y: total, label: `Σ ${total.toFixed(1)} ETH` },
    yLabel: "ETH", xLabel: "hour →",
  });
  const capped = ticks.length > 0 && Math.abs(ticks[0].spend - 0.002 * R) < 1e-9;
  const px = +($("d-px") ? $("d-px").value : 25000); // illustrative STANDARD per ETH
  const burnDay = (total / Math.max(1, ticks.length)) * 24 * px;
  $("d-read").innerHTML = `SPENT <span class="num">${total.toFixed(1)}</span> ETH in ${ticks.length}h <span class="dim">· vault left ${remaining.toFixed(1)} · ${capped ? "pool-depth cap binds (0.2% R)" : "vault-share cap binds (10% V)"} · ≈${((total / Math.max(1, R)) * 100).toFixed(1)}% of pool depth</span><br>EST. BURN <span class="num" style="color:${PAL().clay}">≈${fmt(Math.round(burnDay))}</span> $STANDARD/day <span class="dim">· at ${fmt(px)}/ETH illustrative (see 07)</span>`;
}

// ---- 07 supply ----
function renderSupply() {
  const m = +$("s-m").value, base = +$("s-base").value;
  const lic = +$("s-lic").value, buy = +$("s-buy").value, H = +$("s-h").value;
  $("s-m-out").textContent = m.toFixed(2);
  $("s-lic-out").textContent = `${fmt(lic / 1000)}k`;
  $("s-buy-out").textContent = `${fmt(buy / 1000)}k`;
  $("s-h-out").textContent = `${H}`;
  const gross = base * m, burn = lic + buy;
  const { points, exhaustionYear } = supplyProjection({ grossPerDay: gross, burnPerDay: burn, years: H });
  const circ = points.map((p) => ({ x: p.t, y: p.sCirc / 1e6 }));
  const max = points.map((p) => ({ x: p.t, y: p.sMax / 1e6 }));
  const exhX = exhaustionYear === null ? null : Math.min(exhaustionYear, H);
  const band = exhX === null ? "" :
    `<line x1="${(34 + (exhX / H) * (520 - 34 - 12)).toFixed(1)}" y1="20" x2="${(34 + (exhX / H) * (520 - 34 - 12)).toFixed(1)}" y2="206" stroke="${PAL().sand}" stroke-dasharray="4 3"/>`;
  chart($("s-graph"), {
    xs: points.map((p) => p.t), band,
    series: [
      { pts: max, color: PAL().faint },
      { pts: circ, color: PAL().ink, fill: true },
    ],
    marker: exhX === null ? null : { x: exhX, y: (SUPPLY_GENESIS + Math.min(SUPPLY_BUDGET, gross * 365 * exhX) - burn * 365 * exhX) / 1e6, label: exhaustionYear > H ? `budget outlives chart` : `budget out ≈${exhaustionYear.toFixed(1)}y`, color: PAL().sand },
    yLabel: "M $STANDARD", xLabel: "years →",
  });
  const end = points[points.length - 1];
  $("s-read").innerHTML = `EXHAUSTION <span class="num" style="color:${PAL().sand}">${exhaustionYear === null ? "—" : "≈" + exhaustionYear.toFixed(1) + "y"}</span> <span class="dim">· at ${H}y: circ ${fmt(Math.round(end.sCirc / 1e6))}M · max ${fmt(Math.round(end.sMax / 1e6))}M · net ${gross >= burn ? "+" : ""}${fmt(Math.round((gross - burn) / 1000))}k/day</span>`;
}

function bind(id, fn) {
  $(id).addEventListener("input", fn);
  $(id).addEventListener("change", fn);
}

for (const id of ["y-b", "y-n", "y-m", "y-base"]) bind(id, renderYield);
for (const id of ["l-p", "l-t", "l-d"]) bind(id, renderLicense);
for (const id of ["c-p", "c-t", "c-s"]) bind(id, renderCharter);
for (const id of ["e-p", "e-z"]) bind(id, renderExits);
$("e-s").addEventListener("change", () => {
  $("e-p").value = String(Math.max(0, PRESET_KEYS.indexOf($("e-s").value)));
  renderExits();
});
for (const id of ["r-a", "r-b", "r-s"]) bind(id, renderRegimes);
$("r-s").addEventListener("change", () => {
  const v = $("r-s").value;
  if (v === "trend") { $("r-a").value = "2.5"; $("r-b").value = "1.5"; }
  if (v === "chop") { $("r-a").value = "2"; $("r-b").value = "-1.5"; }
  if (v === "bankrun") { $("r-a").value = "-1"; $("r-b").value = "-3.5"; }
  renderRegimes();
});

for (const id of ["d-v", "d-r", "d-h", "d-s", "d-px"]) bind(id, renderDefense);
for (const id of ["s-m", "s-base", "s-lic", "s-buy", "s-h"]) bind(id, renderSupply);
$("d-s").addEventListener("change", () => {
  const v = $("d-s").value;
  if (v === "early") { $("d-v").value = "80"; $("d-r").value = "4000"; $("d-h").value = "24"; }
  if (v === "deep") { $("d-v").value = "300"; $("d-r").value = "3500"; $("d-h").value = "48"; }
  if (v === "thin") { $("d-v").value = "120"; $("d-r").value = "1200"; $("d-h").value = "24"; }
  renderDefense();
});

// Quiz: 18h vs 6h savings on the license curve.
$("l-quiz").addEventListener("click", (ev) => {
  const btn = ev.target.closest("button");
  if (!btn) return;
  const truth = +$("l-quiz").dataset.answer || 0;
  const guess = parseInt(btn.dataset.a, 10);
  const ok = Math.abs(guess - truth) <= 20;
  $("l-quiz").querySelector(".verdict").textContent =
    ok ? `✓ close — truth ≈ ${truth}% on this curve.` : `✗ truth ≈ ${truth}% — move the Plast slider and retry.`;
});

// Shareable state: slider/select positions persist in the URL hash.
const STATE_IDS = ["y-b","y-n","y-m","y-base","l-p","l-t","l-d","c-p","c-t","c-s","e-p","e-s","e-z","r-a","r-b","r-s","d-v","d-r","d-h","d-s","d-px","s-m","s-base","s-lic","s-buy","s-h"];
function restoreState() {
  const h = location.hash.replace(/^#/, "");
  if (!h) return;
  for (const pair of h.split("&")) {
    const [k, v] = pair.split("=");
    if (!k || v === undefined) continue;
    const el = $(k);
    if (el && STATE_IDS.includes(k)) el.value = decodeURIComponent(v);
  }
}
let hashTimer = 0;
function saveState() {
  clearTimeout(hashTimer);
  hashTimer = setTimeout(() => {
    location.hash = STATE_IDS.map((id) => `${id}=${encodeURIComponent($(id).value)}`).join("&");
  }, 300);
}
for (const id of STATE_IDS) $(id).addEventListener("change", saveState);
// Theme init (before first render) + toggle wiring.
try {
  const saved = localStorage.getItem("srsv-theme");
  if (saved === "light" || saved === "dark") document.documentElement.dataset.theme = saved;
} catch {}
function renderAll() { renderYield(); renderLicense(); renderCharter(); renderExits(); renderRegimes(); renderDefense(); renderSupply(); }
function syncToggle() { $("theme-toggle").setAttribute("aria-checked", String(themeName() === "light")); }
$("theme-toggle").addEventListener("click", () => {
  const next = themeName() === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem("srsv-theme", next); } catch {}
  syncToggle();
  renderAll();
});

restoreState();
syncToggle();
renderAll();
