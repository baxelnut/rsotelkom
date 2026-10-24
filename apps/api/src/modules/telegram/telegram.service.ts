import { env } from "../../config/env";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import { sendMessage, sendTyping } from "../../lib/telegram";
import { getAlertReport } from "../reports/reports.service";
import {
  handleFeedback,
  handleHelp,
  handleReport,
  handleStart,
  type CommandContext,
} from "./telegram.commands";
import {
  buildAlertMessages,
  escapeHtml,
  todayJakarta,
} from "./telegram.format";

export interface TelegramUpdate {
  update_id?: number;
  message?: {
    text?: string;
    chat: { id: number };
    from?: { id: number };
  };
}

async function isDuplicate(updateId: number): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("telegram_updates")
    .insert({ update_id: updateId });
  if (!error) return false;
  if (error.code === "23505") return true;
  throw new Error(`telegram_updates insert: ${error.message}`);
}

export async function processUpdate(update: TelegramUpdate) {
  const text = update.message?.text?.trim();
  const chatId = update.message?.chat.id;
  const telegramId = update.message?.from?.id;
  if (!text || chatId === undefined || telegramId === undefined) return;

  if (update.update_id !== undefined && (await isDuplicate(update.update_id))) {
    return;
  }

  await sendTyping(chatId);

  const match = /^(\S+)\s*([\s\S]*)$/.exec(text);
  const command = (match?.[1] ?? "").toLowerCase().split("@")[0];
  const ctx: CommandContext = { chatId, telegramId, rest: match?.[2] ?? "" };

  try {
    switch (command) {
      case "/start":
        await handleStart(ctx);
        break;
      case "/report":
        await handleReport(ctx);
        break;
      case "/feedback":
        await handleFeedback(ctx);
        break;
      case "/help":
        await handleHelp(ctx);
        break;
      default:
        await sendMessage(
          chatId,
          "Unknown command. Please use /help for a list of available commands.",
        );
    }
  } catch (err) {
    console.error(`telegram ${command} failed`, err);
    const reply =
      err instanceof AppError
        ? escapeHtml(err.message)
        : "Something went wrong. Please try again.";
    await sendMessage(chatId, reply).catch(() => undefined);
  }
}

export async function sendAlertToChannel() {
  const chatId = env.TELEGRAM_CHANNEL_CHAT_ID;
  if (!chatId) {
    throw new AppError(
      503,
      "TELEGRAM_CHANNEL_CHAT_ID is not configured",
      "NOT_CONFIGURED",
    );
  }

  const messages = buildAlertMessages(
    await getAlertReport(),
    env.DASHBOARD_URL,
    todayJakarta(),
  );
  for (const message of messages) await sendMessage(chatId, message);
  return { messages: messages.length };
}
