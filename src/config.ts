// Runtime config. All protocol params redacted in whitepaper v0.1 → env-overridable.
// Values load from process env + .env file (see .env.example).
import "dotenv/config";

export const config = {
  epochLenSec: Number(process.env.EPOCH_LEN_SEC ?? 86400),
  genesisTime: Number(process.env.GENESIS_TIME ?? Math.floor(Date.now() / 1000) - 3 * 86400),
  pollMs: Number(process.env.POLL_MS ?? 30_000),
  port: Number(process.env.PORT ?? 8787),
  dataDir: process.env.DATA_DIR ?? new URL("../data/", import.meta.url).pathname,
  source: (process.env.SOURCE ?? "mock") as "mock" | "live",
  rpcUrl: process.env.RPC_URL ?? "",
  pool: (process.env.POOL ?? "") as `0x${string}` | "",
  confirmations: Number(process.env.CONFIRMATIONS ?? 5),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID ?? "",
};

export const alertsEnabled =
  config.telegramBotToken.length > 0 && config.telegramChatId.length > 0;
