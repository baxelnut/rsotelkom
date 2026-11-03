import { env } from "../config/env";
import { AppError } from "./errors";

const base = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;
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

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = err instanceof Error ? err.message : String(err);
      const retryable =
        (err instanceof Error &&
          (err.name === "TimeoutError" || err.name === "TypeError")) || // fetch failed
        /failed: (429|5\d\d)/.test(msg);
      if (!retryable || i === attempts - 1) break;
      await sleep(1000 * 2 ** i); // 1s, 2s
    }
  }
  throw new AppError(
    502,
    "Telegram is unreachable or not responding. Try again shortly.",
    "TELEGRAM_UNAVAILABLE",
  );
}
