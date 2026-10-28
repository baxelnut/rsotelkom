import { Router } from "express";
import type { ApiResponse } from "@rso/shared";
import { supabaseAdmin } from "../../lib/supabase";

export const healthRoutes = Router();

healthRoutes.get("/", async (_req, res) => {
  const { error } = await supabaseAdmin
    .from("sync_runs")
    .select("id", { head: true, count: "exact" })
    .limit(1);

  if (error) {
    const body: ApiResponse<{ status: string }> = {
      data: { status: "db-error" },
      error: "Database unreachable",
    };
    return res.status(503).json(body);
  }

  const body: ApiResponse<{ status: string }> = { data: { status: "ok" } };
  res.json(body);
});
