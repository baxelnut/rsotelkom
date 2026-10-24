import { useMemo } from "react";
// Hooks
import { queryState } from "./queryState";
import { useSummary } from "./useSummary";
// Config
import { SESSION_KEYS } from "@/config/overview";

export function useSessionBySubtype() {
  const query = useSummary("order-subtype2");

  const items = useMemo(() => {
    const rows = query.data ?? [];
    const totals = SESSION_KEYS.map((key) => ({
      label: key.toUpperCase(),
      value: rows.reduce((sum, row) => sum + (row[key] || 0), 0),
    }));
    const total = totals.reduce((sum, item) => sum + item.value, 0);

    return totals.map((item) => ({
      ...item,
      percentage: total ? (item.value / total) * 100 : 0,
    }));
  }, [query.data]);

  return { ...queryState(query), items };
}

export type SessionBySubtypeApi = ReturnType<typeof useSessionBySubtype>;
