import { Router } from "express";
import { z } from "zod";
import type { ApiResponse } from "@rso/shared";
import { currentUser, requireAuth } from "../../middleware/auth";
import { updateOwnProfile, type AuthUser } from "./auth.service";

export const authRoutes = Router();

const updateMeBody = z
  .object({
    fullName: z.string().trim().min(1).max(100).optional(),
    telegramId: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (b) => Object.values(b).some((v) => v !== undefined),
    "Nothing to update",
  );

authRoutes.get("/me", requireAuth, (req, res) => {
  const body: ApiResponse<AuthUser> = { data: currentUser(req) };
  res.json(body);
});

authRoutes.patch("/me", requireAuth, async (req, res) => {
  const input = updateMeBody.parse(req.body);
  const body: ApiResponse<AuthUser> = {
    data: await updateOwnProfile(currentUser(req).id, input),
  };
  res.json(body);
});