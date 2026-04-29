import { DashboardShell } from "@/components/layout/dashboard-shell";
import { SecurityAuditLogTable } from "@/components/dashboard/security-audit-log-table";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { normalizeSecurityMetadata } from "@/lib/security/activity";

function getWhereClause(userId: string, filter: string) {
  if (filter === "sign_in") {
    return { actorId: userId, action: "SIGN_IN" as const };
  }

  if (filter === "sign_out") {
    return { actorId: userId, action: "SIGN_OUT" as const };
  }

  if (filter === "account") {
    return { actorId: userId, action: "USER_UPDATED" as const };
  }

  return {
    actorId: userId,
    OR: [{ action: "SIGN_IN" as const }, { action: "SIGN_OUT" as const }, { action: "USER_UPDATED" as const }]
  };
}

export default async function FleetSecurityPage({
  searchParams
}: {
  searchParams?: Promise<{ filter?: string; page?: string }>;
}) {
  const locale = await getLocale();
  const session = await requireRole("CARRIER_OWNER");
  const params = (await searchParams) ?? {};
  const filter = params.filter ?? "all";
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 12;

  const where = getWhereClause(session.user.id, filter);
  const [totalItems, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        action: true,
        entityType: true,
        ipAddress: true,
        createdAt: true,
        metadata: true
      }
    })
  ]);

  return (
    <DashboardShell
      title={locale === "pl" ? "Panel floty" : "Fleet workspace"}
      nav={getFleetNav(locale)}
      heading={locale === "pl" ? "Logi bezpieczenstwa" : "Security logs"}
      subheading={
        locale === "pl"
          ? "Monitoruj logowania, wylogowania i zmiany bezpieczenstwa dla konta ownera oraz sesji floty."
          : "Monitor sign-ins, sign-outs, and security changes for the fleet owner account and sessions."
      }
      locale={locale}
    >
      <SecurityAuditLogTable
        locale={locale}
        logs={logs.map((log) => ({ ...log, metadata: normalizeSecurityMetadata(log.metadata) }))}
        currentFilter={filter}
        basePath="/fleet/security"
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
      />
    </DashboardShell>
  );
}
