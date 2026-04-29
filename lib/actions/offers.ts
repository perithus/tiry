"use server";

import { AuditAction, BookingStatus, InquiryStatus, OfferStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createNotifications } from "@/lib/notifications/service";
import { createAuditLog } from "@/lib/security/audit";
import { blocksBookingWindow, rangesOverlap } from "@/lib/utils/bookings";
import { expireStaleOffers, parseOfferTerms, serializeOfferTerms } from "@/lib/utils/offers";
import { acceptOfferSchema, campaignOfferLifecycleSchema, offerIdSchema } from "@/lib/validation/offer";

export async function createCampaignOffer(formData: FormData) {
  return saveCampaignOffer(formData);
}

export async function saveCampaignOffer(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  await expireStaleOffers();

  const parsed = campaignOfferLifecycleSchema.safeParse({
    offerId: formData.get("offerId"),
    inquiryId: formData.get("inquiryId"),
    title: formData.get("title"),
    terms: formData.get("terms"),
    priceCents: formData.get("priceCents"),
    currency: formData.get("currency"),
    expiresAt: formData.get("expiresAt"),
    bookedFrom: formData.get("bookedFrom"),
    bookedTo: formData.get("bookedTo"),
    submitMode: formData.get("submitMode")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid offer payload.");
  }

  const inquiry = await prisma.campaignInquiry.findUnique({
    where: { id: parsed.data.inquiryId },
    include: {
      listing: true,
      advertiser: true
    }
  });

  if (!inquiry || inquiry.listing.companyId !== session.user.companyId) {
    throw new Error("You do not have permission to manage an offer for this inquiry.");
  }

  const requestedBookedFrom = new Date(parsed.data.bookedFrom);
  const requestedBookedTo = new Date(parsed.data.bookedTo);
  const shouldSend = parsed.data.submitMode === "send";
  const existingOffer = parsed.data.offerId
    ? await prisma.campaignOffer.findUnique({
        where: { id: parsed.data.offerId }
      })
    : null;

  if (parsed.data.offerId && (!existingOffer || existingOffer.listingId !== inquiry.listingId)) {
    throw new Error("Offer not found.");
  }

  if (existingOffer && !["DRAFT", "SENT", "EXPIRED", "REJECTED"].includes(existingOffer.status)) {
    throw new Error("This offer can no longer be edited.");
  }

  if (shouldSend) {
    await assertOfferBookingWindowAvailable({
      listingId: inquiry.listingId,
      bookedFrom: requestedBookedFrom,
      bookedTo: requestedBookedTo,
      inquiryId: inquiry.id
    });
  }

  const savedOffer = existingOffer
    ? await prisma.campaignOffer.update({
        where: { id: existingOffer.id },
        data: {
          title: parsed.data.title,
          terms: serializeOfferTerms({
            body: parsed.data.terms,
            bookedFrom: parsed.data.bookedFrom,
            bookedTo: parsed.data.bookedTo
          }),
          priceCents: parsed.data.priceCents,
          currency: parsed.data.currency.toUpperCase(),
          status: shouldSend ? OfferStatus.SENT : OfferStatus.DRAFT,
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
          carrierContactId: session.user.id
        }
      })
    : await prisma.campaignOffer.create({
        data: {
          inquiryId: inquiry.id,
          listingId: inquiry.listingId,
          carrierContactId: session.user.id,
          title: parsed.data.title,
          terms: serializeOfferTerms({
            body: parsed.data.terms,
            bookedFrom: parsed.data.bookedFrom,
            bookedTo: parsed.data.bookedTo
          }),
          priceCents: parsed.data.priceCents,
          currency: parsed.data.currency.toUpperCase(),
          status: shouldSend ? OfferStatus.SENT : OfferStatus.DRAFT,
          expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined
        }
      });

  if (shouldSend) {
    await prisma.campaignInquiry.update({
      where: { id: inquiry.id },
      data: {
        status: InquiryStatus.OFFER_SENT
      }
    });

    await prisma.campaign.updateMany({
      where: {
        inquiryId: inquiry.id
      },
      data: {
        status: "NEGOTIATION"
      }
    });

    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      select: { id: true }
    });

    await createNotifications({
      userIds: [inquiry.advertiserId, ...admins.map((admin) => admin.id)],
      type: "OFFER",
      title: `New offer for ${inquiry.campaignName}`,
      body: `${session.user.name} ${existingOffer ? "updated" : "sent"} an offer for ${inquiry.listing.title}.`,
      category: "offers"
    });
  }

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignOffer",
    entityId: savedOffer.id,
    metadata: {
      inquiryId: inquiry.id,
      priceCents: savedOffer.priceCents,
      currency: savedOffer.currency,
      status: savedOffer.status,
      mode: existingOffer ? "updated" : "created"
    }
  });

  revalidateOfferPaths(inquiry.id);
}

