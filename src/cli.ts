#!/usr/bin/env node
import { aggregate } from "./aggregate.js";
import { classify } from "./classify.js";
import { forecast } from "./forecast.js";
import { genSwaps, type Scenario } from "./sources/mock.js";
import { config, alertsEnabled } from "./config.js";
import { readEpochs, readLatest, writeLatest } from "./store.js";
import { maybeAlert, sendTelegram, telegramCreds } from "./alerts/telegram.js";

const [cmd = "status", ...rest] = process.argv.slice(2);
const arg = (k: string, d: string): string => {
  const m = rest.find((x) => x.startsWith(`--${k}=`));
  return m ? m.split("=")[1] : d;
};

function buildMock(scenario: Scenario, seed: number) {
  const swaps = genSwaps({
    genesisTime: config.genesisTime,
    epochLenSec: config.epochLenSec,
    epochs: 5,
    scenario,
    seed,
  });
  // Treat last epoch as in-progress (partial), finalize the rest.
  const all = aggregate(swaps, config.genesisTime, config.epochLenSec);
  const finalized = classify(all.slice(0, -1));
  const partial = all[all.length - 1];
  const sig = forecast(finalized, partial.fn, partial.buys, partial.sells);
  return { epochs: finalized, sig, partial };
}

function printSignal(): void {
  const sig = readLatest(config.dataDir);
  if (!sig) {
    console.log(JSON.stringify({ error: "no data — run: sentinel demo" }));
    return;
  }
  console.log(JSON.stringify(sig, null, 2));
}

switch (cmd) {
  case "demo": {
    const scenario = arg("scenario", "trend") as Scenario;
    const seed = Number(arg("seed", "42"));
    const { epochs, sig } = buildMock(scenario, seed);
    writeLatest(config.dataDir, sig, epochs);
    console.log(`demo scenario=${scenario} seed=${seed}`);
    console.log(JSON.stringify(sig, null, 2));
    break;
  }
  case "status":
    printSignal();
    break;
  case "history": {
    console.log(JSON.stringify(readEpochs(config.dataDir).slice(-Number(arg("n", "10"))), null, 2));
    break;
  }
  case "watch": {
    const scenario = arg("scenario", "trend") as Scenario;
    console.log(`watching (mock, scenario=${scenario}) every ${config.pollMs}ms — Ctrl+C to stop`);
    console.log(`alerts: ${alertsEnabled ? "telegram enabled" : "disabled (set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID to enable)"}`);
    const tick = async () => {
      const prev = readLatest(config.dataDir);
      const seed = Math.floor(Date.now() / config.pollMs);
      const { epochs, sig } = buildMock(scenario, seed);
      writeLatest(config.dataDir, sig, epochs);
      console.log(JSON.stringify(sig));
      await maybeAlert(prev, sig);
    };
    void tick();
    setInterval(() => void tick(), config.pollMs);
    break;
  }
  case "test-alert": {
    const creds = telegramCreds();
    if (!creds) {
      console.log("telegram not configured — set TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in .env, then retry.");
      console.log('dry-run message would be:\nSTANDARD sentinel: test alert (epoch n)\n• fee route: expansion → contraction');
      break;
    }
    const ok = await sendTelegram(creds, "STANDARD sentinel: test alert — bot is wired up.");
    console.log(ok ? "test alert sent." : "test alert failed (telegram API error).");
    break;
  }
  default:
    console.log("usage: sentinel <demo|status|history|watch|test-alert|serve> [--scenario=trend|chop|bankrun] [--seed=42]");
    break;
  }
