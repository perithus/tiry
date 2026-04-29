import { InquiryStatus, OfferStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type Scope = {
  advertiserId?: string;
  companyId?: string;
};

function buildInquiryWhere(scope: Scope) {
  if (scope.advertiserId) {
    return { advertiserId: scope.advertiserId };
  }

  if (scope.companyId) {
    return {
      listing: {
        companyId: scope.companyId
      }
    };
  }

  return {};
}

function buildCampaignWhere(scope: Scope) {
  if (scope.advertiserId) {
    return { advertiserId: scope.advertiserId };
  }

  if (scope.companyId) {
    return { companyId: scope.companyId };
  }

  return {};
}

function buildOfferWhere(scope: Scope) {
  if (scope.companyId) {
    return {
      listing: {
        companyId: scope.companyId
      }
    };
  }

  if (scope.advertiserId) {
    return {
      inquiry: {
        advertiserId: scope.advertiserId
      }
    };
  }

  return {};
}

function buildBookingWhere(scope: Scope) {
  if (scope.companyId) {
    return {
      listing: {
        companyId: scope.companyId
      }
    };
  }

  if (scope.advertiserId) {
    return {
      inquiry: {
        advertiserId: scope.advertiserId
      }
    };
  }

  return {};
}

export async function getSalesPipelineSnapshot(scope: Scope = {}) {
  const inquiryWhere = buildInquiryWhere(scope);
  const offerWhere = buildOfferWhere(scope);
  const bookingWhere = buildBookingWhere(scope);
  const campaignWhere = buildCampaignWhere(scope);

  const [
    inquiries,
    offers,
    bookings,
    campaigns,
    inquiryCount,
    bookedInquiryCount,
    activeCampaignCount
  ] = await Promise.all([
    prisma.campaignInquiry.findMany({
      where: inquiryWhere,
      select: {
        id: true,
        status: true,
        createdAt: true
      }
    }),
    prisma.campaignOffer.findMany({
      where: offerWhere,
      select: {
        id: true,
        inquiryId: true,
        status: true,
        priceCents: true,
        createdAt: true
      }
    }),
    prisma.booking.findMany({
      where: bookingWhere,
      select: {
        status: true,
        totalPriceCents: true
      }
    }),
    prisma.campaign.findMany({
      where: campaignWhere,
      select: {
        status: true,
        budgetCents: true
      }
    }),
    prisma.campaignInquiry.count({ where: inquiryWhere }),
    prisma.campaignInquiry.count({ where: { ...inquiryWhere, status: InquiryStatus.BOOKED } }),
    prisma.campaign.count({ where: { ...campaignWhere, status: { in: ["NEGOTIATION", "READY_TO_BOOK", "ACTIVE"] } } })
  ]);

  const firstOfferByInquiry = new Map<string, Date>();
  for (const offer of offers) {
    if (!firstOfferByInquiry.has(offer.inquiryId)) {
      firstOfferByInquiry.set(offer.inquiryId, offer.createdAt);
    }
  }

  const responseTimes = inquiries
    .map((inquiry) => {
      const firstOfferAt = firstOfferByInquiry.get(inquiry.id);
      if (!firstOfferAt) {
        return null;
      }

      return Math.max(0, firstOfferAt.getTime() - inquiry.createdAt.getTime());
    })
    .filter((value): value is number => value != null);

  const avgResponseHours = responseTimes.length
    ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length / (1000 * 60 * 60))
    : 0;

  const sentOffers = offers.filter((offer) => offer.status === OfferStatus.SENT).length;
  const draftOffers = offers.filter((offer) => offer.status === OfferStatus.DRAFT).length;
  const acceptedOffers = offers.filter((offer) => offer.status === OfferStatus.ACCEPTED).length;
  const expiredOffers = offers.filter((offer) => offer.status === OfferStatus.EXPIRED).length;
  const bookedRevenueCents = bookings
    .filter((booking) => ["CONFIRMED", "ACTIVE", "COMPLETED"].includes(booking.status))
    .reduce((sum, booking) => sum + booking.totalPriceCents, 0);
  const pipelineValueCents = campaigns.reduce((sum, campaign) => sum + (campaign.budgetCents ?? 0), 0);
  const conversionRate = inquiryCount > 0 ? Math.round((bookedInquiryCount / inquiryCount) * 100) : 0;

  return {
    inquiryCount,
    bookedInquiryCount,
    conversionRate,
    sentOffers,
    draftOffers,
    acceptedOffers,
    expiredOffers,
    activeCampaignCount,
    avgResponseHours,
    bookedRevenueCents,
    pipelineValueCents,
    stageCounts: {
      submitted: inquiries.filter((item) => item.status === InquiryStatus.SUBMITTED).length,
      inReview: inquiries.filter((item) => item.status === InquiryStatus.IN_REVIEW).length,
      offerSent: inquiries.filter((item) => item.status === InquiryStatus.OFFER_SENT).length,
      booked: bookedInquiryCount,
      campaignsPlanning: campaigns.filter((item) => item.status === "PLANNING").length,
      campaignsNegotiation: campaigns.filter((item) => item.status === "NEGOTIATION").length,
      campaignsReady: campaigns.filter((item) => item.status === "READY_TO_BOOK").length,
      campaignsActive: campaigns.filter((item) => item.status === "ACTIVE").length,
      campaignsCompleted: campaigns.filter((item) => item.status === "COMPLETED").length
    }
  };
}

