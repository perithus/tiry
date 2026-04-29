"use server";

import { AuditAction, ListingStatus, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import {
  adminCompanyReviewSchema,
  adminInquiryUpdateSchema,
  adminListingReviewSchema,
  adminUserUpdateSchema,
  adminVerificationDocumentReviewSchema
} from "@/lib/validation/admin";

export async function moderateListing(listingId: string, status: ListingStatus, verificationStatus: VerificationStatus) {
  const session = await requireRole("ADMIN");

  await prisma.listing.update({
    where: { id: listingId },
    data: { status, verificationStatus }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.LISTING_MODERATED,
    entityType: "Listing",
    entityId: listingId,
    metadata: { status, verificationStatus }
  });

  revalidatePath("/admin/listings");
}

export async function updateUserAccess(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminUserUpdateSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid user update payload.");
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      role: parsed.data.role,
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.ROLE_CHANGED,
    entityType: "User",
    entityId: parsed.data.userId,
    metadata: {
      role: parsed.data.role,
      status: parsed.data.status
    }
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  revalidatePath("/admin/security");
}

export async function reviewCompany(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminCompanyReviewSchema.safeParse({
    companyId: formData.get("companyId"),
    verificationStatus: formData.get("verificationStatus"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid company review payload.");
  }

  await prisma.company.update({
    where: { id: parsed.data.companyId },
    data: {
      verificationStatus: parsed.data.verificationStatus,
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.VERIFICATION_REVIEWED,
    entityType: "Company",
    entityId: parsed.data.companyId,
    metadata: {
      verificationStatus: parsed.data.verificationStatus,
      status: parsed.data.status
    }
  });

  revalidatePath("/admin/verifications");
  revalidatePath("/admin");
}

export async function updateInquiryStatus(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminInquiryUpdateSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid inquiry update payload.");
  }

  await prisma.campaignInquiry.update({
    where: { id: parsed.data.inquiryId },
    data: {
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.INQUIRY_UPDATED,
    entityType: "CampaignInquiry",
    entityId: parsed.data.inquiryId,
    metadata: {
      status: parsed.data.status
    }
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function reviewListing(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminListingReviewSchema.safeParse({
    listingId: formData.get("listingId"),
    status: formData.get("status"),
    verificationStatus: formData.get("verificationStatus")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid listing review payload.");
  }

  await prisma.listing.update({
    where: { id: parsed.data.listingId },
    data: {
      status: parsed.data.status,
      verificationStatus: parsed.data.verificationStatus
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.LISTING_MODERATED,
    entityType: "Listing",
    entityId: parsed.data.listingId,
    metadata: {
      status: parsed.data.status,
      verificationStatus: parsed.data.verificationStatus
    }
  });

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
}

export async function reviewVerificationDocument(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminVerificationDocumentReviewSchema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid verification document payload.");
  }

  const document = await prisma.verificationDocument.update({
    where: { id: parsed.data.documentId },
    data: {
      status: parsed.data.status,
      reviewedAt: new Date()
    },
    select: {
      id: true,
      companyId: true
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.VERIFICATION_REVIEWED,
    entityType: "VerificationDocument",
    entityId: document.id,
    metadata: {
      status: parsed.data.status
    }
  });

  if (document.companyId) {
    revalidatePath("/fleet/company");
  }
  revalidatePath("/admin/verifications");
  revalidatePath("/fleet/verification");
  revalidatePath("/fleet");
  revalidatePath("/admin");
}
