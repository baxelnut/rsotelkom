import { Router } from "express";
import type { ApiResponse } from "@rso/shared";
import { currentUser, requireAuth } from "../../middleware/auth";
import type { AuthUser } from "./auth.service";

export const authRoutes = Router();

authRoutes.get("/me", requireAuth, (req, res) => {
  const body: ApiResponse<AuthUser> = { data: currentUser(req) };
  res.json(body);
});
