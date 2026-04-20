"use server";

import { AuditAction, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { listingAvailabilitySchema, listingSchema, vehicleSchema } from "@/lib/validation/fleet";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function buildUniqueListingSlug(title: string) {
  const base = slugify(title) || "listing";
  const candidate = `${base}-${Date.now().toString(36)}`;
  const existing = await prisma.listing.findUnique({
    where: { slug: candidate },
    select: { id: true }
  });

  return existing ? `${candidate}-${Math.random().toString(36).slice(2, 6)}` : candidate;
}

export async function upsertVehicle(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  const parsed = vehicleSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    registrationCountry: formData.get("registrationCountry"),
    vehicleType: formData.get("vehicleType"),
    trailerType: formData.get("trailerType"),
    monthlyMileageKm: formData.get("monthlyMileageKm"),
    estimatedMonthlyReach: formData.get("estimatedMonthlyReach"),
    active: formData.get("active")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid vehicle payload.");
  }

  if (!session.user.companyId) {
    throw new Error("Company must exist before managing vehicles.");
  }

  if (parsed.data.vehicleId) {
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id: parsed.data.vehicleId },
      select: { id: true, companyId: true }
    });

    if (!existingVehicle || existingVehicle.companyId !== session.user.companyId) {
      throw new Error("You do not have permission to update this vehicle.");
    }
  }

  const vehicle = parsed.data.vehicleId
    ? await prisma.vehicle.update({
        where: { id: parsed.data.vehicleId },
        data: {
          name: parsed.data.name,
          registrationCountry: parsed.data.registrationCountry,
          vehicleType: parsed.data.vehicleType,
          trailerType: parsed.data.trailerType || undefined,
          monthlyMileageKm: parsed.data.monthlyMileageKm,
          estimatedMonthlyReach: parsed.data.estimatedMonthlyReach,
          active: parsed.data.active
        }
      })
    : await prisma.vehicle.create({
        data: {
          companyId: session.user.companyId,
          name: parsed.data.name,
          registrationCountry: parsed.data.registrationCountry,
          vehicleType: parsed.data.vehicleType,
          trailerType: parsed.data.trailerType || undefined,
          monthlyMileageKm: parsed.data.monthlyMileageKm,
          estimatedMonthlyReach: parsed.data.estimatedMonthlyReach,
          active: parsed.data.active
        }
      });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.COMPANY_UPDATED,
    entityType: "Vehicle",
    entityId: vehicle.id,
    metadata: {
      action: parsed.data.vehicleId ? "update" : "create",
      vehicleType: vehicle.vehicleType,
      active: vehicle.active
    }
  });

  revalidatePath("/fleet/vehicles");
  revalidatePath("/fleet");
}

