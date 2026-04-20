import { z } from "zod";

const optionalNumber = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }

  return Number(value);
}, z.number().int().nonnegative().optional());

const optionalDate = z.preprocess((value) => {
  if (value === "" || value == null) {
    return undefined;
  }

  return String(value);
}, z.string().optional());

export const vehicleSchema = z.object({
  vehicleId: z.string().cuid().optional().or(z.literal("")),
  name: z.string().trim().min(2).max(160),
  registrationCountry: z.string().trim().min(2).max(100),
  vehicleType: z.enum(["TRUCK", "TRAILER", "TRUCK_TRAILER", "VAN"]),
  trailerType: z.enum(["BOX", "CURTAINSIDER", "REFRIGERATED", "TANKER", "FLATBED", "MEGA", "OTHER"]).optional().or(z.literal("")),
  monthlyMileageKm: optionalNumber,
  estimatedMonthlyReach: optionalNumber,
  active: z.preprocess((value) => value === "on" || value === true, z.boolean())
});

export const listingSchema = z.object({
  listingId: z.string().cuid().optional().or(z.literal("")),
  vehicleId: z.string().cuid().optional().or(z.literal("")),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().min(20).max(4000),
  baseCity: z.string().trim().min(2).max(100),
  baseCountry: z.string().trim().min(2).max(100),
  routeScope: z.enum(["DOMESTIC", "INTERNATIONAL", "MIXED"]),
  countriesCovered: z.preprocess((value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  }, z.array(z.string().min(2)).min(1)),
  citiesCovered: z.preprocess((value) => {
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return value;
  }, z.array(z.string().min(2)).min(1)),
  adSurfaceType: z.enum(["REAR_DOORS", "TRAILER_SIDE_LEFT", "TRAILER_SIDE_RIGHT", "CABIN", "FULL_WRAP"]),
  pricingModel: z.enum(["FIXED_MONTHLY", "CPM_ESTIMATE", "ROUTE_PACKAGE", "CUSTOM_QUOTE"]),
  priceFromCents: optionalNumber,
  currency: z.string().trim().length(3).default("EUR"),
  estimatedMonthlyMileage: optionalNumber,
  estimatedCampaignReach: optionalNumber,
  availableFrom: optionalDate,
  availableTo: optionalDate,
  minimumCampaignDays: optionalNumber,
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"])
}).refine((input) => {
  if (!input.availableFrom || !input.availableTo) {
    return true;
  }

  return new Date(input.availableTo) >= new Date(input.availableFrom);
}, {
  message: "Available to date must be after available from date.",
  path: ["availableTo"]
});

export const listingAvailabilitySchema = z.object({
  listingId: z.string().cuid(),
  availableFrom: optionalDate,
  availableTo: optionalDate,
  minimumCampaignDays: optionalNumber,
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"])
}).refine((input) => {
  if (!input.availableFrom || !input.availableTo) {
    return true;
  }

  return new Date(input.availableTo) >= new Date(input.availableFrom);
}, {
  message: "Available to date must be after available from date.",
  path: ["availableTo"]
});
