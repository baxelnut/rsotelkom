import type { RequestHandler } from "express";
import type { ApiResponse } from "@rso/shared";

export const notFound: RequestHandler = (_req, res) => {
  const body: ApiResponse<null> = { data: null, error: "Not found" };
  res.status(404).json(body);
};
