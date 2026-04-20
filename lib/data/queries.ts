import { unstable_noStore as noStore } from "next/cache";
import { ListingStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function getFeaturedListings() {
  noStore();
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED
    },
    include: {
      company: true,
      images: {
        take: 1,
        orderBy: {
          sortOrder: "asc"
        }
      }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: 6
  });
}

export async function getMarketplaceListings(filters?: {
  country?: string;
  routeScope?: "DOMESTIC" | "INTERNATIONAL" | "MIXED";
  pricingModel?: "FIXED_MONTHLY" | "CPM_ESTIMATE" | "ROUTE_PACKAGE" | "CUSTOM_QUOTE";
  search?: string;
}) {
  noStore();
  return prisma.listing.findMany({
    where: {
      status: ListingStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      ...(filters?.country ? { baseCountry: filters.country } : {}),
      ...(filters?.routeScope ? { routeScope: filters.routeScope } : {}),
      ...(filters?.pricingModel ? { pricingModel: filters.pricingModel } : {}),
      ...(filters?.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { company: { displayName: { contains: filters.search, mode: "insensitive" } } }
            ]
          }
        : {})
    },
    include: {
      company: true,
      images: {
        orderBy: { sortOrder: "asc" }
      }
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });
}

export async function getListingBySlug(slug: string) {
  noStore();
  return prisma.listing.findUnique({
    where: { slug },
    include: {
      company: true,
      images: {
        orderBy: { sortOrder: "asc" }
      },
      routeCoverage: true,
      inquiries: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });
}
