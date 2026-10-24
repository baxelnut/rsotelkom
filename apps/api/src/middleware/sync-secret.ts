import { timingSafeEqual } from "node:crypto";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { AppError } from "../lib/errors";

export const requireSyncSecret: RequestHandler = (req, _res, next) => {
  const given = Buffer.from(String(req.header("x-sync-secret") ?? ""));
  const expected = Buffer.from(env.SYNC_SECRET);

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw AppError.unauthorized("Invalid sync secret");
  }
  next();
};
