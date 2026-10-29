import type {
  GridCell,
  GridRow,
  GridSpec,
  HeadCell,
} from "../../types/table-image.types";
import type {
  GalaksiPoRow,
  KategoriReport,
  SubtypeReport,
} from "../reports/reports.service";

const KATEGORI = ["PROVIDE ORDER", "IN PROCESS", "READY TO BILL"];
const normalize = (s: string | null | undefined) =>
  (s ?? "").toUpperCase().replace(/\s+/g, "");
const KATEGORI_KEYS = new Set(KATEGORI.map(normalize));

const SUBTYPES = ["ao", "so", "do", "mo", "ro"] as const;
const LEVELS = [
  { max: 0, value: 100, tone: "primary" },
  { max: 5, value: 80, tone: "secondary" },
  { max: 10, value: 60, tone: "secondary" },
  { max: 20, value: 40, tone: "danger" },
  { max: Infinity, value: 20, tone: "danger" },
] as const;
// mirrors .badge.ach--* in cards.css
const BADGE = {
  primary: { fill: "#008000", color: "#ffffff" }, // green
  secondary: { fill: "#ffff00", color: "#000000" }, // yellow
  danger: { fill: "#ff0000", color: "#ffffff" }, // red
};

const levelFor = (total: number) =>
  LEVELS.find(({ max }) => total <= max) ?? LEVELS[4];
const num = (value: number) => value.toLocaleString("id-ID");

type Amt = { count: number; revenue: number };
const ZERO: Amt = { count: 0, revenue: 0 };
const addAmt = (a: Amt, b: Amt): Amt => ({
  count: a.count + b.count,
  revenue: a.revenue + b.revenue,
});

const SUBTYPE_ORDER = ["AO", "SO", "DO", "MO", "RO"];
const WITEL_LABELS = [
  "Suramadu",
  "Jatim Barat",
  "Jatim Timur",
  "Bali",
  "Nusa Tenggara",
  "Semarang Jateng Utara",
  "Solo Jateng Timur",
  "Yogya Jateng Selatan",
];
const witelKey = (s: string) => s.trim().toUpperCase().replace(/\s+/g, " ");
// uppercase keys, same as the data and the FE
const WITEL_ORDER = WITEL_LABELS.map(witelKey);
const witelLabel = (w?: string | null) =>
  w ? (WITEL_LABELS.find((l) => witelKey(l) === witelKey(w)) ?? w) : "-";
const witelRank = (w?: string | null) => {
  const i = WITEL_ORDER.indexOf(witelKey(w ?? ""));
  return i === -1 ? WITEL_ORDER.length : i;
};

// every subtype x witel pair must exist, even with 0 orders
function fillGaps(report: SubtypeReport[]): SubtypeReport[] {
  const seen = new Set(report.map((e) => `${e.subtype}|${e.witel}`));
  const filled = [...report];
  for (const subtype of SUBTYPE_ORDER)
    for (const witel of WITEL_ORDER)
      if (!seen.has(`${subtype}|${witel}`))
        filled.push({ subtype, witel, kategori: [] });
  return filled;
}
const IN_PROCESS_KEY = "INPROCESS";

const rank = (list: readonly string[], v: string) => {
  if (v === "N/A") return list.length + 1;
  const i = list.indexOf(v);
  return i === -1 ? list.length : i;
};

const compactRp = (value: number) => {
  const suffixes = ["", "rb", "jt", "M"];
  let n = Math.abs(value);
  let i = 0;
  while (n >= 1000 && i < suffixes.length - 1) {
    n /= 1000;
    i++;
  }
  return `${value < 0 ? "-" : ""}Rp${n.toFixed(1)}${suffixes[i]}`;
};

function mergeInto(
  target: Map<string, KategoriReport>,
  items: KategoriReport[],
) {
  for (const item of items) {
    const key = normalize(item.kategori);
    const cur = target.get(key);
    target.set(key, {
      kategori: item.kategori,
      lt2: addAmt(cur?.lt2 ?? ZERO, item.lt2),
      warning: addAmt(cur?.warning ?? ZERO, item.warning),
      gt2: addAmt(cur?.gt2 ?? ZERO, item.gt2),
    });
  }
}

type Tone = { fill: string; color: string; warn: string; zero: string };
const TONE_WITEL: Tone = {
  fill: "#ffffff",
  color: "#2c2c2c",
  warn: "#8a6300",
  zero: "#959999",
};
const TONE_SUBTYPE: Tone = {
  fill: "#312a68",
  color: "#ffffff",
  warn: "#ffffff",
  zero: "#f6b3b6",
};
const TONE_GRAND: Tone = {
  fill: "#2c2c2c",
  color: "#ffffff",
  warn: "#ffb900",
  zero: "#959999",
};

function toRow(
  label: string,
  totals: Map<string, KategoriReport>,
  tone: Tone,
  bold: boolean,
  striped = false,
): GridRow {
  const amt = (keys: string[], bucket: "lt2" | "gt2" | "all"): Amt =>
    keys.reduce((sum, k) => {
      const e = totals.get(k);
      if (!e) return sum;
      return addAmt(sum, bucket === "all" ? addAmt(e.lt2, e.gt2) : e[bucket]);
    }, ZERO);

  const cell = (a: Amt, extra: Partial<GridCell> = {}): GridCell =>
    a.count === 0
      ? { text: "0", color: tone.zero }
      : { text: num(a.count), sub: compactRp(a.revenue), ...extra };

  const keys = [...KATEGORI_KEYS];
  const inProcessWarn = totals.get(IN_PROCESS_KEY)?.warning ?? ZERO;

  const cells: GridCell[] = [{ text: label }];
  for (const bucket of ["lt2", "gt2"] as const) {
    for (const k of keys) {
      const extra: Partial<GridCell> =
        bucket === "lt2" && k === IN_PROCESS_KEY && inProcessWarn.count > 0
          ? { warn: num(inProcessWarn.count) }
          : {};
      cells.push(cell(amt([k], bucket), extra));
    }
    cells.push(cell(amt(keys, bucket), { bold: true }));
  }
  cells.push(cell(amt(keys, "all"), { bold: true }));

  return {
    cells,
    fill: striped ? "#f8f8f8" : tone.fill,
    color: tone.color,
    bold,
    warnColor: tone.warn,
  };
}

