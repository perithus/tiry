"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { advertiserPasswordSchema, advertiserProfileSchema, savedListingSchema } from "@/lib/validation/advertiser";

export async function saveAdvertiserProfile(formData: FormData) {
  const session = await requireRole("ADVERTISER");
  const parsed = advertiserProfileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    avatarUrl: formData.get("avatarUrl")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid profile payload.");
  }

  const existing = await prisma.user.findFirst({
    where: {
      email: parsed.data.email.toLowerCase(),
      NOT: { id: session.user.id }
    },
    select: { id: true }
  });

  if (existing) {
    throw new Error("An account with that email already exists.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      email: parsed.data.email.toLowerCase(),
      avatarUrl: parsed.data.avatarUrl || null,
      onboardingCompletedAt: new Date()
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.USER_UPDATED,
    entityType: "User",
    entityId: session.user.id
  });

  revalidatePath("/advertiser");
  revalidatePath("/advertiser/settings");
}

export async function changeAdvertiserPassword(formData: FormData) {
  const session = await requireRole("ADVERTISER");
  const parsed = advertiserPasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid password payload.");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true }
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const matches = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    throw new Error("Current password is incorrect.");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword)
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.USER_UPDATED,
    entityType: "User",
    entityId: session.user.id,
    metadata: { kind: "password_change" }
  });

  revalidatePath("/advertiser/settings");
}

export async function saveListingForAdvertiser(formData: FormData) {
  const session = await requireRole("ADVERTISER");
  const parsed = savedListingSchema.safeParse({
    listingId: formData.get("listingId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid saved listing payload.");
  }

  await prisma.savedListing.upsert({
    where: {
      userId_listingId: {
        userId: session.user.id,
        listingId: parsed.data.listingId
      }
    },
    update: {},
    create: {
      userId: session.user.id,
      listingId: parsed.data.listingId
    }
  });

  revalidatePath("/advertiser");
  revalidatePath("/advertiser/saved-listings");
  revalidatePath("/marketplace");
}

export async function removeSavedListing(formData: FormData) {
  const session = await requireRole("ADVERTISER");
  const parsed = savedListingSchema.safeParse({
    listingId: formData.get("listingId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid saved listing payload.");
  }

  await prisma.savedListing.deleteMany({
    where: {
      userId: session.user.id,
      listingId: parsed.data.listingId
    }
  });

  revalidatePath("/advertiser");
  revalidatePath("/advertiser/saved-listings");
  revalidatePath("/marketplace");
}