export async function duplicateCampaignOffer(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  await expireStaleOffers();
  const parsed = offerIdSchema.safeParse({
    offerId: formData.get("offerId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid offer payload.");
  }

  const offer = await prisma.campaignOffer.findUnique({
    where: { id: parsed.data.offerId },
    include: {
      inquiry: {
        include: {
          listing: true
        }
      }
    }
  });

  if (!offer || offer.inquiry.listing.companyId !== session.user.companyId) {
    throw new Error("Offer not found.");
  }

  const duplicated = await prisma.campaignOffer.create({
    data: {
      inquiryId: offer.inquiryId,
      listingId: offer.listingId,
      carrierContactId: session.user.id,
      title: `${offer.title} copy`,
      terms: offer.terms,
      priceCents: offer.priceCents,
      currency: offer.currency,
      status: OfferStatus.DRAFT,
      expiresAt: offer.expiresAt
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignOffer",
    entityId: duplicated.id,
    metadata: {
      inquiryId: offer.inquiryId,
      sourceOfferId: offer.id,
      mode: "duplicated"
    }
  });

  revalidateOfferPaths(offer.inquiryId);
}

export async function withdrawCampaignOffer(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  await expireStaleOffers();
  const parsed = offerIdSchema.safeParse({
    offerId: formData.get("offerId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid offer payload.");
  }

  const offer = await prisma.campaignOffer.findUnique({
    where: { id: parsed.data.offerId },
    include: {
      inquiry: {
        include: {
          listing: true
        }
      }
    }
  });

  if (!offer || offer.inquiry.listing.companyId !== session.user.companyId) {
    throw new Error("Offer not found.");
  }

  if (offer.status === OfferStatus.ACCEPTED) {
    throw new Error("Accepted offers cannot be withdrawn.");
  }

  await prisma.campaignOffer.update({
    where: { id: offer.id },
    data: {
      status: OfferStatus.EXPIRED,
      expiresAt: new Date()
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignOffer",
    entityId: offer.id,
    metadata: {
      inquiryId: offer.inquiryId,
      mode: "withdrawn"
    }
  });

  revalidateOfferPaths(offer.inquiryId);
}

export async function acceptCampaignOffer(formData: FormData) {
  const session = await requireRole("ADVERTISER");
  await expireStaleOffers();
  const parsed = acceptOfferSchema.safeParse({
    offerId: formData.get("offerId")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid offer acceptance payload.");
  }

  const offer = await prisma.campaignOffer.findUnique({
    where: { id: parsed.data.offerId },
    include: {
      inquiry: true
    }
  });

  if (!offer || offer.inquiry.advertiserId !== session.user.id) {
    throw new Error("You do not have permission to accept this offer.");
  }

  if (offer.status !== OfferStatus.SENT) {
    throw new Error("Only sent offers can be accepted.");
  }

  if (offer.expiresAt && offer.expiresAt < new Date()) {
    await prisma.campaignOffer.update({
      where: { id: offer.id },
      data: { status: OfferStatus.EXPIRED }
    });
    throw new Error("This offer has already expired.");
  }

  const parsedTerms = parseOfferTerms(offer.terms);
  const bookedFrom = parsedTerms.bookedFrom ? new Date(parsedTerms.bookedFrom) : offer.createdAt;
  const bookedTo = parsedTerms.bookedTo ? new Date(parsedTerms.bookedTo) : offer.createdAt;
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      listingId: offer.listingId,
      NOT: {
        inquiryId: offer.inquiryId
      }
    },
    select: {
      status: true,
      bookedFrom: true,
      bookedTo: true
    }
  });

  const overlappingBooking = conflictingBookings.find(
    (booking) => blocksBookingWindow(booking.status) && rangesOverlap(bookedFrom, bookedTo, booking.bookedFrom, booking.bookedTo)
  );

  if (overlappingBooking) {
    throw new Error("This offer can no longer be accepted because the listing is already booked for that time.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.campaignOffer.updateMany({
      where: {
        inquiryId: offer.inquiryId,
        NOT: { id: offer.id }
      },
      data: {
        status: OfferStatus.REJECTED
      }
    });

    await tx.campaignOffer.update({
      where: { id: offer.id },
      data: {
        status: OfferStatus.ACCEPTED
      }
    });

    await tx.campaignInquiry.update({
      where: { id: offer.inquiryId },
      data: {
        status: InquiryStatus.BOOKED
      }
    });

    await tx.booking.upsert({
      where: {
        inquiryId: offer.inquiryId
      },
      update: {
        offerId: offer.id,
        listingId: offer.listingId,
        status: BookingStatus.CONFIRMED,
        bookedFrom,
        bookedTo,
        totalPriceCents: offer.priceCents,
        currency: offer.currency
      },
      create: {
        inquiryId: offer.inquiryId,
        offerId: offer.id,
        listingId: offer.listingId,
        status: BookingStatus.CONFIRMED,
        bookedFrom,
        bookedTo,
        totalPriceCents: offer.priceCents,
        currency: offer.currency
      }
    });

    await tx.campaign.updateMany({
      where: {
        inquiryId: offer.inquiryId
      },
      data: {
        status: "ACTIVE",
        bookedStartDate: bookedFrom,
        bookedEndDate: bookedTo
      }
    });
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true }
  });

  await createNotifications({
    userIds: [offer.carrierContactId, ...admins.map((admin) => admin.id)],
    type: "BOOKING",
    title: `Offer accepted: ${offer.title}`,
    body: `${session.user.name} accepted the offer and booking has been confirmed.`,
    category: "bookings"
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignOffer",
    entityId: offer.id,
    metadata: {
      accepted: true,
      inquiryId: offer.inquiryId
    }
  });

  revalidateOfferPaths(offer.inquiryId);
  revalidatePath("/advertiser");
  revalidatePath("/fleet");
}

