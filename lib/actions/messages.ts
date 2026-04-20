"use server";

import { ConversationType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { inquiryMessageSchema } from "@/lib/validation/message";

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

  if (!isAdvertiser && !isCarrierSide) {
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

  await createAuditLog({
    actorId: session.user.id,
    action: "USER_UPDATED",
    entityType: "Message",
    entityId: message.id,
    metadata: {
      inquiryId: inquiry.id,
      conversationId: conversation.id
    }
  });

  revalidatePath("/advertiser/messages");
  revalidatePath("/fleet/messages");
  revalidatePath("/advertiser/inquiries");
  revalidatePath("/fleet/inquiries");
}
