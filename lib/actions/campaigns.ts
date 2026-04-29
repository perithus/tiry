"use server";

import { AuditAction, CampaignStatus, CampaignTaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/auth/permissions";
import {
  canAccessCampaignWorkspace,
  createCampaignMilestone,
  getCampaignAccessContext,
  saveCampaignWrapUp,
  updateCampaignMilestone
} from "@/lib/campaign-operations";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import {
  adminCampaignWrapUpSchema,
  campaignFromInquirySchema,
  campaignDetailsUpdateSchema,
  campaignMilestoneSchema,
  campaignMilestoneUpdateSchema,
  campaignNoteSchema,
  campaignSchema,
  participantCampaignWrapUpSchema,
  campaignTaskDetailsUpdateSchema,
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
  const session = await requireSession();
  const parsed = campaignSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false as const,
      error: parsed.error.issues[0]?.message ?? "Invalid campaign payload."
    };
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isAdvertiser = session.user.role === "ADVERTISER";

  if (!isAdmin && !isAdvertiser) {
    return {
      ok: false as const,
      error: "You do not have permission to create campaigns."
    };
  }

  if (isAdvertiser && parsed.data.advertiserId !== session.user.id) {
    return {
      ok: false as const,
      error: "Advertisers can only create campaigns for their own account."
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
      ownerId: isAdmin ? parsed.data.ownerId || session.user.id : undefined,
      status: isAdmin ? parsed.data.status : CampaignStatus.PLANNING,
      priority: parsed.data.priority,
      source: parsed.data.source,
      brief: parsed.data.brief || undefined,
      internalSummary: isAdmin ? parsed.data.internalSummary || undefined : undefined,
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
  revalidatePath("/fleet/campaigns");

  return {
    ok: true as const,
    campaignId: campaign.id
  };
}

export async function addCampaignNote(formData: FormData) {
  const session = await requireSession();
  const parsed = campaignNoteSchema.safeParse({
    campaignId: formData.get("campaignId"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign note payload.");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: parsed.data.campaignId },
    select: {
      id: true,
      advertiserId: true,
      companyId: true
    }
  });

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isAdvertiser = campaign.advertiserId === session.user.id;
  const isCarrierSide = Boolean(session.user.companyId && campaign.companyId === session.user.companyId);

  if (!isAdmin && !isAdvertiser && !isCarrierSide) {
    throw new Error("You do not have access to this campaign.");
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
    entityId: parsed.data.campaignId,
    metadata: {
      campaignId: parsed.data.campaignId
    }
  });

  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet/campaigns");
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
    entityId: parsed.data.campaignId,
    metadata: {
      campaignId: parsed.data.campaignId,
      title: parsed.data.title
    }
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
    metadata: {
      campaignId: parsed.data.campaignId,
      status: parsed.data.status
    }
  });

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/advertiser/campaigns");
}

