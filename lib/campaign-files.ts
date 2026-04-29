import crypto from "node:crypto";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type CampaignFileRecord = {
  id: string;
  campaignId: string;
  uploadedById: string;
  uploadedByName: string | null;
  filename: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  label: string | null;
  createdAt: Date;
};

export type CampaignFileAccessContext = {
  id: string;
  name: string;
  advertiserId: string;
  companyId: string | null;
};

const tableName = "campaign_files";

export async function ensureCampaignFilesTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL REFERENCES "Campaign"(id) ON DELETE CASCADE,
      uploaded_by_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size_bytes INTEGER NOT NULL,
      label TEXT,
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS campaign_files_campaign_created_idx
    ON ${tableName} (campaign_id, created_at DESC)
  `);
}

export async function listCampaignFiles(campaignId: string) {
  await ensureCampaignFilesTable();

  return prisma.$queryRaw<Array<CampaignFileRecord>>(Prisma.sql`
    SELECT
      cf.id,
      cf.campaign_id AS "campaignId",
      cf.uploaded_by_id AS "uploadedById",
      u.name AS "uploadedByName",
      cf.filename,
      cf.storage_key AS "storageKey",
      cf.mime_type AS "mimeType",
      cf.size_bytes AS "sizeBytes",
      cf.label,
      cf.created_at AS "createdAt"
    FROM campaign_files cf
    INNER JOIN "User" u
      ON u.id = cf.uploaded_by_id
    WHERE cf.campaign_id = ${campaignId}
    ORDER BY cf.created_at DESC
  `);
}

export async function getCampaignFileById(fileId: string) {
  await ensureCampaignFilesTable();

  const rows = await prisma.$queryRaw<Array<CampaignFileRecord>>(Prisma.sql`
    SELECT
      cf.id,
      cf.campaign_id AS "campaignId",
      cf.uploaded_by_id AS "uploadedById",
      u.name AS "uploadedByName",
      cf.filename,
      cf.storage_key AS "storageKey",
      cf.mime_type AS "mimeType",
      cf.size_bytes AS "sizeBytes",
      cf.label,
      cf.created_at AS "createdAt"
    FROM campaign_files cf
    INNER JOIN "User" u
      ON u.id = cf.uploaded_by_id
    WHERE cf.id = ${fileId}
    LIMIT 1
  `);

  return rows[0] ?? null;
}

export async function createCampaignFileRecord(input: {
  campaignId: string;
  uploadedById: string;
  filename: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  label?: string | null;
}) {
  await ensureCampaignFilesTable();

  const id = crypto.randomUUID();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO campaign_files (
      id,
      campaign_id,
      uploaded_by_id,
      filename,
      storage_key,
      mime_type,
      size_bytes,
      label,
      updated_at
    )
    VALUES (
      ${id},
      ${input.campaignId},
      ${input.uploadedById},
      ${input.filename},
      ${input.storageKey},
      ${input.mimeType},
      ${input.sizeBytes},
      ${input.label ?? null},
      NOW()
    )
  `);

  return id;
}

export async function getCampaignFileAccessContext(campaignId: string) {
  return prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      name: true,
      advertiserId: true,
      companyId: true
    }
  });
}

export function canAccessCampaignFiles(
  user: { id: string; companyId?: string | null; role: UserRole | string },
  campaign: CampaignFileAccessContext
) {
  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
  const isAdvertiser = campaign.advertiserId === user.id;
  const isCarrierSide = Boolean(user.companyId && campaign.companyId && user.companyId === campaign.companyId);

  return isAdmin || isAdvertiser || isCarrierSide;
}
