import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { config } from "./config.js";
import { readEpochs, readLatest } from "./store.js";

const app = new Hono();

app.get("/signal", (c) => {
  const sig = readLatest(config.dataDir);
  if (!sig) return c.json({ error: "no data — run: sentinel demo" }, 404);
  return c.json(sig);
});

app.get("/epochs", (c) => {
  const n = Number(c.req.query("n") ?? 10);
  return c.json(readEpochs(config.dataDir).slice(-n));
});

app.get("/health", (c) => c.json({ ok: true }));

serve({ fetch: app.fetch, port: config.port }, (info) => {
  console.log(`sentinel api on http://localhost:${info.port} — GET /signal /epochs?n=10`);
});
