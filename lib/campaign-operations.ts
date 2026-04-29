import crypto from "node:crypto";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type CampaignMilestoneStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";

export type CampaignMilestoneRecord = {
  id: string;
  campaignId: string;
  title: string;
  phase: string;
  status: CampaignMilestoneStatus;
  dueDate: Date | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: Date;
  completedAt: Date | null;
};

export type CampaignWrapUpRecord = {
  campaignId: string;
  deliverySummary: string | null;
  proofOfDelivery: string | null;
  internalOutcome: string | null;
  renewalOpportunity: string | null;
  followUpOwner: string | null;
  advertiserFeedback: string | null;
  advertiserRating: number | null;
  carrierFeedback: string | null;
  carrierRating: number | null;
  updatedAt: Date;
};

export type CampaignAccessContext = {
  id: string;
  advertiserId: string;
  companyId: string | null;
};

const milestonesTable = "campaign_milestones";
const wrapUpsTable = "campaign_wrapups";

export async function ensureCampaignOperationsTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${milestonesTable} (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES "Campaign"(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      phase TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'TODO',
      due_date TIMESTAMP(3),
      assignee_id TEXT REFERENCES "User"(id) ON DELETE SET NULL,
      created_by_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      completed_at TIMESTAMP(3),
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS campaign_milestones_campaign_idx
    ON ${milestonesTable} (campaign_id, due_date ASC, created_at DESC)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${wrapUpsTable} (
      campaign_id TEXT PRIMARY KEY REFERENCES "Campaign"(id) ON DELETE CASCADE,
      delivery_summary TEXT,
      proof_of_delivery TEXT,
      internal_outcome TEXT,
      renewal_opportunity TEXT,
      follow_up_owner TEXT,
      advertiser_feedback TEXT,
      advertiser_rating INTEGER,
      carrier_feedback TEXT,
      carrier_rating INTEGER,
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);
}

export async function getCampaignAccessContext(campaignId: string) {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      advertiserId: true,
      companyId: true
    }
  });
}

export function canAccessCampaignWorkspace(
  user: { id: string; companyId?: string | null; role: UserRole | string },
  campaign: CampaignAccessContext
) {
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isAdvertiser = campaign.advertiserId === user.id;
  const isCarrierSide = Boolean(user.companyId && campaign.companyId && user.companyId === campaign.companyId);

  return isAdmin || isAdvertiser || isCarrierSide;
}

export async function listCampaignMilestones(campaignId: string) {
  await ensureCampaignOperationsTables();

  return prisma.$queryRaw<Array<CampaignMilestoneRecord>>(Prisma.sql`
    SELECT
      m.id,
      m.campaign_id AS "campaignId",
      m.title,
      m.phase,
      m.status,
      m.due_date AS "dueDate",
      m.assignee_id AS "assigneeId",
      u.name AS "assigneeName",
      m.created_at AS "createdAt",
      m.completed_at AS "completedAt"
    FROM campaign_milestones m
    LEFT JOIN "User" u
      ON u.id = m.assignee_id
    WHERE m.campaign_id = ${campaignId}
    ORDER BY
      CASE m.status WHEN 'DONE' THEN 1 ELSE 0 END ASC,
      m.due_date ASC NULLS LAST,
      m.created_at DESC
  `);
}

