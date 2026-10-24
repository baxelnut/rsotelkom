import type { StatTone } from "@/types/report";

export interface AchievementLevel {
  max: number;
  value: number;
  range: string;
  tone: StatTone;
}

export const ACHIEVEMENT_LEVELS: AchievementLevel[] = [
  { max: 0, value: 100, range: "0", tone: "safe" },
  { max: 5, value: 80, range: "1–5", tone: "safe" },
  { max: 10, value: 60, range: "6–10", tone: "secondary" },
  { max: 20, value: 40, range: "11–20", tone: "danger" },
  { max: Infinity, value: 20, range: ">20", tone: "primary" },
];
