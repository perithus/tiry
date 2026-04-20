import { z } from "zod";

export const contentPageStatusValues = ["DRAFT", "PUBLISHED"] as const;

export const contentPageSchema = z.object({
  slug: z.string().trim().min(2).max(120),
  locale: z.enum(["en", "pl"]),
  title: z.string().trim().min(3).max(160),
  seoTitle: z.string().trim().max(160).optional().or(z.literal("")),
  seoDescription: z.string().trim().max(320).optional().or(z.literal("")),
  excerpt: z.string().trim().max(500).optional().or(z.literal("")),
  body: z.string().trim().min(20).max(20000),
  status: z.enum(contentPageStatusValues)
});

export const faqItemSchema = z.object({
  locale: z.enum(["en", "pl"]),
  question: z.string().trim().min(5).max(200),
  answer: z.string().trim().min(10).max(4000),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean())
});
