import { PARAMS, licensePrice, feeAt, branchDailyYield, feeRegime, issuanceRegime, flipNeeds, buybackTrajectory } from "./data.js";

const $ = (id) => document.getElementById(id);
const fmt = (n, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const W = 520, H = 240, PAD = 34;

// Minimal SVG line-chart helper: series [{x,y}], marker {x,y,label}.
function chart(el, { xs, series, marker, yLabel, xLabel, band }) {
  const allY = series.flatMap((s) => s.pts.map((p) => p.y));
  if (marker) allY.push(marker.y);
  const yMax = Math.max(...allY, 1e-9) * 1.12, yMin = Math.min(0, ...allY);
  const xMax = Math.max(...xs), xMin = Math.min(...xs);
  const X = (x) => PAD + ((x - xMin) / Math.max(1e-9, xMax - xMin)) * (W - PAD - 12);
  const Y = (y) => H - PAD - ((y - yMin) / Math.max(1e-9, yMax - yMin)) * (H - PAD - 14);
  const grid = [0.25, 0.5, 0.75].map((f) => {
    const y = H - PAD - f * (H - PAD - 14);
    return `<line x1="${PAD}" y1="${y}" x2="${W - 12}" y2="${y}" stroke="#2a2a27"/>`;
  }).join("");
  const paths = series.map((s) => {
    const ptsStr = s.pts.map((p) => `${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
    const area = s.fill
      ? `<polygon points="${X(s.pts[0].x).toFixed(1)},${Y(0).toFixed(1)} ${ptsStr} ${X(s.pts[s.pts.length - 1].x).toFixed(1)},${Y(0).toFixed(1)}" fill="${s.color}" opacity="0.14"/>`
      : "";
    return `${area}<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${ptsStr}"/>`;
  }).join("");
  const mc = marker?.color ?? "#ece9e2";
  const dot = marker
    ? `<circle cx="${X(marker.x)}" cy="${Y(marker.y)}" r="5" fill="${mc}" fill-opacity="0.25" stroke="${mc}" stroke-width="2"/><text x="${Math.min(X(marker.x) + 9, W - 150)}" y="${Y(marker.y) - 9}" fill="${mc}" font-size="11" font-family="monospace">${marker.label}</text>` : "";
  const zero = yMin < 0 ? `<line x1="${PAD}" y1="${Y(0)}" x2="${W - 12}" y2="${Y(0)}" stroke="#4a4a45" stroke-dasharray="4 4"/>` : "";
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    ${grid}${zero}${band ?? ""}${paths}${dot}
    <text x="${PAD}" y="14" fill="#a8a49b" font-size="11" font-family="monospace">${yLabel}</text>
    <text x="${W - 12}" y="${H - 8}" fill="#6f6c65" font-size="11" text-anchor="end" font-family="monospace">${xLabel}</text>
  </svg>`;
}

// ---- 01 yield ----
function renderYield() {
  const b = +$("y-b").value, N = +$("y-n").value, m = +$("y-m").value, base = +$("y-base").value;
  $("y-b-out").textContent = b; $("y-n-out").textContent = fmt(N); $("y-m-out").textContent = m.toFixed(2);
  const mine = branchDailyYield(base, m, b, N);
  const one = branchDailyYield(base, m, 1, N);
  const pts = Array.from({ length: 10 }, (_, i) => ({ x: i + 1, y: branchDailyYield(base, m, i + 1, N) }));
  chart($("y-graph"), { xs: pts.map((p) => p.x), series: [{ pts, color: "#9fd6a4", fill: true }], marker: { x: b, y: mine, label: `you: ${fmt(mine)}`, color: "#9fd6a4" }, yLabel: "$STANDARD / day", xLabel: "your branches →" });
  const paybackNote = one > 0 ? `one branch ≈ ${fmt(one)} / day` : "";
  $("y-read").innerHTML = `YOUR TAKE <span class="num" style="color:#9fd6a4">${fmt(mine)}</span> $STANDARD/day <span class="dim">· share ${((b / N) * 100).toFixed(3)}% · ${paybackNote}</span>`;
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
  chart($("l-graph"), { xs, series: [{ pts, color: "#d8c79a", fill: true }], marker: { x: t, y: price, label: `${fmt(Math.round(price))}`, color: "#d8c79a" }, yLabel: "$STANDARD", xLabel: `0h → 24h · sells out ~${so}h` });
  const save = 1 - licensePrice(pStart, pFloor, 18) / licensePrice(pStart, pFloor, 6);
  $("l-read").innerHTML = `PRICE NOW <span class="num" style="color:#d8c79a">${fmt(Math.round(price))}</span> $STANDARD <span class="dim">· open ${fmt(pStart)} → floor ${fmt(Math.round(pFloor))} · 100/day, ≤3 per charter</span>`;
  $("l-quiz").dataset.answer = `${Math.round(save * 100)}`;
}

// ---- 03 charter ----
function renderCharter() {
  const plast = +$("c-p").value, t = +$("c-t").value, seats = $("c-s").value;
  $("c-p-out").textContent = plast.toFixed(2); $("c-t-out").textContent = `${t}h`;
  if (seats === "0") {
    $("c-graph").innerHTML = `<p style="font-family:monospace;color:#a8a49b;padding:18px">auctions closed — count per day is policy-controlled, starts at zero.</p>`;
    $("c-read").innerHTML = `<span class="dim">NO AUCTION TODAY</span>`;
    return;
  }
  const pStart = plast * PARAMS.charterOpenMult, pFloor = Math.max(0.05, plast * 0.35);
  const xs = Array.from({ length: 49 }, (_, i) => i * 0.5);
  const pts = xs.map((x) => ({ x, y: licensePrice(pStart, pFloor, x) }));
  const price = licensePrice(pStart, pFloor, t);
  chart($("c-graph"), { xs, series: [{ pts, color: "#a9bfd1", fill: true }], marker: { x: t, y: price, label: `${price.toFixed(2)} ETH`, color: "#a9bfd1" }, yLabel: "ETH", xLabel: `0h → 24h · ${seats} seat(s)/day` });
  $("c-read").innerHTML = `BID NOW <span class="num" style="color:#a9bfd1">${price.toFixed(3)}</span> ETH <span class="dim">· open ${(pStart).toFixed(2)} (3×) → floor ${pFloor.toFixed(2)} · routes to fee engine</span>`;
  $("c-read").innerHTML = `BID NOW <span class="num">${price.toFixed(3)}</span> ETH <span class="dim">· open ${(pStart).toFixed(2)} (3×) → floor ${pFloor.toFixed(2)} · routes to fee engine</span>`;
}

// ---- 04 exits ----
function renderExits() {
  const sel = $("e-s");
  let P = +$("e-p").value / 100;
  $("e-p-out").textContent = `${(P * 100).toFixed(1)}%`;
  const z = +$("e-z").value;
  const xs = Array.from({ length: 61 }, (_, i) => (i * 0.5) / 100);
  const pts = xs.map((x) => ({ x: x * 100, y: feeAt(x, PARAMS) * 100 }));
  const fee = feeAt(P, PARAMS);
  const zoneX = 34 + (12 / 30) * (520 - 34 - 12);
  const dangerBand = `<rect x="${zoneX.toFixed(1)}" y="20" width="${(520 - 12 - zoneX).toFixed(1)}" height="186" fill="#d99a8c" opacity="0.08"/>`;
  chart($("e-graph"), { xs: xs.map((x) => x * 100), band: dangerBand, series: [{ pts, color: "#d99a8c", fill: true }], marker: { x: P * 100, y: fee * 100, label: `${(fee * 100).toFixed(1)}%`, color: "#d99a8c" }, yLabel: "fee %", xLabel: "7-day exit pressure →" });
  const cost = z * fee;
  $("e-read").innerHTML = `FEE <span class="num" style="color:#d99a8c">${(fee * 100).toFixed(2)}%</span> · cost on ${fmt(z)} = <span class="num">${fmt(Math.round(cost))}</span> <span class="dim">· burn ${fmt(Math.round(cost / 2))} / stayers ${fmt(Math.round(cost / 2))}</span>`;
  void sel;
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
  const band = `<rect x="${((0 - -5) / 10) * (W - PAD - 12) + PAD - 2}" y="20" width="4" height="${H - PAD - 34}" fill="#4a4a45"/>`;
  chart($("r-graph"), {
    xs, band,
    series: [
      { pts: [{ x: -5, y: a }, { x: 5, y: a }], color: "#6f6c65" },
      { pts: [{ x: b, y: -0.4 }, { x: b, y: 4.2 }], color: feeRoute === "expansion" ? "#9fd6a4" : "#e39a9a" },
    ],
    marker: { x: Math.max(-5, Math.min(5, b)), y: Math.abs(signal), label: `signal ${signal >= 0 ? "+" : ""}${signal.toFixed(1)}` },
    yLabel: "|signal| ETH", xLabel: "F_n partial →",
  });
  $("r-read").innerHTML = `FEE ROUTE <span class="num" style="color:${feeRoute === "expansion" ? "#9fd6a4" : "#d99a8c"}">${feeRoute.toUpperCase()}</span> · ISSUANCE <span class="num" style="color:${iss === "expansion" ? "#9fd6a4" : "#d99a8c"}">${iss.toUpperCase()}</span> <span class="dim">· flip needs ${needFeeR.toFixed(1)} ETH (fee) / ${needIss.toFixed(1)} ETH (issuance)</span>`;
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
      { pts: cumPts, color: "#ece9e2" },
      { pts: spendPts, color: "#d99a8c", fill: true },
    ],
    marker: { x: ticks[ticks.length - 1].h, y: total, label: `Σ ${total.toFixed(1)} ETH` },
    yLabel: "ETH", xLabel: "hour →",
  });
  const capped = ticks.length > 0 && Math.abs(ticks[0].spend - 0.002 * R) < 1e-9;
  $("d-read").innerHTML = `SPENT <span class="num">${total.toFixed(1)}</span> ETH in ${ticks.length}h <span class="dim">· vault left ${remaining.toFixed(1)} · ${capped ? "pool-depth cap binds (0.2% R)" : "vault-share cap binds (10% V)"} · ≈${((total / Math.max(1, R)) * 100).toFixed(1)}% of pool depth</span>`;
}

function bind(id, fn) {
  $(id).addEventListener("input", fn);
  $(id).addEventListener("change", fn);
}

for (const id of ["y-b", "y-n", "y-m", "y-base"]) bind(id, renderYield);
for (const id of ["l-p", "l-t", "l-d"]) bind(id, renderLicense);
for (const id of ["c-p", "c-t", "c-s"]) bind(id, renderCharter);
for (const id of ["e-p", "e-s", "e-z"]) bind(id, renderExits);
$("e-s").addEventListener("change", () => {
  $("e-p").value = String(PARAMS.presets[$("e-s").value] * 100);
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

for (const id of ["d-v", "d-r", "d-h", "d-s"]) bind(id, renderDefense);
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
const STATE_IDS = ["y-b","y-n","y-m","y-base","l-p","l-t","l-d","c-p","c-t","c-s","e-p","e-s","e-z","r-a","r-b","r-s","d-v","d-r","d-h","d-s"];
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
restoreState();

renderYield(); renderLicense(); renderCharter(); renderExits(); renderRegimes(); renderDefense();
