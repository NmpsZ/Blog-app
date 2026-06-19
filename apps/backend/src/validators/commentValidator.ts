import { z } from "zod";

export const commentInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  message: z
    .string()
    .trim()
    .min(1, "Comment is required")
    .regex(/^[ก-๙\s0-9]+$/u, "Comment must contain Thai characters and/or numbers only")
});
