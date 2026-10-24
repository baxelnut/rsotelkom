import type { RequestHandler } from "express";
import { z } from "zod";
import type { ApiResponse } from "@rso/shared";
import { editLog } from "../../lib/audit-log";
import { currentUser } from "../../middleware/auth";
import {
  getSummary,
  listOrders,
  listPo,
  SUMMARY_VIEWS,
  updateOrder,
} from "./sheets.service";
import { recentRuns, syncDatasets } from "./sheets.sync";

const syncQuery = z.object({
  dataset: z.enum(["all", "orders", "po"]).default("all"),
  force: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

const ordersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(100),
  kategori: z.string().optional(),
  witel: z.string().optional(),
  pic: z.string().optional(),
  status: z.string().optional(),
  minAge: z.coerce.number().int().optional(),
  maxAge: z.coerce.number().int().optional(),
});

const patchBody = z
  .object({
    status: z.string().max(100).optional(),
    notes: z.string().max(5000).optional(),
  })
  .refine(
    (b) => b.status !== undefined || b.notes !== undefined,
    "status or notes is required",
  );

const uuidParam = z.object({ uuid: z.string().min(1).max(100) });
const summaryParam = z.object({
  name: z.enum(Object.keys(SUMMARY_VIEWS) as [keyof typeof SUMMARY_VIEWS]),
});

export const runSync: RequestHandler = async (req, res) => {
  const { dataset, force } = syncQuery.parse(req.query);
  const outcomes = await syncDatasets(dataset, force);
  const body: ApiResponse<typeof outcomes> = { data: outcomes };
  res.status(outcomes.every((o) => o.ok) ? 200 : 502).json(body);
};

export const syncStatus: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof recentRuns>>> = {
    data: await recentRuns(),
  };
  res.json(body);
};

export const getOrders: RequestHandler = async (req, res) => {
  const filters = ordersQuery.parse(req.query);
  const { rows, total } = await listOrders(filters);
  const body: ApiResponse<typeof rows> & {
    meta: { total: number; page: number; limit: number };
  } = {
    data: rows,
    meta: { total, page: filters.page, limit: filters.limit },
  };
  res.json(body);
};

export const patchOrder: RequestHandler = async (req, res) => {
  const { uuid } = uuidParam.parse(req.params);
  const patch = patchBody.parse(req.body);
  const user = currentUser(req);
  const body: ApiResponse<Awaited<ReturnType<typeof updateOrder>>> = {
    data: await updateOrder(uuid, { ...patch, log: editLog(user.email) }),
  };
  res.json(body);
};

export const getPo: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof listPo>>> = {
    data: await listPo(),
  };
  res.json(body);
};

export const getSummaryByName: RequestHandler = async (req, res) => {
  const { name } = summaryParam.parse(req.params);
  const body: ApiResponse<Awaited<ReturnType<typeof getSummary>>> = {
    data: await getSummary(name),
  };
  res.json(body);
};
