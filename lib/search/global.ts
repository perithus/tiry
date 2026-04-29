import type { SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export type SearchResultItem = {
  id: string;
  title: string;
  subtitle: string;
  meta?: string;
  status?: string;
  href: string;
};

export type SearchResultSection = {
  key: string;
  title: string;
  items: SearchResultItem[];
};

function containsQuery(query: string) {
  return { contains: query, mode: "insensitive" as const };
}

export async function getGlobalSearchResults(user: SessionUser, query: string, locale: "en" | "pl") {
  const normalized = query.trim();
  if (normalized.length < 2) {
    return [] as SearchResultSection[];
  }

  if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
    const [users, companies, listings, inquiries, campaigns] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [{ name: containsQuery(normalized) }, { email: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { company: true }
      }),
      prisma.company.findMany({
        where: {
          OR: [{ displayName: containsQuery(normalized) }, { legalName: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" }
      }),
      prisma.listing.findMany({
        where: {
          OR: [{ title: containsQuery(normalized) }, { baseCity: containsQuery(normalized) }, { slug: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { company: true }
      }),
      prisma.campaignInquiry.findMany({
        where: {
          OR: [{ campaignName: containsQuery(normalized) }, { message: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { advertiser: true, listing: { include: { company: true } } }
      }),
      prisma.campaign.findMany({
        where: {
          OR: [{ name: containsQuery(normalized) }, { brief: containsQuery(normalized) }, { internalSummary: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { advertiser: true, company: true }
      })
    ]);

    return [
      {
        key: "users",
        title: locale === "pl" ? "Uzytkownicy" : "Users",
        items: users.map((entry) => ({
          id: entry.id,
          title: entry.name,
          subtitle: entry.email,
          meta: entry.company?.displayName ?? (locale === "pl" ? "Brak firmy" : "No company"),
          status: entry.status,
          href: "/admin/users"
        }))
      },
      {
        key: "companies",
        title: locale === "pl" ? "Firmy" : "Companies",
        items: companies.map((entry) => ({
          id: entry.id,
          title: entry.displayName,
          subtitle: entry.legalName,
          meta: [entry.headquartersCity, entry.headquartersCountry].filter(Boolean).join(", "),
          status: entry.verificationStatus,
          href: "/admin/verifications"
        }))
      },
      {
        key: "listings",
        title: locale === "pl" ? "Oferty" : "Listings",
        items: listings.map((entry) => ({
          id: entry.id,
          title: entry.title,
          subtitle: entry.company.displayName,
          meta: [entry.baseCity, entry.baseCountry].filter(Boolean).join(", "),
          status: entry.status,
          href: "/admin/listings"
        }))
      },
      {
        key: "inquiries",
        title: locale === "pl" ? "Zapytania" : "Inquiries",
        items: inquiries.map((entry) => ({
          id: entry.id,
          title: entry.campaignName,
          subtitle: `${entry.advertiser.name} / ${entry.listing.company.displayName}`,
          meta: entry.listing.title,
          status: entry.status,
          href: "/admin/inquiries"
        }))
      },
      {
        key: "campaigns",
        title: locale === "pl" ? "Kampanie" : "Campaigns",
        items: campaigns.map((entry) => ({
          id: entry.id,
          title: entry.name,
          subtitle: `${entry.advertiser.name} / ${entry.company?.displayName ?? (locale === "pl" ? "Brak floty" : "No fleet")}`,
          meta: entry.internalSummary ?? entry.brief ?? "",
          status: entry.status,
          href: `/admin/campaigns/${entry.id}`
        }))
      }
    ].filter((section) => section.items.length > 0);
  }

  if (user.role === "ADVERTISER") {
    const [listings, inquiries, campaigns] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: "ACTIVE",
          verificationStatus: "VERIFIED",
          OR: [{ title: containsQuery(normalized) }, { baseCity: containsQuery(normalized) }, { slug: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { company: true }
      }),
      prisma.campaignInquiry.findMany({
        where: {
          advertiserId: user.id,
          OR: [{ campaignName: containsQuery(normalized) }, { message: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { listing: { include: { company: true } } }
      }),
      prisma.campaign.findMany({
        where: {
          advertiserId: user.id,
          OR: [{ name: containsQuery(normalized) }, { brief: containsQuery(normalized) }, { internalSummary: containsQuery(normalized) }]
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { company: true }
      })
    ]);

    return [
      {
        key: "listings",
        title: locale === "pl" ? "Oferty" : "Listings",
        items: listings.map((entry) => ({
          id: entry.id,
          title: entry.title,
          subtitle: entry.company.displayName,
          meta: [entry.baseCity, entry.baseCountry].filter(Boolean).join(", "),
          status: entry.status,
          href: "/marketplace"
        }))
      },
      {
        key: "inquiries",
        title: locale === "pl" ? "Zapytania" : "Inquiries",
        items: inquiries.map((entry) => ({
          id: entry.id,
          title: entry.campaignName,
          subtitle: entry.listing.company.displayName,
          meta: entry.listing.title,
          status: entry.status,
          href: "/advertiser/inquiries"
        }))
      },
      {
        key: "campaigns",
        title: locale === "pl" ? "Kampanie" : "Campaigns",
        items: campaigns.map((entry) => ({
          id: entry.id,
          title: entry.name,
          subtitle: entry.company?.displayName ?? (locale === "pl" ? "Brak floty" : "No fleet"),
          meta: entry.internalSummary ?? entry.brief ?? "",
          status: entry.status,
          href: `/advertiser/campaigns/${entry.id}`
        }))
      }
    ].filter((section) => section.items.length > 0);
  }

  const [vehicles, listings, inquiries, campaigns, teammates] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        companyId: user.companyId ?? "missing-company",
        OR: [{ name: containsQuery(normalized) }, { registrationCountry: containsQuery(normalized) }]
      },
      take: 5,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.listing.findMany({
      where: {
        companyId: user.companyId ?? "missing-company",
        OR: [{ title: containsQuery(normalized) }, { baseCity: containsQuery(normalized) }, { slug: containsQuery(normalized) }]
      },
      take: 5,
      orderBy: { updatedAt: "desc" }
    }),
    prisma.campaignInquiry.findMany({
      where: {
        listing: { companyId: user.companyId ?? "missing-company" },
        OR: [{ campaignName: containsQuery(normalized) }, { message: containsQuery(normalized) }]
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { advertiser: true, listing: true }
    }),
    prisma.campaign.findMany({
      where: {
        companyId: user.companyId ?? "missing-company",
        OR: [{ name: containsQuery(normalized) }, { brief: containsQuery(normalized) }, { internalSummary: containsQuery(normalized) }]
      },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { advertiser: true }
    }),
    prisma.user.findMany({
      where: {
        companyId: user.companyId ?? "missing-company",
        OR: [{ name: containsQuery(normalized) }, { email: containsQuery(normalized) }]
      },
      take: 5,
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return [
    {
      key: "vehicles",
      title: locale === "pl" ? "Pojazdy" : "Vehicles",
      items: vehicles.map((entry) => ({
        id: entry.id,
        title: entry.name,
        subtitle: entry.registrationCountry,
        meta: entry.vehicleType,
        status: entry.active ? "ACTIVE" : "INACTIVE",
        href: "/fleet/vehicles"
      }))
    },
    {
      key: "listings",
      title: locale === "pl" ? "Oferty" : "Listings",
      items: listings.map((entry) => ({
        id: entry.id,
        title: entry.title,
        subtitle: [entry.baseCity, entry.baseCountry].filter(Boolean).join(", "),
        meta: entry.routeScope,
        status: entry.status,
        href: "/fleet/listings"
      }))
    },
    {
      key: "inquiries",
      title: locale === "pl" ? "Zapytania" : "Inquiries",
      items: inquiries.map((entry) => ({
        id: entry.id,
        title: entry.campaignName,
        subtitle: entry.advertiser.name,
        meta: entry.listing.title,
        status: entry.status,
        href: "/fleet/inquiries"
      }))
    },
    {
      key: "campaigns",
      title: locale === "pl" ? "Kampanie" : "Campaigns",
      items: campaigns.map((entry) => ({
        id: entry.id,
        title: entry.name,
        subtitle: entry.advertiser.name,
        meta: entry.internalSummary ?? entry.brief ?? "",
        status: entry.status,
        href: `/fleet/campaigns/${entry.id}`
      }))
    },
    {
      key: "team",
      title: locale === "pl" ? "Zespol" : "Team",
      items: teammates.map((entry) => ({
        id: entry.id,
        title: entry.name,
        subtitle: entry.email,
        meta: entry.role,
        status: entry.status,
        href: "/fleet/settings"
      }))
    }
  ].filter((section) => section.items.length > 0);
}
