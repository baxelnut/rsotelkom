import type { Amount, KategoriReport, SubtypeReport } from "@rso/shared";
import type { ReportBucketFilter } from "@rso/shared";
// Config
import { SUBTYPE_ORDER } from "@/config/overview";
import { BUCKET_LABEL, IN_PROCESS, WITEL_ORDER } from "@/config/report";
// Types
import type {
  Matrix,
  MatrixCell,
  MatrixColumn,
  MatrixRow,
  ReportSelection,
  ReportStat,
} from "@/types/report";
import type { SheetSpec } from "@/types/workbook";

const EMPTY: Amount = { count: 0, revenue: 0 };

const add = (a: Amount, b: Amount): Amount => ({
  count: a.count + b.count,
  revenue: a.revenue + b.revenue,
});

function rank(list: readonly string[], value: string) {
  if (value === "N/A") return list.length + 1;
  const index = list.indexOf(value);
  return index === -1 ? list.length : index;
}

function sortReport(report: SubtypeReport[]): SubtypeReport[] {
  return [...report].sort(
    (a, b) =>
      rank(SUBTYPE_ORDER, a.subtype) - rank(SUBTYPE_ORDER, b.subtype) ||
      a.subtype.localeCompare(b.subtype) ||
      rank(WITEL_ORDER, a.witel) - rank(WITEL_ORDER, b.witel) ||
      a.witel.localeCompare(b.witel),
  );
}

function bucketAmount(
  entry: KategoriReport | undefined,
  bucket: ReportBucketFilter,
): Amount {
  if (!entry) return EMPTY;
  return bucket === "all" ? add(entry.lt2, entry.gt2) : entry[bucket];
}

function mergeInto(
  target: Map<string, KategoriReport>,
  items: KategoriReport[],
) {
  for (const item of items) {
    const current = target.get(item.kategori);
    target.set(item.kategori, {
      kategori: item.kategori,
      lt2: add(current?.lt2 ?? EMPTY, item.lt2),
      warning: add(current?.warning ?? EMPTY, item.warning),
      gt2: add(current?.gt2 ?? EMPTY, item.gt2),
    });
  }
}

function buildColumns(kategori: string[]): MatrixColumn[] {
  const group = (bucket: "lt2" | "gt2", tone: "safe" | "primary") => [
    ...kategori.map(
      (name): MatrixColumn => ({
        id: `${bucket}-${name}`,
        label: name,
        bucket,
        kategori: [name],
        total: false,
        tone,
      }),
    ),
    {
      id: `${bucket}-total`,
      label: "Total",
      bucket,
      kategori,
      total: true,
      tone,
    },
  ];

  return [
    ...group("lt2", "safe"),
    ...group("gt2", "primary"),
    {
      id: "all",
      label: "Grand total",
      bucket: "all",
      kategori,
      total: true,
      tone: "secondary",
    },
  ];
}

function toCells(
  totals: Map<string, KategoriReport>,
  columns: MatrixColumn[],
): MatrixCell[] {
  return columns.map((column) => ({
    amount: column.kategori.reduce(
      (sum, name) => add(sum, bucketAmount(totals.get(name), column.bucket)),
      EMPTY,
    ),
    warning:
      !column.total &&
      column.bucket === "lt2" &&
      column.kategori[0] === IN_PROCESS
        ? (totals.get(IN_PROCESS)?.warning ?? EMPTY)
        : null,
  }));
}

function buildStats(
  columns: MatrixColumn[],
  cells: MatrixCell[],
  warning: Amount,
): ReportStat[] {
  const at = (id: string) =>
    cells[columns.findIndex((column) => column.id === id)].amount;

  return [
    { label: "Total order", tone: "secondary", ...at("all") },
    { label: "Kurang dari 2 bulan", tone: "safe", ...at("lt2-total") },
    { label: "Lebih dari 2 bulan", tone: "primary", ...at("gt2-total") },
    { label: "Peringatan (20 hingga 60 hari)", tone: "danger", ...warning },
  ];
}

