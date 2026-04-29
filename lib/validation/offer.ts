import { z } from "zod";

const optionalDate = z.string().trim().optional().or(z.literal(""));

const campaignOfferBaseSchema = z.object({
  inquiryId: z.string().cuid(),
  title: z.string().trim().min(3).max(160),
  terms: z.string().trim().min(20).max(4000),
  priceCents: z.coerce.number().int().positive(),
  currency: z.string().trim().length(3),
  expiresAt: optionalDate,
  bookedFrom: z.string().trim().min(1),
  bookedTo: z.string().trim().min(1)
});

export const campaignOfferSchema = campaignOfferBaseSchema.refine((input) => new Date(input.bookedTo) >= new Date(input.bookedFrom), {
  message: "Booked to date must be after booked from date.",
  path: ["bookedTo"]
});

export const campaignOfferLifecycleSchema = campaignOfferBaseSchema.extend({
  offerId: z.string().cuid().optional().or(z.literal("")),
  submitMode: z.enum(["draft", "send"]).default("send")
}).refine((input) => new Date(input.bookedTo) >= new Date(input.bookedFrom), {
  message: "Booked to date must be after booked from date.",
  path: ["bookedTo"]
});

export const acceptOfferSchema = z.object({
  offerId: z.string().cuid()
});

export const offerIdSchema = z.object({
  offerId: z.string().cuid()
});
