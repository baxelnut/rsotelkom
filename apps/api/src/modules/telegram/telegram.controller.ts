import type { RequestHandler } from "express";
import { z } from "zod";
import type { ApiResponse } from "@rso/shared";
import { processUpdate, sendAlertToChannel } from "./telegram.service";

const updateSchema = z
  .object({
    update_id: z.number().optional(),
    message: z
      .object({
        text: z.string().optional(),
        chat: z.object({ id: z.number() }),
        from: z.object({ id: z.number() }).optional(),
      })
      .optional(),
  })
  .passthrough();

export const webhook: RequestHandler = async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (parsed.success) {
    try {
      await processUpdate(parsed.data);
    } catch (err) {
      console.error("telegram update failed", err);
    }
  }
  res.json({ ok: true });
};

export const alert: RequestHandler = async (_req, res) => {
  const body: ApiResponse<Awaited<ReturnType<typeof sendAlertToChannel>>> = {
    data: await sendAlertToChannel(),
  };
  res.json(body);
};
