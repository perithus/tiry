"use server";

import { CampaignStatus, InquiryStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createNotifications } from "@/lib/notifications/service";
import { createAuditLog } from "@/lib/security/audit";
import { bookingStatusUpdateSchema } from "@/lib/validation/booking";

export async function updateBookingStatus(formData: FormData) {
  const session = await requireSession();
  const parsed = bookingStatusUpdateSchema.safeParse({
    bookingId: formData.get("bookingId"),
    campaignId: formData.get("campaignId"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid booking payload.");
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: {
      inquiry: {
        select: {
          advertiserId: true,
          campaignName: true
        }
      },
      listing: {
        select: {
          companyId: true,
          title: true
        }
      }
    }
  });

  if (!booking) {
    throw new Error("Booking not found.");
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isCarrierSide = Boolean(session.user.companyId && session.user.companyId === booking.listing.companyId);

  if (!isAdmin && !isCarrierSide) {
    throw new Error("You do not have access to update this booking.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: { status: parsed.data.status }
    });

    if (parsed.data.status === "ACTIVE") {
      await tx.campaign.updateMany({
        where: { inquiryId: booking.inquiryId },
        data: { status: CampaignStatus.ACTIVE }
      });
    }

    if (parsed.data.status === "COMPLETED") {
      await tx.campaign.updateMany({
        where: { inquiryId: booking.inquiryId },
        data: { status: CampaignStatus.COMPLETED }
      });

      await tx.campaignInquiry.update({
        where: { id: booking.inquiryId },
        data: { status: InquiryStatus.CLOSED }
      });
    }

    if (parsed.data.status === "CANCELLED") {
      await tx.campaign.updateMany({
        where: { inquiryId: booking.inquiryId },
        data: { status: CampaignStatus.CANCELLED }
      });

      await tx.campaignInquiry.update({
        where: { id: booking.inquiryId },
        data: { status: InquiryStatus.CLOSED }
      });
    }
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true }
  });

  const carrierUsers = await prisma.user.findMany({
    where: {
      companyId: booking.listing.companyId,
      role: { in: ["CARRIER_OWNER", "FLEET_MANAGER"] }
    },
    select: { id: true }
  });

  await createNotifications({
    userIds: [booking.inquiry.advertiserId, ...carrierUsers.map((user) => user.id), ...admins.map((admin) => admin.id)].filter(
      (userId) => userId !== session.user.id
    ),
    type: "BOOKING",
    title: `Booking updated for ${booking.inquiry.campaignName}`,
    body: `${session.user.name} changed the booking status to ${parsed.data.status}.`,
    category: "bookings"
  });

  await createAuditLog({
    actorId: session.user.id,
    action: "CAMPAIGN_UPDATED",
    entityType: "Booking",
    entityId: booking.id,
    metadata: {
      campaignId: parsed.data.campaignId || null,
      status: parsed.data.status,
      inquiryId: booking.inquiryId
    }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin/inquiries");
  revalidatePath("/fleet");
  revalidatePath("/fleet/campaigns");
  revalidatePath("/fleet/availability");
  revalidatePath("/advertiser");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/advertiser/inquiries");

  if (parsed.data.campaignId) {
    revalidatePath(`/admin/campaigns/${parsed.data.campaignId}`);
    revalidatePath(`/fleet/campaigns/${parsed.data.campaignId}`);
    revalidatePath(`/advertiser/campaigns/${parsed.data.campaignId}`);
  }
}
