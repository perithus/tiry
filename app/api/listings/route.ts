import { NextResponse } from "next/server";
import { ListingStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { listingFilterSchema } from "@/lib/validation/listing";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = listingFilterSchema.safeParse({
    country: searchParams.get("country") ?? undefined,
    routeScope: searchParams.get("routeScope") ?? undefined,
    pricingModel: searchParams.get("pricingModel") ?? undefined,
    search: searchParams.get("search") ?? undefined
  });

  if (!input.success) {
    return NextResponse.json({ error: "Invalid filters." }, { status: 400 });
  }

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      baseCountry: input.data.country,
      routeScope: input.data.routeScope,
      pricingModel: input.data.pricingModel,
      OR: input.data.search
        ? [
            { title: { contains: input.data.search, mode: "insensitive" } },
            { description: { contains: input.data.search, mode: "insensitive" } },
            { company: { displayName: { contains: input.data.search, mode: "insensitive" } } }
          ]
        : undefined
    },
    include: {
      company: true
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 50
  });

  return NextResponse.json({ listings });
}
