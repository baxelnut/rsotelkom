import type { TableSpec } from "../../lib/table-image";
import type { GalaksiPoRow, WitelReport } from "../reports/reports.service";

const KATEGORI = ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"];
const SUBTYPES = ["ao", "so", "do", "mo", "ro"] as const;

const LEVELS = [
  { max: 0, value: 100 },
  { max: 5, value: 80 },
  { max: 10, value: 60 },
  { max: 20, value: 40 },
  { max: Infinity, value: 20 },
];

const num = (value: number) => value.toLocaleString("id-ID");
const achievement = (total: number) =>
  `${(LEVELS.find(({ max }) => total <= max) ?? LEVELS[4]).value}%`;

export function buildAosodomoroTable(
  report: WitelReport[],
  date: string,
): TableSpec {
  const rows = report.map((entry) => {
    const used = entry.kategori.filter((item) =>
      KATEGORI.includes(item.kategori),
    );
    const sum = (pick: (i: (typeof used)[number]) => number) =>
      used.reduce((total, item) => total + pick(item), 0);
    const lt2 = sum((i) => i.lt2.count);
    const gt2 = sum((i) => i.gt2.count);
    const warning = sum((i) => i.warning.count);
    return [entry.witel, lt2, gt2, lt2 + gt2, warning];
  });

  const total = (index: number) =>
    rows.reduce((sum, row) => sum + Number(row[index]), 0);

  return {
    title: "Laporan AOSODOMORO Non Conn",
    subtitle: `Regional 3 | ${date} | ${KATEGORI.join(", ")}`,
    columns: [
      { header: "WITEL" },
      { header: "<2 BLN", align: "right" },
      { header: ">2 BLN", align: "right" },
      { header: "TOTAL", align: "right" },
      { header: "WARNING", align: "right" },
    ],
    rows: rows.map((row) =>
      row.map((cell, i) => (i === 0 ? String(cell) : num(Number(cell)))),
    ),
    footer: [
      "GRAND TOTAL",
      num(total(1)),
      num(total(2)),
      num(total(3)),
      num(total(4)),
    ],
  };
}

export function buildGalaksiTable(
  rows: GalaksiPoRow[],
  date: string,
): TableSpec {
  const totals = (row: GalaksiPoRow) =>
    SUBTYPES.reduce((sum, key) => sum + Number(row[key]), 0);
  const grand = SUBTYPES.map((key) =>
    rows.reduce((sum, row) => sum + Number(row[key]), 0),
  );

  return {
    title: "GALAKSI PO AOSODOMORO Non Conn",
    subtitle: `Order In Process >2 BLN | ${date}`,
    columns: [
      { header: "PROJECT OPERATION" },
      ...SUBTYPES.map((key) => ({
        header: key.toUpperCase(),
        align: "right" as const,
      })),
      { header: "TOTAL", align: "right" },
      { header: "ACH", align: "right" },
    ],
    rows: rows.map((row) => [
      row.po_name,
      ...SUBTYPES.map((key) => num(Number(row[key]))),
      num(totals(row)),
      achievement(totals(row)),
    ]),
    footer: [
      "GRAND TOTAL",
      ...grand.map(num),
      num(grand.reduce((sum, value) => sum + value, 0)),
      "",
    ],
  };
}

export const aosodomoroCaption = (date: string, url: string) =>
  `📊 <b>Laporan AOSODOMORO Non Conn</b>\n${date}\n\n` +
  `Rekap order Regional 3 per witel (&lt;2 BLN dan &gt;2 BLN).\n\n` +
  `Detail lengkap dapat dibuka melalui link berikut:\n🔗 ${url}`;

export const galaksiCaption = (date: string, url: string) =>
  `📊 <b>GALAKSI PO AOSODOMORO Non Conn</b>\n${date}\n\n` +
  `Target: Zero AOSODOMORO &gt;2 BLN\n\n` +
  `Detail lengkap dapat dibuka melalui link berikut:\n🔗 ${url}`;