export function buildAosodomoroTable(
  report: SubtypeReport[],
  date: string,
): GridSpec {
  const sorted = [...fillGaps(report)].sort(
    (a, b) =>
      rank(SUBTYPE_ORDER, a.subtype) - rank(SUBTYPE_ORDER, b.subtype) ||
      a.subtype.localeCompare(b.subtype) ||
      rank(WITEL_ORDER, a.witel) - rank(WITEL_ORDER, b.witel) ||
      a.witel.localeCompare(b.witel),
  );

  const grand = new Map<string, KategoriReport>();
  const groups = new Map<
    string,
    { totals: Map<string, KategoriReport>; rows: GridRow[] }
  >();

  for (const entry of sorted) {
    const own = new Map<string, KategoriReport>();
    mergeInto(own, entry.kategori);
    mergeInto(grand, entry.kategori);

    const group: { totals: Map<string, KategoriReport>; rows: GridRow[] } =
      groups.get(entry.subtype) ?? { totals: new Map(), rows: [] };
    mergeInto(group.totals, entry.kategori);
    group.rows.push(
      toRow(entry.witel, own, TONE_WITEL, false, group.rows.length % 2 === 1),
    );
    groups.set(entry.subtype, group);
  }

  const rows: GridRow[] = [];
  for (const [subtype, group] of groups) {
    rows.push(toRow(subtype, group.totals, TONE_SUBTYPE, true), ...group.rows);
  }
  rows.push(toRow("GRAND TOTAL", grand, TONE_GRAND, true));

  const labels = KATEGORI;
  const head: HeadCell[] = [
    { text: "WITEL", col: 0, row: 0, rowSpan: 2 },
    {
      text: "<2 BLN",
      col: 1,
      row: 0,
      colSpan: labels.length + 1,
      color: "#00795a",
      underline: "#00c68d",
    },
    {
      text: ">2 BLN",
      col: labels.length + 2,
      row: 0,
      colSpan: labels.length + 1,
      color: "#c9141e",
      underline: "#312a68",
    },
    {
      text: "GRAND TOTAL",
      col: labels.length * 2 + 3,
      row: 0,
      rowSpan: 2,
      color: "#0065a6",
      underline: "#007dcc",
    },
  ];
  for (const start of [1, labels.length + 2]) {
    labels.forEach((l, i) => head.push({ text: l, col: start + i, row: 1 }));
    head.push({ text: "TOTAL", col: start + labels.length, row: 1 });
  }

  return {
    title: "Laporan AOSODOMORO Non Conn",
    subtitle: `Regional 3 | ${date}`,
    cols: labels.length * 2 + 4,
    headRows: 2,
    head,
    rows,
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

export function buildGalaksiTable(
  input: GalaksiPoRow[],
  date: string,
): GridSpec {
  const rows = [...input].sort(
    (a, b) =>
      witelRank(a.witel) - witelRank(b.witel) ||
      a.po_name.localeCompare(b.po_name),
  );
  const sum = (row: GalaksiPoRow) =>
    SUBTYPES.reduce((s, k) => s + Number(row[k] || 0), 0);
  const grand = SUBTYPES.map((k) =>
    rows.reduce((s, r) => s + Number(r[k] || 0), 0),
  );

  const body: GridRow[] = rows.map((row, i) => {
    const level = levelFor(sum(row));
    return {
      fill: i % 2 === 0 ? "#ffffff" : "#f8f8f8",
      color: "#2c2c2c",
      cells: [
        { text: row.po_name },
        { text: witelLabel(row.witel) },
        ...SUBTYPES.map((k) => {
          const v = Number(row[k] || 0);
          return { text: num(v), color: v === 0 ? "#959999" : undefined };
        }),
        { text: num(sum(row)), bold: true, fill: "#e8e9e9" },
        { text: `${level.value}%`, badge: BADGE[level.tone] },
      ],
    };
  });

  body.push({
    fill: "#2c2c2c",
    color: "#ffffff",
    bold: true,
    cells: [
      { text: "GRAND TOTAL" },
      { text: "" },
      ...grand.map((g) => ({ text: num(g) })),
      { text: num(grand.reduce((s, v) => s + v, 0)) },
      { text: "" },
    ],
  });

  return {
    title: "GALAKSI PO AOSODOMORO Non Conn",
    subtitle: `Order In Process >2 BLN | ${date}`,
    cols: 9,
    headRows: 2,
    head: [
      { text: "PO", col: 0, row: 0, rowSpan: 2 },
      { text: "WITEL", col: 1, row: 0, rowSpan: 2 },
      {
        text: ">2 BLN",
        col: 2,
        row: 0,
        colSpan: 5,
        color: "#c9141e",
        underline: "#312a68",
      },
      ...SUBTYPES.map((k, i) => ({
        text: k.toUpperCase(),
        col: 2 + i,
        row: 1,
      })),
      { text: "GRAND TOTAL", col: 7, row: 0, rowSpan: 2 },
      { text: "ACHIEVEMENT", col: 8, row: 0, rowSpan: 2 },
    ],
    rows: body,
  };
}
