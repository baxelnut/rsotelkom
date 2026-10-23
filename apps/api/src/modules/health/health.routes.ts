import { Router } from "express";
import type { ApiResponse } from "@rso/shared";

export const healthRoutes = Router();

healthRoutes.get("/", (_req, res) => {
  const body: ApiResponse<{ status: string }> = { data: { status: "ok" } };
  res.json(body);
});
