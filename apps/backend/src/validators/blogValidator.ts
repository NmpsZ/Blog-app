import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9-]+$/, "Slug must use lowercase letters, numbers, and hyphens only");

const boolFromForm = z.preprocess((value) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false || value === undefined) return false;
  return value;
}, z.boolean());

export const blogInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: slugSchema,
  excerpt: z.string().trim().min(1, "Excerpt is required"),
  content: z.string().trim().min(1, "Content is required"),
  published: boolFromForm
});

export const blogUpdateInputSchema = blogInputSchema.partial().extend({
  published: boolFromForm.optional()
});
