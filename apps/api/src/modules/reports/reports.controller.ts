import type { RequestHandler } from "express";
import { z } from "zod";
import type { ApiResponse } from "@rso/shared";
import { currentUser } from "../../middleware/auth";
import {
  getActionReport,
  getAlertReport,
  getGalaksiSummary,
  getPicReport,
  getRegionalReport,
  getSubtypeReport,
  listAllReportOrders,
  listGalaksi,
  listReportItems,
  resolvePicName,
  type OrderRow,
} from "./reports.service";

type Paged<T> = ApiResponse<T> & {
  meta: { total: number; page: number; limit: number };
};

const filterQuery = z.object({
  witel: z.string().min(1).optional(),
  subtype: z.string().min(1).optional(),
  kategori: z
    .string()
    .optional()
    .transform((value) =>
      value
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  pic: z.string().min(1).optional(),
  status: z
    .enum(["Lanjut", "Cancel", "Bukan Order Reg", "No Status"])
    .optional(),
  alert: z.enum(["aman", "segera"]).optional(),
  bucket: z.enum(["lt2", "warning", "gt2", "all"]).default("all"),
});

const itemsQuery = filterQuery.extend({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
});

const picQuery = z.object({
  name: z.string().min(1).max(100),
  scope: z.enum(["all", "warning"]).default("all"),
  limit: z.coerce.number().int().min(1).max(500).default(30),
});

const meQuery = picQuery.omit({ name: true });

const galaksiQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(500),
});

export const regionalReport: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof getRegionalReport>>> = {
    data: await getRegionalReport(),
  };
  res.json(body);
};

export const subtypeReport: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof getSubtypeReport>>> = {
    data: await getSubtypeReport(),
  };
  res.json(body);
};

export const regionalItems: RequestHandler = async (req, res) => {
  const filter = itemsQuery.parse(req.query);
  const { rows, total } = await listReportItems(filter);
  const body: Paged<typeof rows> = {
    data: rows,
    meta: { total, page: filter.page, limit: filter.limit },
  };
  res.json(body);
};

export const exportItems: RequestHandler = async (req, res) => {
  const filter = filterQuery.parse(req.query);
  const body: ApiResponse<OrderRow[]> = {
    data: await listAllReportOrders(filter),
  };
  res.json(body);
};

export const alertReport: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof getAlertReport>>> = {
    data: await getAlertReport(),
  };
  res.json(body);
};

export const picReport: RequestHandler = async (req, res) => {
  const { name, scope, limit } = picQuery.parse(req.query);
  const body: ApiResponse<Awaited<ReturnType<typeof getPicReport>>> = {
    data: await getPicReport(name, scope, limit),
  };
  res.json(body);
};

export const myReport: RequestHandler = async (req, res) => {
  const { scope, limit } = meQuery.parse(req.query);
  const name = await resolvePicName(currentUser(req));
  const body: ApiResponse<Awaited<ReturnType<typeof getPicReport>>> = {
    data: await getPicReport(name, scope, limit),
  };
  res.json(body);
};

export const galaksi: RequestHandler = async (req, res) => {
  const { page, limit } = galaksiQuery.parse(req.query);
  const { rows, total } = await listGalaksi(page, limit);
  const body: Paged<typeof rows> = { data: rows, meta: { total, page, limit } };
  res.json(body);
};

export const galaksiSummary: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof getGalaksiSummary>>> = {
    data: await getGalaksiSummary(),
  };
  res.json(body);
};

export const actionReport: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof getActionReport>>> = {
    data: await getActionReport(),
  };
  res.json(body);
};
