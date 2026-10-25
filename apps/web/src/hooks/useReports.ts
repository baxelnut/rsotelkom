import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type {
  ActionRow,
  AlertGroup,
  ApiResponse,
  GalaksiPoRow,
  GalaksiRow,
  Order,
  Paged,
  PicReport,
  ReportItemsQuery,
  SubtypeReport,
  WitelReport,
} from "@rso/shared";
import { api } from "@/config/api";

type Scope = "all" | "warning";

export function useRegionalReport() {
  return useQuery({
    queryKey: ["reports", "regional-3"],
    queryFn: async () =>
      (await api<ApiResponse<WitelReport[]>>("/reports/regional-3")).data,
    staleTime: 60_000,
  });
}

export function useSubtypeReport() {
  return useQuery({
    queryKey: ["reports", "subtype"],
    queryFn: async () =>
      (await api<ApiResponse<SubtypeReport[]>>("/reports/regional-3/matrix"))
        .data,
    staleTime: 60_000,
  });
}

export function useReportItems(query: ReportItemsQuery | null) {
  return useQuery({
    queryKey: ["reports", "items", query],
    queryFn: () =>
      api<Paged<Order[]>>("/reports/regional-3/items", {
        query: { ...(query as ReportItemsQuery) },
      }),
    enabled: query !== null,
    placeholderData: keepPreviousData,
  });
}

export function useAlertReport() {
  return useQuery({
    queryKey: ["reports", "alert"],
    queryFn: async () =>
      (await api<ApiResponse<AlertGroup[]>>("/reports/alert")).data,
    staleTime: 60_000,
  });
}

export function usePicReport(name: string, scope: Scope = "all", limit = 30) {
  return useQuery({
    queryKey: ["reports", "pic", name, scope, limit],
    queryFn: async () =>
      (
        await api<ApiResponse<PicReport>>("/reports/pic", {
          query: { name, scope, limit },
        })
      ).data,
    enabled: name.trim().length > 0,
  });
}

export function useMyReport(scope: Scope = "all", limit = 30) {
  return useQuery({
    queryKey: ["reports", "me", scope, limit],
    queryFn: async () =>
      (
        await api<ApiResponse<PicReport>>("/reports/me", {
          query: { scope, limit },
        })
      ).data,
  });
}

export function useGalaksi(page = 1, limit = 500) {
  return useQuery({
    queryKey: ["reports", "galaksi", page, limit],
    queryFn: () =>
      api<Paged<GalaksiRow[]>>("/reports/galaksi", { query: { page, limit } }),
    placeholderData: keepPreviousData,
  });
}

export function useGalaksiSummary() {
  return useQuery({
    queryKey: ["reports", "galaksi", "summary"],
    queryFn: async () =>
      (await api<ApiResponse<GalaksiPoRow[]>>("/reports/galaksi/summary")).data,
    staleTime: 60_000,
  });
}

export function useActionRows() {
  return useQuery({
    queryKey: ["reports", "action"],
    queryFn: async () =>
      (await api<ApiResponse<ActionRow[]>>("/reports/action")).data,
    staleTime: 30_000,
  });
}
