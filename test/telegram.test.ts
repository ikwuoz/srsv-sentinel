import { describe, expect, it, vi, beforeEach } from "vitest";
import { formatTransition, sendTelegram, maybeAlert } from "../src/alerts/telegram.js";
import type { SignalOutput } from "../src/types.js";

const base: SignalOutput = {
  epoch: 4,
  fn: 1.5,
  signal: 0.6,
  feeRoute: "expansion",
  issuanceRegime: "expansion",
  partialFn: 0.3,
  ethToFlipFee: 0,
  ethToFlipIssuance: 0,
  pFlipFee: 0.7,
  pFlipIssuance: 0.2,
  updatedAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("telegram alerter (transitions-only)", () => {
  it("returns null when nothing changed", () => {
    expect(formatTransition(base, { ...base })).toBeNull();
  });

  it("formats fee-route and issuance flips", () => {
    const text = formatTransition(base, {
      ...base,
      epoch: 5,
      feeRoute: "contraction",
      issuanceRegime: "contraction",
    });
    expect(text).toContain("epoch 5");
    expect(text).toContain("expansion → contraction");
  });

  it("posts to the Bot API and reports ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    const ok = await sendTelegram({ botToken: "TOK", chatId: "123" }, "hi");
    expect(ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.telegram.org/botTOK/sendMessage");
    expect(JSON.parse(init.body as string)).toMatchObject({ chat_id: "123", text: "hi" });
  });

  it("maybeAlert never throws and skips silent epochs", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    expect(await maybeAlert(null, base)).toBe(false); // no previous signal
    expect(await maybeAlert(base, { ...base })).toBe(false); // no transition
  });
});
