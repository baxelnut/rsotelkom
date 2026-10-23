import type { ErrorRequestHandler } from "express";
import type { ApiResponse } from "@rso/shared";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { isProd } from "../config/env";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = "Internal server error";

  if (err instanceof AppError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    message = err.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
  }

  if (status >= 500) console.error(err);

  const body: ApiResponse<null> = {
    data: null,
    error: status >= 500 && isProd ? "Internal server error" : message,
  };
  res.status(status).json(body);
};
