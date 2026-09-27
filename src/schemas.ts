import { z } from "zod";

export const settingsSchema = z
  .object({
    language: z.enum(["en", "hi", "kn"]).optional(),
    volume: z.number().int().min(0).max(5).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0);

export const updateRequestSchema = z
  .object({
    deviceId: z.string().min(1),
    expectedVersion: z.number().int().positive(),
    settings: settingsSchema,
  })
  .strict();
