import { z } from "zod";

export const bookingStatusValues = ["PENDING", "CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export const bookingStatusUpdateSchema = z.object({
  bookingId: z.string().cuid(),
  campaignId: z.string().cuid().optional().or(z.literal("")),
  status: z.enum(bookingStatusValues)
});
