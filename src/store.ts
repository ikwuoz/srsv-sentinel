import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { EpochFlow, SignalOutput } from "./types.js";

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function writeLatest(dir: string, signal: SignalOutput, epochs: EpochFlow[]): void {
  ensureDir(dir);
  writeFileSync(join(dir, "latest.json"), JSON.stringify(signal, null, 2));
  writeFileSync(join(dir, "epochs.json"), JSON.stringify(epochs, null, 2));
}

export function readLatest(dir: string): SignalOutput | null {
  const p = join(dir, "latest.json");
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as SignalOutput;
}

export function readEpochs(dir: string): EpochFlow[] {
  const p = join(dir, "epochs.json");
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as EpochFlow[];
}
