// Telegram alert sink (transitions-only): fires when feeRoute or
// issuanceRegime changes between consecutive finalized signals.
// No-op when TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are unset.
import type { SignalOutput } from "../types.js";
import { config } from "../config.js";

export interface TelegramCreds {
  botToken: string;
  chatId: string;
}

export function telegramCreds(): TelegramCreds | null {
  if (!config.telegramBotToken || !config.telegramChatId) return null;
  return { botToken: config.telegramBotToken, chatId: config.telegramChatId };
}

// Pure: returns the alert text when prev→next is a regime transition, else null.
export function formatTransition(prev: SignalOutput, next: SignalOutput): string | null {
  const changes: string[] = [];
  if (prev.feeRoute !== next.feeRoute) {
    changes.push(`fee route: ${prev.feeRoute ?? "?"} → ${next.feeRoute ?? "?"}`);
  }
  if (prev.issuanceRegime !== next.issuanceRegime) {
    changes.push(`issuance: ${prev.issuanceRegime ?? "?"} → ${next.issuanceRegime ?? "?"}`);
  }
  if (changes.length === 0) return null;
  return [
    `STANDARD sentinel: regime flip (epoch ${next.epoch})`,
    ...changes.map((c) => `• ${c}`),
    `signal ${next.signal} · partial ${next.partialFn} ETH`,
    `flip needs ${next.ethToFlipFee} (fee) / ${next.ethToFlipIssuance} (issuance)`,
  ].join("\n");
}

export async function sendTelegram(creds: TelegramCreds, text: string): Promise<boolean> {
  const res = await fetch(`https://api.telegram.org/bot${creds.botToken}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: creds.chatId, text, disable_web_page_preview: true }),
  });
  return res.ok;
}

// Returns true if a message was sent, false if skipped/failed (never throws).
export async function maybeAlert(prev: SignalOutput | null, next: SignalOutput): Promise<boolean> {
  try {
    if (!prev) return false;
    const text = formatTransition(prev, next);
    if (!text) return false;
    const creds = telegramCreds();
    if (!creds) {
      console.log(`[alert suppressed: no Telegram creds] ${text.split("\n")[0]}`);
      return false;
    }
    const ok = await sendTelegram(creds, text);
    console.log(ok ? `[alert sent] ${text.split("\n")[0]}` : "[alert failed: telegram API error]");
    return ok;
  } catch (err) {
    console.error(`[alert failed: ${err instanceof Error ? err.message : err}]`);
    return false;
  }
}
