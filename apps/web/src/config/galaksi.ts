import type { StatTone } from "@/types/report";

export interface AchievementLevel {
  max: number;
  value: number;
  range: string;
  tone: StatTone;
}

export const ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { max: 0, value: 100, range: "0", tone: "primary" },
  { max: 5, value: 80, range: "1–5", tone: "secondary" },
  { max: 10, value: 60, range: "6–10", tone: "secondary" },
  { max: 20, value: 40, range: "11–20", tone: "danger" },
  { max: Infinity, value: 20, range: ">20", tone: "danger" },
];

export const WITEL_ORDER = [
  "Suramadu",
  "Jatim Barat",
  "Jatim Timur",
  "Bali",
  "Nusa Tenggara",
  "Semarang Jateng Utara",
  "Solo Jateng Timur",
  "Yogya Jateng Selatan",
] as const;

export type Witel = (typeof WITEL_ORDER)[number];

export const witelKey = (s: string) =>
  s.trim().toUpperCase().replace(/\s+/g, " ");

const ORDER_INDEX = new Map(WITEL_ORDER.map((w, i) => [witelKey(w), i]));

export const witelRank = (w?: string | null) =>
  ORDER_INDEX.get(witelKey(w ?? "")) ?? WITEL_ORDER.length;

const LABELS = new Map(WITEL_ORDER.map((w) => [witelKey(w), w]));
export const witelLabel = (w?: string | null) =>
  w ? (LABELS.get(witelKey(w)) ?? w) : "-";
