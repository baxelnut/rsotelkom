import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requireSyncSecret } from "../../middleware/sync-secret";
import * as controller from "./sheets.controller";

export const sheetsRoutes = Router();

sheetsRoutes.post("/sync", requireSyncSecret, controller.runSync);
sheetsRoutes.get("/sync/status", requireSyncSecret, controller.syncStatus);

sheetsRoutes.use(requireAuth, requireRole("admin", "user"));

sheetsRoutes.get("/orders", controller.getOrders);
sheetsRoutes.patch("/orders/:uuid", controller.patchOrder);
sheetsRoutes.get("/po", controller.getPo);
sheetsRoutes.get("/summary/:name", controller.getSummaryByName);
