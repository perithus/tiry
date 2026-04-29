import type { MetadataRoute } from "next";
import { ListingStatus, VerificationStatus } from "@prisma/client";
import { env } from "@/lib/config/env";
import { prisma } from "@/lib/db/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/how-it-works",
    "/advertisers",
    "/transport-companies",
    "/marketplace",
    "/faq",
    "/contact",
    "/privacy-policy",
    "/terms"
  ];

  const listings = await prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED
    },
    select: {
      slug: true,
      updatedAt: true
    }
  });

  return [
    ...staticRoutes.map((path) => ({
      url: `${env.APP_URL}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7
    })),
    ...listings.map((listing) => ({
      url: `${env.APP_URL}/marketplace/${listing.slug}`,
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