export function buildMatrix(
  report: SubtypeReport[],
  kategori: string[],
): Matrix {
  const columns = buildColumns(kategori);
  const grand = new Map<string, KategoriReport>();
  const groups = new Map<
    string,
    { totals: Map<string, KategoriReport>; rows: MatrixRow[] }
  >();

  for (const entry of sortReport(report)) {
    const own = new Map<string, KategoriReport>();
    mergeInto(own, entry.kategori);
    mergeInto(grand, entry.kategori);

    const group = groups.get(entry.subtype) ?? {
      totals: new Map<string, KategoriReport>(),
      rows: [] as MatrixRow[],
    };
    mergeInto(group.totals, entry.kategori);
    group.rows.push({
      key: `${entry.subtype}|${entry.witel}`,
      kind: "witel",
      label: entry.witel,
      subtype: entry.subtype,
      witel: entry.witel,
      cells: toCells(own, columns),
    });
    groups.set(entry.subtype, group);
  }

  const rows: MatrixRow[] = [];
  for (const [subtype, group] of groups) {
    rows.push(
      {
        key: subtype,
        kind: "subtype",
        label: subtype,
        subtype,
        cells: toCells(group.totals, columns),
      },
      ...group.rows,
    );
  }

  const grandCells = toCells(grand, columns);
  rows.push({
    key: "grand",
    kind: "grand",
    label: "GRAND TOTAL",
    cells: grandCells,
  });

  return {
    columns,
    rows,
    stats: buildStats(
      columns,
      grandCells,
      grand.get(IN_PROCESS)?.warning ?? EMPTY,
    ),
  };
}

export function buildSummarySheet(
  report: SubtypeReport[],
  kategori: string[],
): SheetSpec {
  const rows = sortReport(report)
    .flatMap((entry) =>
      kategori.flatMap((name) => {
        const item = entry.kategori.find((i) => i.kategori === name);
        if (!item) return [];
        return [
          {
            subtype: entry.subtype,
            witel: entry.witel,
            kategori: name,
            lt2Count: item.lt2.count,
            lt2Revenue: item.lt2.revenue,
            gt2Count: item.gt2.count,
            gt2Revenue: item.gt2.revenue,
            totalCount: item.lt2.count + item.gt2.count,
            totalRevenue: item.lt2.revenue + item.gt2.revenue,
            warningCount: item.warning.count,
          },
        ];
      }),
    )
    .filter((row) => row.totalCount > 0);

  const sum = (key: keyof (typeof rows)[number]) =>
    rows.reduce((total, row) => total + Number(row[key]), 0);

  return {
    name: "Summary",
    rows,
    footer: {
      subtype: "TOTAL",
      lt2Count: sum("lt2Count"),
      lt2Revenue: sum("lt2Revenue"),
      gt2Count: sum("gt2Count"),
      gt2Revenue: sum("gt2Revenue"),
      totalCount: sum("totalCount"),
      totalRevenue: sum("totalRevenue"),
      warningCount: sum("warningCount"),
    },
    columns: [
      { key: "subtype", header: "Sub-type", width: 11 },
      { key: "witel", header: "Witel", width: 20 },
      { key: "kategori", header: "Kategori", width: 20 },
      {
        key: "lt2Count",
        header: "<2 BLN Orders",
        width: 15,
        format: "integer",
      },
      {
        key: "lt2Revenue",
        header: "<2 BLN Revenue (Rp)",
        width: 22,
        format: "money",
      },
      {
        key: "gt2Count",
        header: ">2 BLN Orders",
        width: 15,
        format: "integer",
      },
      {
        key: "gt2Revenue",
        header: ">2 BLN Revenue (Rp)",
        width: 22,
        format: "money",
      },
      {
        key: "totalCount",
        header: "Total Order",
        width: 14,
        format: "integer",
      },
      {
        key: "totalRevenue",
        header: "Total Revenue (Rp)",
        width: 22,
        format: "money",
      },
      {
        key: "warningCount",
        header: "Warning Orders",
        width: 16,
        format: "integer",
      },
    ],
  };
}

export function selectionQuery(selection: ReportSelection) {
  return {
    witel: selection.witel,
    subtype: selection.subtype,
    pic: selection.pic,
    status: selection.status,
    alert: selection.alert,
    kategori: selection.kategori.join(","),
    bucket: selection.bucket,
  };
}

const isBucket = (value: string | null): value is ReportBucketFilter =>
  !!value && value in BUCKET_LABEL;

export function readSelection(params: URLSearchParams): ReportSelection | null {
  const bucket = params.get("bucket");
  const kategori = (params.get("kategori") ?? "").split(",").filter(Boolean);
  if (!isBucket(bucket) || kategori.length === 0) return null;

  const alert = params.get("alert");
  return {
    witel: params.get("witel") ?? undefined,
    subtype: params.get("subtype") ?? undefined,
    pic: params.get("pic") ?? undefined,
    status: params.get("status") ?? undefined,
    alert: alert === "aman" || alert === "segera" ? alert : undefined,
    kategori,
    bucket,
  };
}

export function writeSelection(selection: ReportSelection): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(selectionQuery(selection))) {
    if (value) params.set(key, value);
  }
  return params;
}

export function describeSelection(selection: ReportSelection): string[] {
  return [
    selection.subtype ?? "All sub-types",
    selection.witel ?? "All witels",
    selection.kategori.length === 1
      ? selection.kategori[0]
      : "Selected categories",
    BUCKET_LABEL[selection.bucket],
  ];
}
