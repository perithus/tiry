"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { canAccessCampaignFiles, createCampaignFileRecord, getCampaignFileAccessContext } from "@/lib/campaign-files";
import { requireSession } from "@/lib/auth/permissions";
import { createAuditLog } from "@/lib/security/audit";
import { validateUploadFile } from "@/lib/security/uploads";
import { saveUploadedFile } from "@/lib/storage/provider";
import { campaignFileUploadSchema } from "@/lib/validation/campaign";

export async function uploadCampaignFile(formData: FormData) {
  const session = await requireSession();
  const parsed = campaignFileUploadSchema.safeParse({
    campaignId: formData.get("campaignId"),
    label: formData.get("label")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign file payload.");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Please select a file.");
  }

  const campaign = await getCampaignFileAccessContext(parsed.data.campaignId);
  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  if (!canAccessCampaignFiles(session.user, campaign)) {
    throw new Error("You do not have access to this campaign.");
  }

  await validateUploadFile(file);

  const uploaded = await saveUploadedFile({
    file,
    folder: `campaigns/${campaign.id}`,
    visibility: "private"
  });

  const fileId = await createCampaignFileRecord({
    campaignId: campaign.id,
    uploadedById: session.user.id,
    filename: file.name,
    storageKey: uploaded.storageKey,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    label: parsed.data.label || null
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignFile",
    entityId: fileId,
    metadata: {
      campaignId: campaign.id,
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
      label: parsed.data.label || null
    }
  });

  revalidatePath("/admin/campaigns");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet/campaigns");
  revalidatePath(`/admin/campaigns/${campaign.id}`);
  revalidatePath(`/advertiser/campaigns/${campaign.id}`);
  revalidatePath(`/fleet/campaigns/${campaign.id}`);
}
