import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { requireSyncSecret } from "../../middleware/sync-secret";
import * as controller from "./sheets.controller";

export const sheetsRoutes = Router();

sheetsRoutes.post("/sync", requireSyncSecret, controller.runSync);

sheetsRoutes.use(requireAuth);
sheetsRoutes.post("/sync/run", requireRole("admin"), controller.runSync);

sheetsRoutes.use(requireRole("admin", "user"));
sheetsRoutes.get("/sync/status", controller.syncStatus);
sheetsRoutes.get("/orders", controller.getOrders);
sheetsRoutes.patch("/orders/:uuid", controller.patchOrder);
sheetsRoutes.get("/po", controller.getPo);
sheetsRoutes.get("/summary/:name", controller.getSummaryByName);
