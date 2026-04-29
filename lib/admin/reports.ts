import { prisma } from "@/lib/db/prisma";

export type AdminReportRange = 7 | 30 | 90;
export type DataExportEntity = "campaigns" | "inquiries" | "bookings" | "listings" | "companies" | "users";

export function parseAdminReportRange(value?: string | null): AdminReportRange {
  if (value === "30") return 30;
  if (value === "90") return 90;
  return 7;
}

export function getRangeStart(range: AdminReportRange) {
  return new Date(Date.now() - range * 24 * 60 * 60 * 1000);
}

export function parseDataExportEntity(value?: string | null): DataExportEntity {
  switch (value) {
    case "campaigns":
    case "inquiries":
    case "bookings":
    case "listings":
    case "companies":
    case "users":
      return value;
    default:
      return "campaigns";
  }
}

export function csvEscape(value: unknown) {
  const stringValue = value == null ? "" : String(value);
  return `"${stringValue.replaceAll('"', '""')}"`;
}

export function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.map(csvEscape).join(",")];

  for (const row of rows) {
    lines.push(headers.map((header) => csvEscape(row[header])).join(","));
  }

  return lines.join("\n");
}

export async function getAuditExportRows(scope: "all" | "security", range: AdminReportRange) {
  const where =
    scope === "security"
      ? {
          createdAt: { gte: getRangeStart(range) },
          OR: [{ action: "SIGN_IN" as const }, { action: "SIGN_OUT" as const }, { action: "USER_UPDATED" as const }]
        }
      : {
          createdAt: { gte: getRangeStart(range) }
        };

  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      actor: {
        select: {
          email: true,
          role: true
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 2000
  });

  return logs.map((log) => ({
    id: log.id,
    createdAt: log.createdAt.toISOString(),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId ?? "",
    actorEmail: log.actor?.email ?? "SYSTEM",
    actorRole: log.actor?.role ?? "",
    ipAddress: log.ipAddress ?? "",
    metadata: log.metadata ? JSON.stringify(log.metadata) : ""
  }));
}

export async function getAdminReportSnapshot(range: AdminReportRange) {
  const start = getRangeStart(range);

  const [auditEvents, securityIncidents, newCompanies, newListings, newInquiries, newCampaigns, activeCampaigns, suspendedUsers] = await Promise.all([
    prisma.auditLog.count({ where: { createdAt: { gte: start } } }),
    prisma.auditLog.count({
      where: {
        createdAt: { gte: start },
        OR: [
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_device_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_network_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "new_user_agent_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "session_burst_sign_in" } },
          { action: "SIGN_IN", metadata: { path: ["kind"], equals: "rapid_ip_rotation_sign_in" } },
          { action: "SIGN_OUT", metadata: { path: ["kind"], string_contains: "revoke" } }
        ]
      }
    }),
    prisma.company.count({ where: { createdAt: { gte: start } } }),
    prisma.listing.count({ where: { createdAt: { gte: start } } }),
    prisma.campaignInquiry.count({ where: { createdAt: { gte: start } } }),
    prisma.campaign.count({ where: { createdAt: { gte: start } } }),
    prisma.campaign.count({ where: { status: { in: ["PLANNING", "NEGOTIATION", "READY_TO_BOOK", "ACTIVE"] } } }),
    prisma.user.count({ where: { status: "SUSPENDED" } })
  ]);

  return {
    range,
    generatedAt: new Date().toISOString(),
    auditEvents,
    securityIncidents,
    newCompanies,
    newListings,
    newInquiries,
    newCampaigns,
    activeCampaigns,
    suspendedUsers
  };
}

export function getAdminReportSummaryRows(snapshot: Awaited<ReturnType<typeof getAdminReportSnapshot>>) {
  return [
    { metric: "range_days", value: snapshot.range },
    { metric: "generated_at", value: snapshot.generatedAt },
    { metric: "audit_events", value: snapshot.auditEvents },
    { metric: "security_incidents", value: snapshot.securityIncidents },
    { metric: "new_companies", value: snapshot.newCompanies },
    { metric: "new_listings", value: snapshot.newListings },
    { metric: "new_inquiries", value: snapshot.newInquiries },
    { metric: "new_campaigns", value: snapshot.newCampaigns },
    { metric: "active_campaigns", value: snapshot.activeCampaigns },
    { metric: "suspended_users", value: snapshot.suspendedUsers }
  ];
}

