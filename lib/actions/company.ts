"use server";

import { AuditAction, CompanyStatus, VerificationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { validateUploadFile } from "@/lib/security/uploads";
import { saveUploadedFile } from "@/lib/storage/provider";
import {
  companyProfileSchema,
  companyTeamMemberAccessSchema,
  companyTeamMemberSchema,
  fleetOwnerProfileSchema,
  verificationDocumentUploadSchema
} from "@/lib/validation/company";
import { createAuditLog } from "@/lib/security/audit";
import { verifyPassword } from "@/lib/auth/password";
import { advertiserPasswordSchema } from "@/lib/validation/advertiser";

export async function saveCompanyProfile(values: unknown) {
  const session = await requireRole("CARRIER_OWNER");
  const input = companyProfileSchema.parse(values);

  const company = await prisma.company.upsert({
    where: {
      id: session.user.companyId ?? "missing-company"
    },
    update: input,
    create: {
      ...input,
      slug: input.displayName.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
    }
  });

  await prisma.user.update({
    where: {
      id: session.user.id
    },
    data: {
      companyId: company.id
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.COMPANY_UPDATED,
    entityType: "Company",
    entityId: company.id
  });

  revalidatePath("/fleet/company");
  revalidatePath("/fleet");
}

export async function addCompanyTeamMember(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");

  if (!session.user.companyId) {
    throw new Error("Company is required before inviting team members.");
  }

  const parsed = companyTeamMemberSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid team member payload.");
  }

  const temporaryPassword = `Invite-${crypto.randomUUID()}`;
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.upsert({
    where: {
      email: parsed.data.email
    },
    update: {
      name: parsed.data.name,
      role: parsed.data.role,
      status: "INVITED",
      companyId: session.user.companyId
    },
    create: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      status: "INVITED",
      companyId: session.user.companyId,
      passwordHash
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.USER_UPDATED,
    entityType: "User",
    entityId: user.id,
    metadata: {
      email: user.email,
      role: user.role,
      status: user.status,
      kind: "team_invite"
    }
  });

  revalidatePath("/fleet/settings");
  revalidatePath("/fleet");
}

export async function updateCompanyTeamMemberAccess(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");

  if (!session.user.companyId) {
    throw new Error("Company is required before updating team access.");
  }

  const parsed = companyTeamMemberAccessSchema.safeParse({
    memberId: formData.get("memberId"),
    role: formData.get("role"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid team access payload.");
  }

  if (parsed.data.memberId === session.user.id) {
    throw new Error("Use admin access controls to update your own owner account.");
  }

  const member = await prisma.user.findFirst({
    where: {
      id: parsed.data.memberId,
      companyId: session.user.companyId
    },
    select: {
      id: true,
      role: true,
      status: true
    }
  });

  if (!member) {
    throw new Error("Team member not found.");
  }

  const ownerAccessRemoved =
    member.role === "CARRIER_OWNER" &&
    (parsed.data.role !== "CARRIER_OWNER" || parsed.data.status === "SUSPENDED");

  if (ownerAccessRemoved) {
    const otherOwners = await prisma.user.count({
      where: {
        companyId: session.user.companyId,
        role: "CARRIER_OWNER",
        status: {
          in: ["ACTIVE", "INVITED", "PENDING_VERIFICATION"]
        },
        NOT: {
          id: member.id
        }
      }
    });

    if (otherOwners === 0) {
      throw new Error("Your company must keep at least one owner with access.");
    }
  }

  await prisma.user.update({
    where: {
      id: member.id
    },
    data: {
      role: parsed.data.role,
      status: parsed.data.status
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.ROLE_CHANGED,
    entityType: "User",
    entityId: member.id,
    metadata: {
      role: parsed.data.role,
      status: parsed.data.status,
      kind: "team_access_update"
    }
  });

  revalidatePath("/fleet/settings");
  revalidatePath("/fleet");
}

export async function saveFleetOwnerProfile(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  const parsed = fleetOwnerProfileSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    avatarUrl: formData.get("avatarUrl")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid owner profile payload.");
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
      email: parsed.data.email.toLowerCase(),
      phone: parsed.data.phone || null,
      avatarUrl: parsed.data.avatarUrl || null,
      onboardingCompletedAt: new Date()
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.USER_UPDATED,
    entityType: "User",
    entityId: session.user.id,
    metadata: { kind: "fleet_owner_profile" }
  });

  revalidatePath("/fleet/settings");
  revalidatePath("/fleet");
}

export async function changeFleetOwnerPassword(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
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

  revalidatePath("/fleet/settings");
}

export async function addVerificationDocument(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");

  if (!session.user.companyId) {
    throw new Error("Company is required before adding verification documents.");
  }

  const parsed = verificationDocumentUploadSchema.safeParse({
    type: formData.get("type")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid verification document payload.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Please select a document.");
  }

  await validateUploadFile(file);
  const uploaded = await saveUploadedFile({
    file,
    folder: `verification/${session.user.companyId}`,
    visibility: "private"
  });

  const document = await prisma.$transaction(async (tx) => {
    const createdDocument = await tx.verificationDocument.create({
      data: {
        companyId: session.user.companyId,
        userId: session.user.id,
        type: parsed.data.type,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey: uploaded.storageKey,
        status: "PENDING"
      }
    });

    await tx.company.update({
      where: { id: session.user.companyId! },
      data: {
        verificationStatus: VerificationStatus.PENDING,
        status: CompanyStatus.PENDING_VERIFICATION
      }
    });

    return createdDocument;
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.COMPANY_UPDATED,
    entityType: "VerificationDocument",
    entityId: document.id,
    metadata: {
      type: document.type,
      status: document.status
    }
  });

  revalidatePath("/fleet/verification");
  revalidatePath("/fleet/company");
  revalidatePath("/fleet");
}
