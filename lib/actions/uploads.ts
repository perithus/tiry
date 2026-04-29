"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { validateUploadFile } from "@/lib/security/uploads";
import { saveUploadedFile } from "@/lib/storage/provider";

export async function uploadListingImage(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  if (!session.user.companyId) {
    throw new Error("Company is required.");
  }

  const listingId = String(formData.get("listingId") ?? "");
  const alt = String(formData.get("alt") ?? "").trim();
  const file = formData.get("file");

  if (!listingId) {
    throw new Error("Listing is required.");
  }

  if (!(file instanceof File)) {
    throw new Error("Please select an image.");
  }

  await validateUploadFile(file);

  const listing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      companyId: session.user.companyId
    },
    select: {
      id: true,
      title: true,
      slug: true
    }
  });

  if (!listing) {
    throw new Error("Listing not found.");
  }

  const uploaded = await saveUploadedFile({
    file,
    folder: `listings/${listing.id}`
  });

  if (!uploaded.url) {
    throw new Error("Public image URL was not generated.");
  }

  const existingCount = await prisma.listingImage.count({
    where: { listingId: listing.id }
  });

  const image = await prisma.listingImage.create({
    data: {
      listingId: listing.id,
      url: uploaded.url,
      alt: alt || listing.title,
      sortOrder: existingCount
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.LISTING_UPDATED,
    entityType: "ListingImage",
    entityId: image.id,
    metadata: {
      listingId: listing.id
    }
  });

  revalidatePath("/fleet/listings");
  revalidatePath(`/marketplace/${listing.slug}`);
}