export async function upsertListing(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  const parsed = listingSchema.safeParse({
    listingId: formData.get("listingId"),
    vehicleId: formData.get("vehicleId"),
    title: formData.get("title"),
    description: formData.get("description"),
    baseCity: formData.get("baseCity"),
    baseCountry: formData.get("baseCountry"),
    routeScope: formData.get("routeScope"),
    countriesCovered: formData.get("countriesCovered"),
    citiesCovered: formData.get("citiesCovered"),
    adSurfaceType: formData.get("adSurfaceType"),
    pricingModel: formData.get("pricingModel"),
    priceFromCents: formData.get("priceFromCents"),
    currency: formData.get("currency"),
    estimatedMonthlyMileage: formData.get("estimatedMonthlyMileage"),
    estimatedCampaignReach: formData.get("estimatedCampaignReach"),
    availableFrom: formData.get("availableFrom"),
    availableTo: formData.get("availableTo"),
    minimumCampaignDays: formData.get("minimumCampaignDays"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing payload.");
  }

  if (!session.user.companyId) {
    throw new Error("Company must exist before managing listings.");
  }

  if (parsed.data.listingId) {
    const existingListing = await prisma.listing.findUnique({
      where: { id: parsed.data.listingId },
      select: { id: true, companyId: true }
    });

    if (!existingListing || existingListing.companyId !== session.user.companyId) {
      throw new Error("You do not have permission to update this listing.");
    }
  }

  let adSurfaceId: string | undefined;

  if (parsed.data.vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parsed.data.vehicleId },
      select: { id: true, companyId: true }
    });

    if (!vehicle || vehicle.companyId !== session.user.companyId) {
      throw new Error("You do not have permission to use this vehicle for the listing.");
    }

    const adSurface = await prisma.adSurface.findFirst({
      where: {
        vehicleId: parsed.data.vehicleId,
        type: parsed.data.adSurfaceType
      }
    });

    if (adSurface) {
      adSurfaceId = adSurface.id;
    } else {
      const createdSurface = await prisma.adSurface.create({
        data: {
          vehicleId: parsed.data.vehicleId,
          type: parsed.data.adSurfaceType,
          active: true
        }
      });

      adSurfaceId = createdSurface.id;
    }
  }

  const slug = parsed.data.listingId ? undefined : await buildUniqueListingSlug(parsed.data.title);

  const listing = parsed.data.listingId
    ? await prisma.listing.update({
        where: { id: parsed.data.listingId },
        data: {
          vehicleId: parsed.data.vehicleId || undefined,
          adSurfaceId,
          title: parsed.data.title,
          description: parsed.data.description,
          baseCity: parsed.data.baseCity,
          baseCountry: parsed.data.baseCountry,
          routeScope: parsed.data.routeScope,
          countriesCovered: parsed.data.countriesCovered,
          citiesCovered: parsed.data.citiesCovered,
          estimatedMonthlyMileage: parsed.data.estimatedMonthlyMileage,
          estimatedCampaignReach: parsed.data.estimatedCampaignReach,
          pricingModel: parsed.data.pricingModel,
          priceFromCents: parsed.data.priceFromCents,
          currency: parsed.data.currency.toUpperCase(),
          availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
          availableTo: parsed.data.availableTo ? new Date(parsed.data.availableTo) : null,
          minimumCampaignDays: parsed.data.minimumCampaignDays,
          status: parsed.data.status,
          verificationStatus: VerificationStatus.PENDING
        }
      })
    : await prisma.listing.create({
        data: {
          slug: slug!,
          companyId: session.user.companyId,
          vehicleId: parsed.data.vehicleId || undefined,
          adSurfaceId,
          title: parsed.data.title,
          description: parsed.data.description,
          baseCity: parsed.data.baseCity,
          baseCountry: parsed.data.baseCountry,
          routeScope: parsed.data.routeScope,
          countriesCovered: parsed.data.countriesCovered,
          citiesCovered: parsed.data.citiesCovered,
          estimatedMonthlyMileage: parsed.data.estimatedMonthlyMileage,
          estimatedCampaignReach: parsed.data.estimatedCampaignReach,
          pricingModel: parsed.data.pricingModel,
          priceFromCents: parsed.data.priceFromCents,
          currency: parsed.data.currency.toUpperCase(),
          availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : undefined,
          availableTo: parsed.data.availableTo ? new Date(parsed.data.availableTo) : undefined,
          minimumCampaignDays: parsed.data.minimumCampaignDays,
          status: parsed.data.status,
          verificationStatus: VerificationStatus.PENDING
        }
      });

  await prisma.routeCoverage.deleteMany({
    where: { listingId: listing.id }
  });

  await prisma.routeCoverage.createMany({
    data: parsed.data.countriesCovered.map((country, index) => ({
      listingId: listing.id,
      routeScope: parsed.data.routeScope,
      country,
      city: parsed.data.citiesCovered[index] ?? parsed.data.citiesCovered[0] ?? null,
      routeLabel: `${parsed.data.baseCity} - ${country}`
    }))
  });

  await createAuditLog({
    actorId: session.user.id,
    action: parsed.data.listingId ? AuditAction.LISTING_UPDATED : AuditAction.LISTING_CREATED,
    entityType: "Listing",
    entityId: listing.id,
    metadata: {
      action: parsed.data.listingId ? "update" : "create",
      status: listing.status,
      pricingModel: listing.pricingModel
    }
  });

  revalidatePath("/fleet/listings");
  revalidatePath("/fleet/availability");
  revalidatePath("/fleet");
  revalidatePath("/marketplace");
}

export async function updateListingAvailability(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  const parsed = listingAvailabilitySchema.safeParse({
    listingId: formData.get("listingId"),
    availableFrom: formData.get("availableFrom"),
    availableTo: formData.get("availableTo"),
    minimumCampaignDays: formData.get("minimumCampaignDays"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid availability payload.");
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true, companyId: true }
  });

  if (!listing || listing.companyId !== session.user.companyId) {
    throw new Error("You do not have permission to update this listing.");
  }

  await prisma.listing.update({
    where: { id: parsed.data.listingId },
    data: {
      availableFrom: parsed.data.availableFrom ? new Date(parsed.data.availableFrom) : null,
      availableTo: parsed.data.availableTo ? new Date(parsed.data.availableTo) : null,
      minimumCampaignDays: parsed.data.minimumCampaignDays,
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.LISTING_UPDATED,
    entityType: "Listing",
    entityId: parsed.data.listingId,
    metadata: {
      availability: true,
      status: parsed.data.status
    }
  });

  revalidatePath("/fleet/availability");
  revalidatePath("/fleet/listings");
  revalidatePath("/fleet");
  revalidatePath("/marketplace");
}
