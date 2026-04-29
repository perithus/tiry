"use server";

import { ConversationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { type InboxThreadType, upsertInboxThreadState } from "@/lib/inbox/thread-state";
import { createNotifications } from "@/lib/notifications/service";
import { createAuditLog } from "@/lib/security/audit";
import { serializeCampaignMessage } from "@/lib/utils/campaign-messages";
import { campaignMessageSchema, inquiryMessageSchema } from "@/lib/validation/message";

export async function sendInquiryMessage(formData: FormData) {
  const session = await requireSession();
  const parsed = inquiryMessageSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid message payload.");
  }

  const inquiry = await prisma.campaignInquiry.findUnique({
    where: { id: parsed.data.inquiryId },
    include: {
      listing: {
        select: {
          companyId: true
        }
      }
    }
  });

  if (!inquiry) {
    throw new Error("Inquiry not found.");
  }

  const isAdvertiser = inquiry.advertiserId === session.user.id;
  const isCarrierSide = Boolean(session.user.companyId && inquiry.listing.companyId === session.user.companyId);
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isAdvertiser && !isCarrierSide && !isAdmin) {
    throw new Error("You do not have access to this conversation.");
  }

  const conversation = await prisma.conversation.upsert({
    where: { inquiryId: inquiry.id },
    update: {},
    create: {
      inquiryId: inquiry.id,
      type: ConversationType.INQUIRY
    }
  });

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: session.user.id,
      body: parsed.data.body
    }
  });

  const linkedCampaign = await prisma.campaign.findFirst({
    where: { inquiryId: inquiry.id },
    select: { id: true }
  });

  const carrierUsers = await prisma.user.findMany({
    where: {
      companyId: inquiry.listing.companyId,
      role: { in: ["CARRIER_OWNER", "FLEET_MANAGER"] }
    },
    select: { id: true }
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true }
  });

  const recipientIds = [
    inquiry.advertiserId,
    ...carrierUsers.map((user) => user.id),
    ...admins.map((admin) => admin.id)
  ].filter((userId) => userId !== session.user.id);

  await createNotifications({
    userIds: recipientIds,
    type: "MESSAGE",
    title: `New message in ${inquiry.campaignName}`,
    body: `${session.user.name} sent a new message in the inquiry thread.`,
    category: "messages"
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "USER_UPDATED",
    entityType: "Message",
    entityId: message.id,
    metadata: {
      campaignId: linkedCampaign?.id ?? null,
      inquiryId: inquiry.id,
      conversationId: conversation.id
    }
  });

  revalidatePath("/advertiser/messages");
  revalidatePath("/fleet/messages");
  revalidatePath("/advertiser/inquiries");
  revalidatePath("/fleet/inquiries");
}

export async function updateInboxThreadStateAction(formData: FormData) {
  const session = await requireSession();
  const threadId = String(formData.get("threadId") ?? "");
  const threadType = String(formData.get("threadType") ?? "") as InboxThreadType;
  const redirectPath = String(formData.get("redirectPath") ?? "");
  const action = String(formData.get("action") ?? "");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  if (!threadId || (threadType !== "inquiry" && threadType !== "campaign")) {
    throw new Error("Invalid thread state payload.");
  }

  if (!["pinned", "archived", "closed"].includes(action)) {
    throw new Error("Invalid thread state action.");
  }

  await assertThreadAccess(session.user.id, session.user.companyId ?? null, session.user.role, threadType, threadId);

  await upsertInboxThreadState({
    userId: session.user.id,
    threadId,
    threadType,
    patch: {
      [action]: nextValue
    }
  });

  revalidatePath("/advertiser/messages");
  revalidatePath("/fleet/messages");
  revalidatePath("/admin/messages");

  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}

export async function sendCampaignMessage(formData: FormData) {
  const session = await requireSession();
  const parsed = campaignMessageSchema.safeParse({
    campaignId: formData.get("campaignId"),
    body: formData.get("body")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid campaign message payload.");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: parsed.data.campaignId },
    include: {
      advertiser: {
        select: {
          id: true
        }
      },
      company: {
        select: {
          id: true
        }
      }
    }
  });

  if (!campaign) {
    throw new Error("Campaign not found.");
  }

  const isAdvertiser = campaign.advertiserId === session.user.id;
  const isCarrierSide = Boolean(session.user.companyId && campaign.companyId && session.user.companyId === campaign.companyId);
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";

  if (!isAdvertiser && !isCarrierSide && !isAdmin) {
    throw new Error("You do not have access to this campaign conversation.");
  }

  const note = await prisma.campaignNote.create({
    data: {
      campaignId: campaign.id,
      authorId: session.user.id,
      body: serializeCampaignMessage(parsed.data.body)
    }
  });

  const carrierUsers = campaign.companyId
    ? await prisma.user.findMany({
        where: {
          companyId: campaign.companyId,
          role: { in: ["CARRIER_OWNER", "FLEET_MANAGER"] }
        },
        select: { id: true }
      })
    : [];

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true }
  });

  const recipientIds = [
    campaign.advertiserId,
    ...carrierUsers.map((user) => user.id),
    ...admins.map((admin) => admin.id)
  ].filter((userId) => userId !== session.user.id);

  await createNotifications({
    userIds: recipientIds,
    type: "MESSAGE",
    title: `New campaign message in ${campaign.name}`,
    body: `${session.user.name} sent a new campaign message.`,
    category: "messages"
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "CAMPAIGN_NOTE_CREATED",
    entityType: "CampaignMessage",
    entityId: note.id,
    metadata: {
      campaignId: campaign.id,
      kind: "message"
    }
  });

  revalidatePath("/admin/messages");
  revalidatePath("/advertiser/messages");
  revalidatePath("/fleet/messages");
  revalidatePath("/admin/campaigns");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet/campaigns");
  revalidatePath(`/admin/campaigns/${campaign.id}`);
  revalidatePath(`/advertiser/campaigns/${campaign.id}`);
  revalidatePath(`/fleet/campaigns/${campaign.id}`);
}

async function assertThreadAccess(userId: string, companyId: string | null, role: string, threadType: InboxThreadType, threadId: string) {
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

  if (threadType === "inquiry") {
    const inquiry = await prisma.campaignInquiry.findUnique({
      where: { id: threadId },
      include: {
        listing: {
          select: {
            companyId: true
          }
        }
      }
    });

    if (!inquiry) {
      throw new Error("Inquiry thread not found.");
    }

    const isAdvertiser = inquiry.advertiserId === userId;
    const isCarrierSide = Boolean(companyId && inquiry.listing.companyId === companyId);

    if (!isAdvertiser && !isCarrierSide && !isAdmin) {
      throw new Error("You do not have access to this thread.");
    }

    return;
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: threadId },
    select: {
      advertiserId: true,
      companyId: true
    }
  });

  if (!campaign) {
    throw new Error("Campaign thread not found.");
  }

  const isAdvertiser = campaign.advertiserId === userId;
  const isCarrierSide = Boolean(companyId && campaign.companyId === companyId);

  if (!isAdvertiser && !isCarrierSide && !isAdmin) {
    throw new Error("You do not have access to this thread.");
  }
}
