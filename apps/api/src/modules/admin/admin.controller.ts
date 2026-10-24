import type { RequestHandler } from "express";
import { z } from "zod";
import type { ApiResponse } from "@rso/shared";
import { currentUser } from "../../middleware/auth";
import { createUser, deleteUser, listUsers, updateUser } from "./admin.service";

const role = z.enum(["admin", "user", "pending"]);

const listQuery = z.object({ role: role.optional() });

const createBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  fullName: z.string().min(1).max(100).optional(),
  role: role.default("user"),
  telegramId: z.number().int().positive().optional(),
});

const updateBody = z
  .object({
    fullName: z.string().min(1).max(100).optional(),
    role: role.optional(),
    isActive: z.boolean().optional(),
    telegramId: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (b) => Object.values(b).some((v) => v !== undefined),
    "Nothing to update",
  );

const idParam = z.object({ id: z.string().uuid() });

export const getUsers: RequestHandler = async (req, res) => {
  const { role: filter } = listQuery.parse(req.query);
  const body: ApiResponse<Awaited<ReturnType<typeof listUsers>>> = {
    data: await listUsers(filter),
  };
  res.json(body);
};

export const postUser: RequestHandler = async (req, res) => {
  const input = createBody.parse(req.body);
  const body: ApiResponse<Awaited<ReturnType<typeof createUser>>> = {
    data: await createUser(input),
  };
  res.status(201).json(body);
};

export const patchUser: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  const input = updateBody.parse(req.body);
  const body: ApiResponse<Awaited<ReturnType<typeof updateUser>>> = {
    data: await updateUser(id, currentUser(req).id, input),
  };
  res.json(body);
};

export const removeUser: RequestHandler = async (req, res) => {
  const { id } = idParam.parse(req.params);
  await deleteUser(id, currentUser(req).id);
  res.status(204).end();
};
