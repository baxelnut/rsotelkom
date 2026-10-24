import { Router } from "express";
import { requireSyncSecret } from "../../middleware/sync-secret";
import { requireTelegramSecret } from "../../middleware/telegram-secret";
import * as controller from "./telegram.controller";

export const telegramRoutes = Router();

telegramRoutes.post("/webhook", requireTelegramSecret, controller.webhook);
telegramRoutes.post("/alert", requireSyncSecret, controller.alert);
