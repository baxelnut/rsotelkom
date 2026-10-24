import type { AlertGroup } from "../reports/reports.service";

const ACTION_PATH = "/action";
const MESSAGE_LIMIT = 3900;

export const COMMAND_LIST =
  "<b>Available Commands:</b>\n" +
  "/report - Show all PIC reports\n" +
  "/report [name] - Summary report for specific PIC (e.g. /report jeremy)\n" +
  "/feedback - Give feedback (bug or feature)\n" +
  "\nUse /help to show commands";

export const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export const todayJakarta = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta" }).format(
    new Date(),
  );

export interface ReportItem {
  order_id: string | null;
  order_subtype: string | null;
}

export function buildReportMessage(input: {
  picName: string;
  witel: string;
  items: ReportItem[];
  total: number;
  dashboardUrl: string;
  date: string;
}): string {
  const rows = input.items
    .map((i) => `${i.order_id || "-"}  | ${i.order_subtype || "-"}`)
    .join("\n");

  const more =
    input.total > input.items.length
      ? `\n<i>Data yang ditampilkan Top ${input.items.length} Umur Order, selebihnya dapat dicek melalui link:</i>\n🔗 ${input.dashboardUrl}\n\n`
      : "";

  return (
    `📢 <b>Alert Order Mendekati &gt;2 BLN</b>\n\n` +
    `<i>Witel: ${escapeHtml(input.witel)}</i>\n` +
    `<i>PO: ${escapeHtml(input.picName)}</i>\n\n` +
    `⚠️ <b>ORDER 20-60 hari (A1 : Prioritas)</b>\n` +
    `<pre>ORDERID     | ORDERSUBTYPE\n--------------------------------\n${escapeHtml(rows)}</pre>\n\n` +
    `Waktu Update: ${input.date}\n\n` +
    more +
    `🔗 ${input.dashboardUrl}${ACTION_PATH}`
  );
}

export function buildAlertMessages(
  groups: AlertGroup[],
  dashboardUrl: string,
  date: string,
): string[] {
  if (groups.length === 0) {
    return ["✅ Tidak ada order yang perlu diingatkan saat ini."];
  }

  const header =
    "📢 <b>Pemberitahuan Potensi Order &gt; 2 Bulan</b>\n\n" +
    "Berikut daftar order yang hampir melewati 2 bulan:\n\n";
  const footer =
    "\n\n⚠️ <i>Mohon segera dilakukan follow-up sebelum melewati batas waktu</i> ⚠️\n\n" +
    `Waktu Update: ${date}\n\n` +
    `🔗 ${dashboardUrl}${ACTION_PATH}`;

  const blocks = groups.map((g) => {
    const summary = Object.entries(g.statuses)
      .map(([status, count]) => `${escapeHtml(status)}: ${count}`)
      .join(" | ");
    return `🙎 ${escapeHtml(g.pic)} - ${escapeHtml(g.witel)}\n${summary} | Total: ${g.total}`;
  });

  const pages: string[][] = [[]];
  let size = header.length;
  for (const block of blocks) {
    const cost = block.length + 2;
    const current = pages[pages.length - 1];
    if (size + cost + footer.length > MESSAGE_LIMIT && current.length > 0) {
      pages.push([]);
      size = 0;
    }
    pages[pages.length - 1].push(block);
    size += cost;
  }

  return pages.map(
    (page, i) =>
      (i === 0 ? header : "") +
      page.join("\n\n") +
      (i === pages.length - 1 ? footer : ""),
  );
}
