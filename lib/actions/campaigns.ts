"use server";

import { AuditAction, CampaignStatus, CampaignTaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import {
  campaignFromInquirySchema,
  campaignNoteSchema,
  campaignSchema,
  campaignStatusUpdateSchema,
  campaignTaskStatusUpdateSchema,
  campaignTaskSchema,
  type CampaignInput
} from "@/lib/validation/campaign";

function slugifyCampaignName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

async function buildUniqueCampaignSlug(name: string) {
  const base = slugifyCampaignName(name) || "campaign";
  const candidate = `${base}-${Date.now().toString(36)}`;

  const existing = await prisma.campaign.findUnique({
    where: { slug: candidate },
    select: { id: true }
  });

  return existing ? `${candidate}-${Math.random().toString(36).slice(2, 6)}` : candidate;
}

export async function createCampaign(input: CampaignInput) {
  const session = await requireRole("ADMIN");
  const parsed = campaignSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid campaign payload."
    };
  }

  const slug = await buildUniqueCampaignSlug(parsed.data.name);

  const campaign = await prisma.campaign.create({
    data: {
      name: parsed.data.name,
      slug,
      advertiserId: parsed.data.advertiserId,
      companyId: parsed.data.companyId || undefined,
      primaryListingId: parsed.data.primaryListingId || undefined,
      inquiryId: parsed.data.inquiryId || undefined,
      ownerId: parsed.data.ownerId || session.user.id,
      status: parsed.data.status,
      priority: parsed.data.priority,
      source: parsed.data.source,
      brief: parsed.data.brief || undefined,
      internalSummary: parsed.data.internalSummary || undefined,
      budgetCents: parsed.data.budgetCents,
      currency: parsed.data.currency.toUpperCase(),
      plannedStartDate: parsed.data.plannedStartDate ? new Date(parsed.data.plannedStartDate) : undefined,
      plannedEndDate: parsed.data.plannedEndDate ? new Date(parsed.data.plannedEndDate) : undefined
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_CREATED,
    entityType: "Campaign",
    entityId: campaign.id,
    metadata: {
      status: campaign.status,
      priority: campaign.priority,
      advertiserId: campaign.advertiserId
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  revalidatePath("/advertiser/campaigns");

  return {
    ok: true as const,
    campaignId: campaign.id
  };
}

export async function addCampaignNote(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignNoteSchema.safeParse({
    campaignId: formData.get("campaignId"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign note payload.");
  }

  await prisma.campaignNote.create({
    data: {
      campaignId: parsed.data.campaignId,
      authorId: session.user.id,
      body: parsed.data.body
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_NOTE_CREATED,
    entityType: "Campaign",
    entityId: parsed.data.campaignId
  });

  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
}

export async function addCampaignTask(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignTaskSchema.safeParse({
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    description: formData.get("description"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign task payload.");
  }

  await prisma.campaignTask.create({
    data: {
      campaignId: parsed.data.campaignId,
      title: parsed.data.title,
      description: parsed.data.description || undefined,
      assigneeId: parsed.data.assigneeId || undefined,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
      status: CampaignTaskStatus.TODO
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_TASK_CREATED,
    entityType: "Campaign",
    entityId: parsed.data.campaignId
  });

  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
}

export async function updateCampaignStatus(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignStatusUpdateSchema.safeParse({
    campaignId: formData.get("campaignId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign status payload.");
  }

  await prisma.campaign.update({
    where: { id: parsed.data.campaignId },
    data: {
      status: parsed.data.status as CampaignStatus
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "Campaign",
    entityId: parsed.data.campaignId,
    metadata: { status: parsed.data.status }
  });

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/advertiser/campaigns");
}

export async function updateCampaignTaskStatus(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignTaskStatusUpdateSchema.safeParse({
    taskId: formData.get("taskId"),
    campaignId: formData.get("campaignId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign task status payload.");
  }

  await prisma.campaignTask.update({
    where: { id: parsed.data.taskId },
    data: {
      status: parsed.data.status,
      completedAt: parsed.data.status === CampaignTaskStatus.DONE ? new Date() : null
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignTask",
    entityId: parsed.data.taskId,
    metadata: { status: parsed.data.status }
  });

  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/admin/campaigns");
}

export async function createCampaignFromInquiry(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignFromInquirySchema.safeParse({
    inquiryId: formData.get("inquiryId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid inquiry to campaign payload.");
  }

  const inquiry = await prisma.campaignInquiry.findUnique({
    where: { id: parsed.data.inquiryId },
    include: {
      advertiser: true,
      listing: {
        include: {
          company: true
        }
      }
    }
  });

  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }

  const existingCampaign = await prisma.campaign.findFirst({
    where: { inquiryId: inquiry.id },
    select: { id: true }
  });

  if (existingCampaign) {
    revalidatePath("/admin/inquiries");
    return;
  }

  const slug = await buildUniqueCampaignSlug(inquiry.campaignName);

  const campaign = await prisma.campaign.create({
    data: {
      name: inquiry.campaignName,
      slug,
      advertiserId: inquiry.advertiserId,
      companyId: inquiry.listing.companyId,
      primaryListingId: inquiry.listingId,
      inquiryId: inquiry.id,
      ownerId: session.user.id,
      status: CampaignStatus.PLANNING,
      priority: "MEDIUM",
      source: "MARKETPLACE_INQUIRY",
      brief: inquiry.message,
      internalSummary: `Created from inquiry by ${inquiry.advertiser.email}.`,
      budgetCents: inquiry.budgetMaxCents ?? inquiry.budgetMinCents ?? undefined,
      currency: "EUR",
      plannedStartDate: inquiry.desiredStartDate ?? undefined,
      plannedEndDate: inquiry.desiredEndDate ?? undefined
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_CREATED,
    entityType: "Campaign",
    entityId: campaign.id,
    metadata: {
      inquiryId: inquiry.id,
      advertiserId: inquiry.advertiserId
    }
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin");
  revalidatePath("/advertiser/campaigns");
}
