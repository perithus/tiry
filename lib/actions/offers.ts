"use server";

import { AuditAction, BookingStatus, InquiryStatus, OfferStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { acceptOfferSchema, campaignOfferSchema } from "@/lib/validation/offer";

export async function createCampaignOffer(formData: FormData) {
  const session = await requireRole("CARRIER_OWNER");
  const parsed = campaignOfferSchema.safeParse({
    inquiryId: formData.get("inquiryId"),
    title: formData.get("title"),
    terms: formData.get("terms"),
    priceCents: formData.get("priceCents"),
    currency: formData.get("currency"),
    expiresAt: formData.get("expiresAt"),
    bookedFrom: formData.get("bookedFrom"),
    bookedTo: formData.get("bookedTo")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid offer payload.");
  }

  const inquiry = await prisma.campaignInquiry.findUnique({
    where: { id: parsed.data.inquiryId },
    include: {
      listing: true
    }
  });

  if (!inquiry || inquiry.listing.companyId !== session.user.companyId) {
    throw new Error("You do not have permission to create an offer for this inquiry.");
  }

  const offer = await prisma.campaignOffer.create({
    data: {
      inquiryId: inquiry.id,
      listingId: inquiry.listingId,
      carrierContactId: session.user.id,
      title: parsed.data.title,
      terms: JSON.stringify({
        body: parsed.data.terms,
        bookedFrom: parsed.data.bookedFrom,
        bookedTo: parsed.data.bookedTo
      }),
      priceCents: parsed.data.priceCents,
      currency: parsed.data.currency.toUpperCase(),
      status: OfferStatus.SENT,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined
    }
  });

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

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CAMPAIGN_UPDATED,
    entityType: "CampaignOffer",
    entityId: offer.id,
    metadata: {
      inquiryId: inquiry.id,
      priceCents: offer.priceCents,
      currency: offer.currency
    }
  });

  revalidatePath("/fleet/inquiries");
  revalidatePath("/advertiser/inquiries");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/fleet");
}

export async function acceptCampaignOffer(formData: FormData) {
  const session = await requireRole("ADVERTISER");
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

  const parsedTerms = safeParseOfferTerms(offer.terms);
  const bookedFrom = parsedTerms?.bookedFrom ? new Date(parsedTerms.bookedFrom) : offer.createdAt;
  const bookedTo = parsedTerms?.bookedTo ? new Date(parsedTerms.bookedTo) : offer.createdAt;

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

  revalidatePath("/advertiser/inquiries");
  revalidatePath("/advertiser/campaigns");
  revalidatePath("/advertiser");
  revalidatePath("/fleet/inquiries");
  revalidatePath("/fleet");
}

function safeParseOfferTerms(terms: string): { body?: string; bookedFrom?: string; bookedTo?: string } | null {
  try {
    const parsed = JSON.parse(terms) as { body?: string; bookedFrom?: string; bookedTo?: string };
    return parsed;
  } catch {
    return null;
  }
}
