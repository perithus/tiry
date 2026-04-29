import { z } from "zod";

export const inquiryMessageSchema = z.object({
  inquiryId: z.string().cuid(),
  body: z.string().trim().min(2).max(4000)
});

export const campaignMessageSchema = z.object({
  campaignId: z.string().cuid(),
  body: z.string().trim().min(2).max(4000)
});
