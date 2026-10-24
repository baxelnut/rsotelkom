import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./reports.controller";

export const reportsRoutes = Router();

reportsRoutes.use(requireAuth, requireRole("admin", "user"));

reportsRoutes.get("/regional-3", controller.regionalReport);
reportsRoutes.get("/regional-3/items", controller.regionalItems);
reportsRoutes.get("/alert", controller.alertReport);
reportsRoutes.get("/pic", controller.picReport);
reportsRoutes.get("/me", controller.myReport);
reportsRoutes.get("/galaksi", controller.galaksi);