export async function createCampaignMilestone(input: {
  campaignId: string;
  title: string;
  phase: string;
  status: CampaignMilestoneStatus;
  dueDate?: Date | null;
  assigneeId?: string | null;
  createdById: string;
}) {
  await ensureCampaignOperationsTables();
  const id = crypto.randomUUID();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO campaign_milestones (
      id,
      campaign_id,
      title,
      phase,
      status,
      due_date,
      assignee_id,
      created_by_id,
      completed_at,
      updated_at
    )
    VALUES (
      ${id},
      ${input.campaignId},
      ${input.title},
      ${input.phase},
      ${input.status},
      ${input.dueDate ?? null},
      ${input.assigneeId ?? null},
      ${input.createdById},
      ${input.status === "DONE" ? new Date() : null},
      NOW()
    )
  `);

  return id;
}

export async function updateCampaignMilestone(input: {
  milestoneId: string;
  campaignId: string;
  title: string;
  phase: string;
  status: CampaignMilestoneStatus;
  dueDate?: Date | null;
  assigneeId?: string | null;
}) {
  await ensureCampaignOperationsTables();

  await prisma.$executeRaw(Prisma.sql`
    UPDATE campaign_milestones
    SET
      title = ${input.title},
      phase = ${input.phase},
      status = ${input.status},
      due_date = ${input.dueDate ?? null},
      assignee_id = ${input.assigneeId ?? null},
      completed_at = CASE
        WHEN ${input.status} = 'DONE' THEN COALESCE(completed_at, NOW())
        ELSE NULL
      END,
      updated_at = NOW()
    WHERE id = ${input.milestoneId}
      AND campaign_id = ${input.campaignId}
  `);
}

export async function getCampaignWrapUp(campaignId: string) {
  await ensureCampaignOperationsTables();

  const rows = await prisma.$queryRaw<Array<CampaignWrapUpRecord>>(Prisma.sql`
    SELECT
      campaign_id AS "campaignId",
      delivery_summary AS "deliverySummary",
      proof_of_delivery AS "proofOfDelivery",
      internal_outcome AS "internalOutcome",
      renewal_opportunity AS "renewalOpportunity",
      follow_up_owner AS "followUpOwner",
      advertiser_feedback AS "advertiserFeedback",
      advertiser_rating AS "advertiserRating",
      carrier_feedback AS "carrierFeedback",
      carrier_rating AS "carrierRating",
      updated_at AS "updatedAt"
    FROM campaign_wrapups
    WHERE campaign_id = ${campaignId}
    LIMIT 1
  `);

  return rows[0] ?? null;
}

export async function saveCampaignWrapUp(input: {
  campaignId: string;
  deliverySummary?: string | null;
  proofOfDelivery?: string | null;
  internalOutcome?: string | null;
  renewalOpportunity?: string | null;
  followUpOwner?: string | null;
  advertiserFeedback?: string | null;
  advertiserRating?: number | null;
  carrierFeedback?: string | null;
  carrierRating?: number | null;
}) {
  await ensureCampaignOperationsTables();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO campaign_wrapups (
      campaign_id,
      delivery_summary,
      proof_of_delivery,
      internal_outcome,
      renewal_opportunity,
      follow_up_owner,
      advertiser_feedback,
      advertiser_rating,
      carrier_feedback,
      carrier_rating,
      updated_at
    )
    VALUES (
      ${input.campaignId},
      ${input.deliverySummary ?? null},
      ${input.proofOfDelivery ?? null},
      ${input.internalOutcome ?? null},
      ${input.renewalOpportunity ?? null},
      ${input.followUpOwner ?? null},
      ${input.advertiserFeedback ?? null},
      ${input.advertiserRating ?? null},
      ${input.carrierFeedback ?? null},
      ${input.carrierRating ?? null},
      NOW()
    )
    ON CONFLICT (campaign_id) DO UPDATE SET
      delivery_summary = COALESCE(${input.deliverySummary}, campaign_wrapups.delivery_summary),
      proof_of_delivery = COALESCE(${input.proofOfDelivery}, campaign_wrapups.proof_of_delivery),
      internal_outcome = COALESCE(${input.internalOutcome}, campaign_wrapups.internal_outcome),
      renewal_opportunity = COALESCE(${input.renewalOpportunity}, campaign_wrapups.renewal_opportunity),
      follow_up_owner = COALESCE(${input.followUpOwner}, campaign_wrapups.follow_up_owner),
      advertiser_feedback = COALESCE(${input.advertiserFeedback}, campaign_wrapups.advertiser_feedback),
      advertiser_rating = COALESCE(${input.advertiserRating}, campaign_wrapups.advertiser_rating),
      carrier_feedback = COALESCE(${input.carrierFeedback}, campaign_wrapups.carrier_feedback),
      carrier_rating = COALESCE(${input.carrierRating}, campaign_wrapups.carrier_rating),
      updated_at = NOW()
  `);
}
