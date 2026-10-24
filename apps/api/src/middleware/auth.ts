import type { Request, RequestHandler } from "express";
import { AppError } from "../lib/errors";
import { authenticate } from "../modules/auth/auth.service";
import type { AuthUser, Role } from "../modules/auth/auth.service";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const header = req.header("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) throw AppError.unauthorized("Missing bearer token");

  req.user = await authenticate(token);
  next();
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw AppError.forbidden("Insufficient permissions");
    }
    next();
  };

export function currentUser(req: Request): AuthUser {
  if (!req.user) throw AppError.unauthorized();
  return req.user;
}
