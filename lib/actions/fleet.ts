"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { listingAvailabilitySchema, listingFormSchema, vehicleFormSchema } from "@/lib/validation/fleet";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function uniqueListingSlug(title: string) {
  const base = slugify(title) || "listing";
  const candidate = `${base}-${Date.now().toString(36)}`;
  const exists = await prisma.listing.findUnique({ where: { slug: candidate }, select: { id: true } });
  return exists ? `${candidate}-${Math.random().toString(36).slice(2, 6)}` : candidate;
}

export async function upsertFleetVehicle(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  if (!session.user.companyId) throw new Error("Company is required.");
  const parsed = vehicleFormSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    registrationCountry: formData.get("registrationCountry"),
    vehicleType: formData.get("vehicleType"),
    trailerType: formData.get("trailerType"),
    monthlyMileageKm: formData.get("monthlyMileageKm"),
    estimatedMonthlyReach: formData.get("estimatedMonthlyReach"),
    active: formData.get("active")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid vehicle payload.");

  if (parsed.data.vehicleId) {
    const existing = await prisma.vehicle.findFirst({
      where: { id: parsed.data.vehicleId, companyId: session.user.companyId },
      select: { id: true }
    });
    if (!existing) throw new Error("Vehicle not found.");
  }

  const vehicle = parsed.data.vehicleId
    ? await prisma.vehicle.update({
        where: { id: parsed.data.vehicleId },
        data: {
          name: parsed.data.name,
          registrationCountry: parsed.data.registrationCountry,
          vehicleType: parsed.data.vehicleType,
          trailerType: parsed.data.trailerType || null,
          monthlyMileageKm: parsed.data.monthlyMileageKm ?? null,
          estimatedMonthlyReach: parsed.data.estimatedMonthlyReach ?? null,
          active: parsed.data.active === "true"
        }
      })
    : await prisma.vehicle.create({
        data: {
          companyId: session.user.companyId,
          name: parsed.data.name,
          registrationCountry: parsed.data.registrationCountry,
          vehicleType: parsed.data.vehicleType,
          trailerType: parsed.data.trailerType || null,
          monthlyMileageKm: parsed.data.monthlyMileageKm ?? null,
          estimatedMonthlyReach: parsed.data.estimatedMonthlyReach ?? null,
          active: parsed.data.active === "true"
        }
      });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.USER_UPDATED,
    entityType: "Vehicle",
    entityId: vehicle.id
  });
  revalidatePath("/fleet/vehicles");
}

export async function upsertFleetListing(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  if (!session.user.companyId) throw new Error("Company is required.");
  const parsed = listingFormSchema.safeParse({
    listingId: formData.get("listingId"),
    title: formData.get("title"),
    description: formData.get("description"),
    baseCity: formData.get("baseCity"),
    baseCountry: formData.get("baseCountry"),
    routeScope: formData.get("routeScope"),
    pricingModel: formData.get("pricingModel"),
    priceFromCents: formData.get("priceFromCents"),
    currency: formData.get("currency"),
    vehicleId: formData.get("vehicleId"),
    countriesCovered: formData.get("countriesCovered"),
    citiesCovered: formData.get("citiesCovered"),
    estimatedMonthlyMileage: formData.get("estimatedMonthlyMileage"),
    estimatedCampaignReach: formData.get("estimatedCampaignReach"),
    minimumCampaignDays: formData.get("minimumCampaignDays"),
    status: formData.get("status")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing payload.");

  if (parsed.data.vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: parsed.data.vehicleId, companyId: session.user.companyId },
      select: { id: true }
    });
    if (!vehicle) throw new Error("Vehicle not found.");
  }

  const countries = parsed.data.countriesCovered
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const cities = parsed.data.citiesCovered
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const listing = parsed.data.listingId
    ? await prisma.listing.update({
        where: { id: parsed.data.listingId },
        data: {
          title: parsed.data.title,
          description: parsed.data.description,
          baseCity: parsed.data.baseCity,
          baseCountry: parsed.data.baseCountry,
          routeScope: parsed.data.routeScope,
          pricingModel: parsed.data.pricingModel,
          priceFromCents: parsed.data.priceFromCents ?? null,
          currency: parsed.data.currency.toUpperCase(),
          vehicleId: parsed.data.vehicleId || null,
          countriesCovered: countries,
          citiesCovered: cities,
          estimatedMonthlyMileage: parsed.data.estimatedMonthlyMileage ?? null,
          estimatedCampaignReach: parsed.data.estimatedCampaignReach ?? null,
          minimumCampaignDays: parsed.data.minimumCampaignDays ?? null,
          status: parsed.data.status
        }
      })
    : await prisma.listing.create({
        data: {
          slug: await uniqueListingSlug(parsed.data.title),
          companyId: session.user.companyId,
          title: parsed.data.title,
          description: parsed.data.description,
          baseCity: parsed.data.baseCity,
          baseCountry: parsed.data.baseCountry,
          routeScope: parsed.data.routeScope,
          pricingModel: parsed.data.pricingModel,
          priceFromCents: parsed.data.priceFromCents ?? null,
          currency: parsed.data.currency.toUpperCase(),
          vehicleId: parsed.data.vehicleId || null,
          countriesCovered: countries,
          citiesCovered: cities,
          estimatedMonthlyMileage: parsed.data.estimatedMonthlyMileage ?? null,
          estimatedCampaignReach: parsed.data.estimatedCampaignReach ?? null,
          minimumCampaignDays: parsed.data.minimumCampaignDays ?? null,
          status: parsed.data.status
        }
      });

  await createAuditLog({
    actorId: session.user.id,
    action: parsed.data.listingId ? AuditAction.LISTING_UPDATED : AuditAction.LISTING_CREATED,
    entityType: "Listing",
    entityId: listing.id
  });
  revalidatePath("/fleet/listings");
  revalidatePath("/fleet/availability");
}

export async function updateFleetListingAvailability(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  if (!session.user.companyId) throw new Error("Company is required.");
  const parsed = listingAvailabilitySchema.safeParse({
    listingId: formData.get("listingId"),
    availableFrom: formData.get("availableFrom"),
    availableTo: formData.get("availableTo"),
    minimumCampaignDays: formData.get("minimumCampaignDays"),
    status: formData.get("status")
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid availability payload.");

  const listing = await prisma.listing.findFirst({
    where: { id: parsed.data.listingId, companyId: session.user.companyId },
    select: { id: true }
  });
  if (!listing) throw new Error("Listing not found.");

  await prisma.listing.update({
    where: { id: parsed.data.listingId },
    data: {
      availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
      availableTo: parsed.data.availableTo ? new Date(parsed.data.availableTo) : null,
      minimumCampaignDays: parsed.data.minimumCampaignDays ?? null,
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.LISTING_UPDATED,
    entityType: "Listing",
    entityId: parsed.data.listingId,
    metadata: { kind: "availability" }
  });
  revalidatePath("/fleet/availability");
  revalidatePath("/fleet/listings");
}