async function assertOfferBookingWindowAvailable(input: {
  listingId: string;
  bookedFrom: Date;
  bookedTo: Date;
  inquiryId: string;
}) {
  const conflictingBookings = await prisma.booking.findMany({
    where: {
      listingId: input.listingId,
      status: {
        in: ["PENDING", "CONFIRMED", "ACTIVE"]
      },
      NOT: {
        inquiryId: input.inquiryId
      }
    },
    select: {
      bookedFrom: true,
      bookedTo: true
    }
  });

  const overlappingBooking = conflictingBookings.find((booking) =>
    rangesOverlap(input.bookedFrom, input.bookedTo, booking.bookedFrom, booking.bookedTo)
  );

  if (overlappingBooking) {
    throw new Error("This listing already has a booking in the selected date range.");
  }
}

function revalidateOfferPaths(inquiryId: string) {
  revalidatePath("/fleet/inquiries");
  revalidatePath("/advertiser/inquiries");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet/campaigns");
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin/inquiries");
  revalidatePath("/fleet");
  revalidatePath(`/admin/inquiries`);
  revalidatePath(`/advertiser/inquiries`);
  revalidatePath(`/fleet/inquiries`);
  revalidatePath(`/admin/campaigns`);
  revalidatePath(`/advertiser/campaigns`);
  revalidatePath(`/fleet/campaigns`);
  revalidatePath(`/admin/inquiries?inquiryId=${inquiryId}`);
}
