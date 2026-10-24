import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as controller from "./admin.controller";

export const adminRoutes = Router();

adminRoutes.use(requireAuth, requireRole("admin"));

adminRoutes.get("/users", controller.getUsers);
adminRoutes.post("/users", controller.postUser);
adminRoutes.patch("/users/:id", controller.patchUser);
adminRoutes.delete("/users/:id", controller.removeUser);
