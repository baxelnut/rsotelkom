import { env } from "../config/env";
import { AppError } from "./errors";

const base = `${env.TELEGRAM_API_BASE}/bot${env.TELEGRAM_BOT_TOKEN}`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call(method: string, body: Record<string, unknown>) {
  return withRetry(async () => {
    const res = await fetch(`${base}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new Error(
        `Telegram ${method} failed: ${res.status} ${await res.text()}`,
      );
    }
  });
}

export function sendMessage(
  chatId: number | string,
  text: string,
  options: { replyMarkup?: unknown } = {},
) {
  return call("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
    ...(options.replyMarkup ? { reply_markup: options.replyMarkup } : {}),
  });
}

export function sendTyping(chatId: number | string) {
  return call("sendChatAction", { chat_id: chatId, action: "typing" }).catch(
    () => undefined,
  );
}

export async function sendPhoto(
  chatId: number | string,
  photo: Uint8Array,
  caption: string,
) {
  return withRetry(async () => {
    const form = new FormData(); // rebuilt each attempt
    form.append("chat_id", String(chatId));
    form.append("caption", caption);
    form.append("parse_mode", "HTML");
    form.append(
      "photo",
      new Blob([photo], { type: "image/png" }),
      "report.png",
    );

    const res = await fetch(`${base}/sendPhoto`, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      throw new Error(
        `Telegram sendPhoto failed: ${res.status} ${await res.text()}`,
      );
    }
  });
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  for (let i = 0; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`telegram attempt ${i + 1} failed:`, msg);

      const retryable =
        (err instanceof Error &&
          (err.name === "TimeoutError" || err.name === "TypeError")) ||
        /failed: (429|5\d\d)/.test(msg);

      if (!retryable) throw err; // 401/400/403: surface the real error
      if (i >= attempts - 1) {
        throw new AppError(
          502,
          `Telegram unreachable: ${msg}`,
          "TELEGRAM_UNAVAILABLE",
        );
      }
      await sleep(1000 * 2 ** i);
    }
  }
}
