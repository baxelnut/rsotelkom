import { Router } from "express";
import { adminRoutes } from "./modules/admin/admin.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { sheetsRoutes } from "./modules/sheets/sheets.routes";

export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/auth", authRoutes);
routes.use("/admin", adminRoutes);
routes.use("/sheets", sheetsRoutes);
