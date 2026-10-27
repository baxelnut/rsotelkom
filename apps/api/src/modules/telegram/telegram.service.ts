import { env } from "process";
import { AppError } from "../../lib/errors";
import { supabaseAdmin } from "../../lib/supabase";
import { renderGridPng, renderGridText } from "../../lib/table-image";
import { sendMessage, sendPhoto, sendTyping } from "../../lib/telegram";
import { GridSpec } from "../../types/table-image.types";
import {
  getAlertReport,
  getGalaksiSummary,
  getSubtypeReport,
} from "../reports/reports.service";
import {
  CommandContext,
  handleFeedback,
  handleHelp,
  handleReport,
  handleStart,
} from "./telegram.commands";
import {
  escapeHtml,
  buildAlertMessages,
  todayJakarta,
  formatDateId,
} from "./telegram.format";
import {
  buildAosodomoroTable,
  aosodomoroCaption,
  buildGalaksiTable,
  galaksiCaption,
} from "./telegram.weekly";

const DASHBOARD_URL = env.DASHBOARD_URL ?? "https://rso-web.vercel.app";

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
      case "/laporan":
      case "/report":
        await handleReport(ctx);
        break;
      case "/masukan":
      case "/feedback":
        await handleFeedback(ctx);
        break;
      case "/bantuan":
      case "/help":
        await handleHelp(ctx);
        break;
      default:
        await sendMessage(
          chatId,
          "Perintah tidak dikenal. Gunakan /bantuan untuk melihat daftar perintah.",
        );
    }
  } catch (err) {
    console.error(`telegram ${command} failed`, err);
    const reply =
      err instanceof AppError
        ? escapeHtml(err.message)
        : "Terjadi kesalahan. Silakan coba lagi.";
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
    DASHBOARD_URL,
    todayJakarta(),
  );
  for (const message of messages) await sendMessage(chatId, message);
  return { messages: messages.length };
}

async function sendTable(chatId: string, spec: GridSpec, caption: string) {
  try {
    await sendPhoto(chatId, renderGridPng(spec), caption);
    return "photo" as const;
  } catch (err) {
    console.error("table image failed, falling back to text", err);
    await sendMessage(
      chatId,
      `${caption}\n\n<pre>${escapeHtml(renderGridText(spec))}</pre>`,
    );
    return "text" as const;
  }
}

export async function sendWeeklyReport() {
  const chatId = env.TELEGRAM_CHANNEL_CHAT_ID;
  if (!chatId) {
    throw new AppError(
      503,
      "TELEGRAM_CHANNEL_CHAT_ID is not configured",
      "NOT_CONFIGURED",
    );
  }
  const date = formatDateId();
  const [subtype, galaksi, alerts] = await Promise.all([
    getSubtypeReport(),
    getGalaksiSummary(),
    getAlertReport(),
  ]);
  const aosodomoro = await sendTable(
    chatId,
    buildAosodomoroTable(subtype, date),
    aosodomoroCaption(date, `${env.DASHBOARD_URL}/report/aosodomoro`),
  );
  const galaksiMode = await sendTable(
    chatId,
    buildGalaksiTable(galaksi, date),
    galaksiCaption(date, `${DASHBOARD_URL}/report/galaksi`),
  );

  const messages = buildAlertMessages(alerts, DASHBOARD_URL, todayJakarta());
  for (const message of messages) await sendMessage(chatId, message);

  return { aosodomoro, galaksi: galaksiMode, alerts: messages.length };
}
