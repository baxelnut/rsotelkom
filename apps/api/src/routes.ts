import { Router } from "express";
import { adminRoutes } from "./modules/admin/admin.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { reportsRoutes } from "./modules/reports/reports.routes";
import { sheetsRoutes } from "./modules/sheets/sheets.routes";
import { telegramRoutes } from "./modules/telegram/telegram.routes";

export const routes = Router();

routes.use("/health", healthRoutes);
routes.use("/auth", authRoutes);
routes.use("/admin", adminRoutes);
routes.use("/sheets", sheetsRoutes);
routes.use("/reports", reportsRoutes);
routes.use("/telegram", telegramRoutes);
