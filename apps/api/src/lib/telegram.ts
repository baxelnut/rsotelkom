import { env } from "../config/env";

const base = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}`;

async function call(method: string, body: Record<string, unknown>) {
  const res = await fetch(`${base}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    throw new Error(
      `Telegram ${method} failed: ${res.status} ${await res.text()}`,
    );
  }
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
