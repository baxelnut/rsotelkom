import type { RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { safeEqual } from "../lib/secret";

export const requireTelegramSecret: RequestHandler = (req, _res, next) => {
  const given = req.header("x-telegram-bot-api-secret-token") ?? "";
  if (!safeEqual(given, env.TELEGRAM_WEBHOOK_SECRET)) {
    throw AppError.unauthorized("Invalid webhook secret");
  }
  next();
};
