import { unstable_cache } from "next/cache";
import { ListingStatus, VerificationStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

type MarketplaceFilters = {
  country?: string;
  routeScope?: "DOMESTIC" | "INTERNATIONAL" | "MIXED";
  pricingModel?: "FIXED_MONTHLY" | "CPM_ESTIMATE" | "ROUTE_PACKAGE" | "CUSTOM_QUOTE";
  search?: string;
};

const getCachedFeaturedListings = unstable_cache(
  async () =>
    prisma.listing.findMany({
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
    }),
  ["featured-listings"],
  { revalidate: 300, tags: ["listings", "featured-listings"] }
);

const getCachedMarketplaceListings = unstable_cache(
  async (filters?: MarketplaceFilters) =>
    prisma.listing.findMany({
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
    }),
  ["marketplace-listings"],
  { revalidate: 300, tags: ["listings", "marketplace-listings"] }
);

const getCachedListingBySlug = unstable_cache(
  async (slug: string) =>
    prisma.listing.findUnique({
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
    }),
  ["listing-by-slug"],
  { revalidate: 300, tags: ["listings"] }
);

export async function getFeaturedListings() {
  return getCachedFeaturedListings();
}

export async function getMarketplaceListings(filters?: MarketplaceFilters) {
  return getCachedMarketplaceListings(filters);
}

export async function getListingBySlug(slug: string) {
  return getCachedListingBySlug(slug);
}
