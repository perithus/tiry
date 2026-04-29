import { z } from "zod";

export const vehicleFormSchema = z.object({
  vehicleId: z.string().cuid().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(160),
  registrationCountry: z.string().trim().min(2).max(100),
  vehicleType: z.enum(["TRUCK", "TRAILER", "TRUCK_TRAILER", "VAN"]),
  trailerType: z.enum(["BOX", "CURTAINSIDER", "REFRIGERATED", "TANKER", "FLATBED", "MEGA", "OTHER"]).optional().or(z.literal("")),
  monthlyMileageKm: z.coerce.number().int().min(0).max(500000).optional(),
  estimatedMonthlyReach: z.coerce.number().int().min(0).max(100000000).optional(),
  active: z.enum(["true", "false"]).default("true")
});

export const listingFormSchema = z.object({
  listingId: z.string().cuid().optional().or(z.literal("")),
  title: z.string().trim().min(3).max(180),
  description: z.string().trim().min(10).max(4000),
  baseCity: z.string().trim().min(2).max(120),
  baseCountry: z.string().trim().min(2).max(120),
  routeScope: z.enum(["DOMESTIC", "INTERNATIONAL", "MIXED"]),
  pricingModel: z.enum(["FIXED_MONTHLY", "CPM_ESTIMATE", "ROUTE_PACKAGE", "CUSTOM_QUOTE"]),
  priceFromCents: z.coerce.number().int().min(0).optional(),
  currency: z.string().trim().min(3).max(3).default("EUR"),
  vehicleId: z.string().cuid().optional().or(z.literal("")),
  countriesCovered: z.string().trim().default(""),
  citiesCovered: z.string().trim().default(""),
  estimatedMonthlyMileage: z.coerce.number().int().min(0).optional(),
  estimatedCampaignReach: z.coerce.number().int().min(0).optional(),
  minimumCampaignDays: z.coerce.number().int().min(1).max(365).optional(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]).default("DRAFT")
});

export const listingAvailabilitySchema = z
  .object({
    listingId: z.string().cuid(),
    availableFrom: z.string().optional().transform((value) => (value ? value : undefined)),
    availableTo: z.string().optional().transform((value) => (value ? value : undefined)),
    minimumCampaignDays: z.coerce.number().int().min(1).max(365).optional(),
    status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"])
  })
  .refine((input) => {
    if (!input.availableFrom || !input.availableTo) return true;
    return new Date(input.availableTo) >= new Date(input.availableFrom);
  }, {
    message: "Available to must be after available from.",
    path: ["availableTo"]
  });
