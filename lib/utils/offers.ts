import { prisma } from "@/lib/db/prisma";

export type ParsedOfferTerms = {
  body?: string;
  bookedFrom?: string;
  bookedTo?: string;
};

export function parseOfferTerms(terms: string): ParsedOfferTerms {
  try {
    return JSON.parse(terms) as ParsedOfferTerms;
  } catch {
    return { body: terms };
  }
}

export function serializeOfferTerms(input: ParsedOfferTerms) {
  return JSON.stringify({
    body: input.body ?? "",
    bookedFrom: input.bookedFrom ?? null,
    bookedTo: input.bookedTo ?? null
  });
}

export async function expireStaleOffers() {
  return prisma.campaignOffer.updateMany({
    where: {
      status: "SENT",
      expiresAt: {
        lt: new Date()
      }
    },
    data: {
      status: "EXPIRED"
    }
  });
}

