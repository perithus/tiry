import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { ButtonLink } from "@/components/shared/button";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminAuditLogsPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 15;
  const [totalItems, logs] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.findMany({
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return (
    <DashboardShell
      title={t.dashboard.admin.title}
      nav={getAdminNav(locale)}
      heading={t.dashboard.admin.auditHeading}
      subheading={t.dashboard.admin.auditSubheading}
      locale={locale}
    >
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/api/admin/reports/audit" variant="primary">
          {locale === "pl" ? "Eksportuj CSV" : "Export CSV"}
        </ButtonLink>
        <ButtonLink href="/api/admin/reports/audit?format=json" variant="secondary">
          {locale === "pl" ? "Eksportuj JSON" : "Export JSON"}
        </ButtonLink>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="grid gap-3 p-4 md:hidden">
          {logs.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/80 p-4 text-sm text-ink-600">
              {locale === "pl" ? "Brak logow audytu." : "No audit logs found."}
            </div>
          ) : (
            logs.map((log) => (
              <article key={log.id} className="rounded-[1.5rem] border border-ink-100 bg-white/90 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="font-medium text-ink-900">{log.action}</h2>
                  <span className="text-xs uppercase tracking-[0.16em] text-ink-500">
                    {new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}
                  </span>
                </div>
                <dl className="mt-3 space-y-2 text-sm text-ink-600">
                  <div>
                    <dt className="font-medium text-ink-900">{t.dashboard.admin.auditActor}</dt>
                    <dd>{log.actor?.email ?? t.dashboard.admin.auditSystem}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-ink-900">{t.dashboard.admin.auditEntity}</dt>
                    <dd>{log.entityType}</dd>
                  </div>
                </dl>
              </article>
            ))
          )}
        </div>

        <table className="hidden min-w-full text-left text-sm md:table">
          <thead className="bg-ink-50 text-ink-600">
            <tr>
              <th className="px-6 py-4 font-medium">{t.dashboard.admin.auditAction}</th>
              <th className="px-6 py-4 font-medium">{t.dashboard.admin.auditActor}</th>
              <th className="px-6 py-4 font-medium">{t.dashboard.admin.auditEntity}</th>
              <th className="px-6 py-4 font-medium">{t.dashboard.admin.auditTime}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-ink-100">
                <td className="px-6 py-4">{log.action}</td>
                <td className="px-6 py-4">{log.actor?.email ?? t.dashboard.admin.auditSystem}</td>
                <td className="px-6 py-4">{log.entityType}</td>
                <td className="px-6 py-4">{new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", { dateStyle: "medium", timeStyle: "short" }).format(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <PaginationControls locale={locale} page={page} pageSize={pageSize} totalItems={totalItems} basePath="/admin/audit-logs" itemLabel={locale === "pl" ? "logow" : "logs"} />
      </div>
    </DashboardShell>
  );
}