export async function getDataExportRows(entity: DataExportEntity, range: AdminReportRange) {
  const start = getRangeStart(range);

  switch (entity) {
    case "campaigns": {
      const rows = await prisma.campaign.findMany({
        where: { createdAt: { gte: start } },
        include: {
          advertiser: { select: { email: true, name: true } },
          company: { select: { displayName: true } },
          owner: { select: { email: true, name: true } },
          primaryListing: { select: { title: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        priority: row.priority,
        source: row.source,
        advertiserName: row.advertiser.name,
        advertiserEmail: row.advertiser.email,
        company: row.company?.displayName ?? "",
        owner: row.owner?.name ?? "",
        ownerEmail: row.owner?.email ?? "",
        primaryListing: row.primaryListing?.title ?? "",
        budgetCents: row.budgetCents ?? "",
        currency: row.currency,
        plannedStartDate: row.plannedStartDate?.toISOString() ?? "",
        plannedEndDate: row.plannedEndDate?.toISOString() ?? "",
        bookedStartDate: row.bookedStartDate?.toISOString() ?? "",
        bookedEndDate: row.bookedEndDate?.toISOString() ?? "",
        createdAt: row.createdAt.toISOString()
      }));
    }

    case "inquiries": {
      const rows = await prisma.campaignInquiry.findMany({
        where: { createdAt: { gte: start } },
        include: {
          advertiser: { select: { email: true, name: true } },
          listing: { include: { company: { select: { displayName: true } } } }
        },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        campaignName: row.campaignName,
        status: row.status,
        advertiserName: row.advertiser.name,
        advertiserEmail: row.advertiser.email,
        listing: row.listing.title,
        company: row.listing.company.displayName,
        budgetMinCents: row.budgetMinCents ?? "",
        budgetMaxCents: row.budgetMaxCents ?? "",
        desiredStartDate: row.desiredStartDate?.toISOString() ?? "",
        desiredEndDate: row.desiredEndDate?.toISOString() ?? "",
        targetCountries: row.targetCountries.join(" | "),
        createdAt: row.createdAt.toISOString()
      }));
    }

    case "bookings": {
      const rows = await prisma.booking.findMany({
        where: { createdAt: { gte: start } },
        include: {
          inquiry: {
            include: {
              advertiser: { select: { email: true, name: true } }
            }
          },
          listing: {
            include: {
              company: { select: { displayName: true } }
            }
          },
          offer: { select: { title: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        status: row.status,
        advertiserName: row.inquiry.advertiser.name,
        advertiserEmail: row.inquiry.advertiser.email,
        listing: row.listing.title,
        company: row.listing.company.displayName,
        offerTitle: row.offer?.title ?? "",
        bookedFrom: row.bookedFrom.toISOString(),
        bookedTo: row.bookedTo.toISOString(),
        totalPriceCents: row.totalPriceCents,
        currency: row.currency,
        createdAt: row.createdAt.toISOString()
      }));
    }

    case "listings": {
      const rows = await prisma.listing.findMany({
        where: { createdAt: { gte: start } },
        include: {
          company: { select: { displayName: true } },
          vehicle: { select: { name: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        company: row.company.displayName,
        vehicle: row.vehicle?.name ?? "",
        status: row.status,
        verificationStatus: row.verificationStatus,
        baseCity: row.baseCity,
        baseCountry: row.baseCountry,
        routeScope: row.routeScope,
        pricingModel: row.pricingModel,
        priceFromCents: row.priceFromCents ?? "",
        currency: row.currency,
        availableFrom: row.availableFrom?.toISOString() ?? "",
        availableTo: row.availableTo?.toISOString() ?? "",
        createdAt: row.createdAt.toISOString()
      }));
    }

    case "companies": {
      const rows = await prisma.company.findMany({
        where: { createdAt: { gte: start } },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        displayName: row.displayName,
        legalName: row.legalName,
        status: row.status,
        verificationStatus: row.verificationStatus,
        email: row.email ?? "",
        phone: row.phone ?? "",
        headquartersCity: row.headquartersCity ?? "",
        headquartersCountry: row.headquartersCountry ?? "",
        vatNumber: row.vatNumber ?? "",
        fleetSize: row.fleetSize,
        createdAt: row.createdAt.toISOString()
      }));
    }

    case "users": {
      const rows = await prisma.user.findMany({
        where: { createdAt: { gte: start } },
        include: {
          company: { select: { displayName: true } }
        },
        orderBy: { createdAt: "desc" },
        take: 2000
      });

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        status: row.status,
        phone: row.phone ?? "",
        company: row.company?.displayName ?? "",
        emailVerifiedAt: row.emailVerifiedAt?.toISOString() ?? "",
        onboardingCompletedAt: row.onboardingCompletedAt?.toISOString() ?? "",
        createdAt: row.createdAt.toISOString()
      }));
    }
  }
}
