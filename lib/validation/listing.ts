import { z } from "zod";

export const listingFilterSchema = z.object({
  country: z.string().optional(),
  routeScope: z.enum(["DOMESTIC", "INTERNATIONAL", "MIXED"]).optional(),
  pricingModel: z.enum(["FIXED_MONTHLY", "CPM_ESTIMATE", "ROUTE_PACKAGE", "CUSTOM_QUOTE"]).optional(),
  search: z.string().max(100).optional()
});

export const inquirySchema = z.object({
  listingId: z.string().cuid(),
  campaignName: z.string().min(3).max(120),
  message: z.string().min(20).max(2000),
  budgetMinCents: z.coerce.number().int().nonnegative().optional(),
  budgetMaxCents: z.coerce.number().int().nonnegative().optional(),
  targetCountries: z.preprocess((value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  }, z.array(z.string().min(2)).min(1)),
  desiredStartDate: z.string().optional(),
  desiredEndDate: z.string().optional()
});
