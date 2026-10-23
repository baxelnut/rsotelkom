import { Router } from "express";
import { healthRoutes } from "./modules/health/health.routes";

export const routes = Router();

routes.use("/health", healthRoutes);