export async function updateCampaignDetails(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignDetailsUpdateSchema.safeParse({
    campaignId: formData.get("campaignId"),
    name: formData.get("name"),
    priority: formData.get("priority"),
    ownerId: formData.get("ownerId"),
    budgetCents: formData.get("budgetCents"),
    currency: formData.get("currency"),
    plannedStartDate: formData.get("plannedStartDate"),
    plannedEndDate: formData.get("plannedEndDate"),
    bookedStartDate: formData.get("bookedStartDate"),
    bookedEndDate: formData.get("bookedEndDate"),
    brief: formData.get("brief"),
    internalSummary: formData.get("internalSummary")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign details payload.");
  }

  await prisma.campaign.update({
    where: { id: parsed.data.campaignId },
    data: {
      name: parsed.data.name,
      priority: parsed.data.priority,
      ownerId: parsed.data.ownerId || null,
      budgetCents: parsed.data.budgetCents,
      currency: parsed.data.currency.toUpperCase(),
      plannedStartDate: parsed.data.plannedStartDate ? new Date(parsed.data.plannedStartDate) : null,
      plannedEndDate: parsed.data.plannedEndDate ? new Date(parsed.data.plannedEndDate) : null,
      bookedStartDate: parsed.data.bookedStartDate ? new Date(parsed.data.bookedStartDate) : null,
      bookedEndDate: parsed.data.bookedEndDate ? new Date(parsed.data.bookedEndDate) : null,
      brief: parsed.data.brief || null,
      internalSummary: parsed.data.internalSummary || null
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "Campaign",
    entityId: parsed.data.campaignId,
    metadata: {
      campaignId: parsed.data.campaignId,
      name: parsed.data.name,
      priority: parsed.data.priority,
      ownerId: parsed.data.ownerId || null
    }
  });

  revalidatePath("/admin/campaigns");
  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/advertiser/campaigns");
  revalidatePath(`/advertiser/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/fleet/campaigns");
  revalidatePath(`/fleet/campaigns/${parsed.data.campaignId}`);
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
    metadata: {
      campaignId: parsed.data.campaignId,
      status: parsed.data.status
    }
  });

  revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
  revalidatePath("/admin/campaigns");
}

export async function addCampaignMilestoneAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignMilestoneSchema.safeParse({
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    phase: formData.get("phase"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign milestone payload.");
  }

  const milestoneId = await createCampaignMilestone({
    campaignId: parsed.data.campaignId,
    title: parsed.data.title,
    phase: parsed.data.phase,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    assigneeId: parsed.data.assigneeId || null,
    createdById: session.user.id
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignMilestone",
    entityId: milestoneId,
    metadata: {
      campaignId: parsed.data.campaignId,
      title: parsed.data.title,
      phase: parsed.data.phase,
      status: parsed.data.status,
      kind: "milestone_created"
    }
  });

  revalidateCampaignWorkspace(parsed.data.campaignId);
}

export async function updateCampaignMilestoneAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignMilestoneUpdateSchema.safeParse({
    milestoneId: formData.get("milestoneId"),
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    phase: formData.get("phase"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign milestone update payload.");
  }

  await updateCampaignMilestone({
    milestoneId: parsed.data.milestoneId,
    campaignId: parsed.data.campaignId,
    title: parsed.data.title,
    phase: parsed.data.phase,
    status: parsed.data.status,
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    assigneeId: parsed.data.assigneeId || null
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignMilestone",
    entityId: parsed.data.milestoneId,
    metadata: {
      campaignId: parsed.data.campaignId,
      title: parsed.data.title,
      phase: parsed.data.phase,
      status: parsed.data.status,
      kind: "milestone_updated"
    }
  });

  revalidateCampaignWorkspace(parsed.data.campaignId);
}

export async function saveAdminCampaignWrapUpAction(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = adminCampaignWrapUpSchema.safeParse({
    campaignId: formData.get("campaignId"),
    deliverySummary: formData.get("deliverySummary"),
    proofOfDelivery: formData.get("proofOfDelivery"),
    internalOutcome: formData.get("internalOutcome"),
    renewalOpportunity: formData.get("renewalOpportunity"),
    followUpOwner: formData.get("followUpOwner")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign wrap-up payload.");
  }

  await saveCampaignWrapUp({
    campaignId: parsed.data.campaignId,
    deliverySummary: parsed.data.deliverySummary || null,
    proofOfDelivery: parsed.data.proofOfDelivery || null,
    internalOutcome: parsed.data.internalOutcome || null,
    renewalOpportunity: parsed.data.renewalOpportunity || null,
    followUpOwner: parsed.data.followUpOwner || null
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignWrapUp",
    entityId: parsed.data.campaignId,
    metadata: {
      campaignId: parsed.data.campaignId,
      kind: "wrap_up_admin"
    }
  });

  revalidateCampaignWorkspace(parsed.data.campaignId);
}

export async function saveParticipantCampaignWrapUpAction(formData: FormData) {
  const session = await requireSession();
  const parsed = participantCampaignWrapUpSchema.safeParse({
    campaignId: formData.get("campaignId"),
    feedback: formData.get("feedback"),
    rating: formData.get("rating")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign feedback payload.");
  }

  const campaign = await getCampaignAccessContext(parsed.data.campaignId);
  if (!campaign || !canAccessCampaignWorkspace(session.user, campaign)) {
    throw new Error("You do not have access to this campaign.");
  }

  const isAdvertiser = campaign.advertiserId === session.user.id;

  await saveCampaignWrapUp({
    campaignId: parsed.data.campaignId,
    advertiserFeedback: isAdvertiser ? parsed.data.feedback || null : undefined,
    advertiserRating: isAdvertiser ? parsed.data.rating ?? null : undefined,
    carrierFeedback: !isAdvertiser ? parsed.data.feedback || null : undefined,
    carrierRating: !isAdvertiser ? parsed.data.rating ?? null : undefined
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignWrapUp",
    entityId: parsed.data.campaignId,
    metadata: {
      campaignId: parsed.data.campaignId,
      kind: isAdvertiser ? "wrap_up_advertiser" : "wrap_up_carrier"
    }
  });

  revalidateCampaignWorkspace(parsed.data.campaignId);
}

export async function updateCampaignTaskDetails(formData: FormData) {
  const session = await requireRole("ADMIN");
  const parsed = campaignTaskDetailsUpdateSchema.safeParse({
    taskId: formData.get("taskId"),
    campaignId: formData.get("campaignId"),
    title: formData.get("title"),
    description: formData.get("description"),
    assigneeId: formData.get("assigneeId"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign task details payload.");
  }

  await prisma.campaignTask.update({
    where: { id: parsed.data.taskId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      assigneeId: parsed.data.assigneeId || null,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      status: parsed.data.status,
      completedAt: parsed.data.status === CampaignTaskStatus.DONE ? new Date() : null
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignTask",
    entityId: parsed.data.taskId,
    metadata: {
      campaignId: parsed.data.campaignId,
      title: parsed.data.title,
      status: parsed.data.status,
      assigneeId: parsed.data.assigneeId || null
    }
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
      campaignId: campaign.id,
      inquiryId: inquiry.id,
      advertiserId: inquiry.advertiserId
    }
  });

  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin");
  revalidatePath("/advertiser/campaigns");
}

function revalidateCampaignWorkspace(campaignId: string) {
  revalidatePath("/admin/campaigns");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet/campaigns");
  revalidatePath(`/admin/campaigns/${campaignId}`);
  revalidatePath(`/advertiser/campaigns/${campaignId}`);
  revalidatePath(`/fleet/campaigns/${campaignId}`);
}
