import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requireSyncSecret } from "../../middleware/sync-secret";
import { requireTelegramSecret } from "../../middleware/telegram-secret";
import * as controller from "./telegram.controller";

export const telegramRoutes = Router();

telegramRoutes.post("/webhook", requireTelegramSecret, controller.webhook);
telegramRoutes.post("/alert", requireSyncSecret, controller.alert);
telegramRoutes.post("/weekly", requireSyncSecret, controller.weekly);
telegramRoutes.post(
  "/send-report",
  requireAuth,
  requireRole("admin"),
  controller.weekly,
);
