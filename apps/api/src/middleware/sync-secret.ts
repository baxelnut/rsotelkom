import type { RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { safeEqual } from "../lib/secret";

export const requireSyncSecret: RequestHandler = (req, _res, next) => {
  if (!safeEqual(req.header("x-sync-secret") ?? "", env.SYNC_SECRET)) {
    throw AppError.unauthorized("Invalid sync secret");
  }
  next();
};
