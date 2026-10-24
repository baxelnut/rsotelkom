import { env } from "../../config/env";
import { throwIfError } from "../../lib/db";
import { supabaseAdmin } from "../../lib/supabase";
import { sendMessage } from "../../lib/telegram";
import type { AuthUser } from "../auth/auth.service";
import {
  getPicReport,
  picKey,
  resolvePicName,
} from "../reports/reports.service";
import {
  buildReportMessage,
  COMMAND_LIST,
  escapeHtml,
  todayJakarta,
} from "./telegram.format";

export interface CommandContext {
  chatId: number;
  telegramId: number;
  rest: string;
}

const REPORT_TOP = 10;
const FEEDBACK_MAX = 2000;
const NOT_LINKED =
  "No linked account found. Please go to the Dashboard to connect your Telegram account.";

async function findProfile(telegramId: number) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id,email,full_name,role,telegram_id,is_active")
    .eq("telegram_id", telegramId)
    .maybeSingle();
  throwIfError(error, "telegram profile lookup");
  return data;
}

async function authorize(ctx: CommandContext): Promise<AuthUser | null> {
  const profile = await findProfile(ctx.telegramId);

  if (!profile) {
    await sendMessage(ctx.chatId, NOT_LINKED);
    return null;
  }
  if (!profile.is_active) {
    await sendMessage(ctx.chatId, "Your account is deactivated.");
    return null;
  }
  if (profile.role === "pending") {
    await sendMessage(
      ctx.chatId,
      "⏳ Your account is still waiting for admin approval.",
    );
    return null;
  }

  return {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role,
    telegramId: profile.telegram_id,
  };
}

async function findPicNames(query: string): Promise<string[]> {
  const key = picKey(query);
  const pattern = `%${key.replace(/[\\%_]/g, "\\$&")}%`;

  const { data, error } = await supabaseAdmin
    .from("v_pic_names")
    .select("pic,pic_key")
    .ilike("pic_key", pattern)
    .limit(11);
  throwIfError(error, "pic search");

  const rows = data ?? [];
  const exact = rows.filter((r) => r.pic_key === key);
  return (exact.length === 1 ? exact : rows).map((r) => r.pic as string);
}

export async function handleStart(ctx: CommandContext) {
  const profile = await findProfile(ctx.telegramId);
  if (!profile) {
    await sendMessage(ctx.chatId, NOT_LINKED);
    return;
  }

  const pendingNote =
    profile.role === "pending"
      ? "\n\n⏳ Your account is waiting for admin approval."
      : "";

  await sendMessage(
    ctx.chatId,
    `👋 Welcome, <b>${escapeHtml(profile.full_name || "User")}</b>. Thank you for using the Telkom Dashboard reporting service.${pendingNote}\n\n${COMMAND_LIST}`,
    {
      replyMarkup: {
        inline_keyboard: [
          [{ text: "Go to Dashboard", url: env.DASHBOARD_URL }],
        ],
      },
    },
  );
}

export async function handleHelp(ctx: CommandContext) {
  await sendMessage(ctx.chatId, COMMAND_LIST);
}

export async function handleReport(ctx: CommandContext) {
  const user = await authorize(ctx);
  if (!user) return;

  const query = ctx.rest.trim();
  await sendMessage(ctx.chatId, "📊 Preparing your report. Please wait...");

  let picName: string;
  if (query) {
    const matches = await findPicNames(query);

    if (matches.length === 0) {
      await sendMessage(
        ctx.chatId,
        `❌ No report found for <b>${escapeHtml(query)}</b>. Make sure you typed the full name correctly.`,
      );
      return;
    }
    if (matches.length > 1) {
      const shown = matches
        .slice(0, 10)
        .map((n) => `- ${escapeHtml(n)}`)
        .join("\n");
      const more = matches.length > 10 ? "\n- ..." : "";
      await sendMessage(
        ctx.chatId,
        `⚠️ Ditemukan ${matches.length > 10 ? "lebih dari 10" : matches.length} PIC yang cocok dengan "<b>${escapeHtml(query)}</b>":\n\n${shown}${more}\n\n👉 Mohon ketik nama yang lebih spesifik.`,
      );
      return;
    }
    picName = matches[0];
  } else {
    picName = await resolvePicName(user);
  }

  const report = await getPicReport(picName, "warning", REPORT_TOP);
  const total = Number(report.summary?.total_orders ?? 0);

  if (total === 0) {
    await sendMessage(
      ctx.chatId,
      query
        ? `✅ <b>${escapeHtml(picName)}</b> has no <b>In Process</b> orders aged 20-60 days.`
        : `✅ You don't have any <b>In Process</b> orders aged 20-60 days.`,
    );
    return;
  }

  await sendMessage(
    ctx.chatId,
    buildReportMessage({
      picName,
      witel: report.items[0]?.new_witel ?? "-",
      items: report.items,
      total,
      dashboardUrl: env.DASHBOARD_URL, // TODO: replace with actual prod url (see apps\api\.env)
      date: todayJakarta(),
    }),
  );
}

export async function handleFeedback(ctx: CommandContext) {
  const text = ctx.rest.trim();

  if (!text) {
    await sendMessage(
      ctx.chatId,
      "Please provide your feedback after the command.\n\n<b>Example:</b>\n<i>/feedback Bot ini membingungkan 😅</i>",
    );
    return;
  }
  if (text.length > FEEDBACK_MAX) {
    await sendMessage(
      ctx.chatId,
      `Your feedback is too long. Please keep it under ${FEEDBACK_MAX} characters.`,
    );
    return;
  }

  const profile = await findProfile(ctx.telegramId);
  const { error } = await supabaseAdmin.from("feedback").insert({
    telegram_id: ctx.telegramId,
    chat_id: ctx.chatId,
    user_id: profile?.id ?? null,
    message: text,
  });
  throwIfError(error, "feedback insert");

  if (env.TELEGRAM_ADMIN_CHAT_ID) {
    const sender = profile?.full_name
      ? `${escapeHtml(profile.full_name)} (${ctx.telegramId})`
      : String(ctx.telegramId);
    await sendMessage(
      env.TELEGRAM_ADMIN_CHAT_ID,
      `📩 New feedback from <b>${sender}</b>:\n\n${escapeHtml(text)}`,
    ).catch((err) => console.error("feedback notify failed", err));
  }

  await sendMessage(
    ctx.chatId,
    "✅ Thanks for your feedback! We're building this with you 🚀",
  );
}
