"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { companyProfileSchema, companyTeamMemberSchema, verificationDocumentSchema } from "@/lib/validation/company";
import { createAuditLog } from "@/lib/security/audit";

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

export async function addVerificationDocument(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");

  if (!session.user.companyId) {
    throw new Error("Company is required before adding verification documents.");
  }

  const parsed = verificationDocumentSchema.safeParse({
    type: formData.get("type"),
    filename: formData.get("filename"),
    mimeType: formData.get("mimeType"),
    sizeBytes: formData.get("sizeBytes"),
    storageKey: formData.get("storageKey")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid verification document payload.");
  }

  const document = await prisma.verificationDocument.create({
    data: {
      companyId: session.user.companyId,
      userId: session.user.id,
      type: parsed.data.type,
      filename: parsed.data.filename,
      mimeType: parsed.data.mimeType,
      sizeBytes: parsed.data.sizeBytes,
      storageKey: parsed.data.storageKey,
      status: "PENDING"
    }
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
  revalidatePath("/fleet");
}
