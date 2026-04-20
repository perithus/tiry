import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function AdminAuditLogsPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  await requireRole("ADMIN");
  const logs = await prisma.auditLog.findMany({
    include: { actor: true },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <DashboardShell
      title={t.dashboard.admin.title}
      nav={getAdminNav(locale)}
      heading={t.dashboard.admin.auditHeading}
      subheading={t.dashboard.admin.auditSubheading}
      locale={locale}
    >
      <div className="glass-panel overflow-hidden">
        <table className="min-w-full text-left text-sm">
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
      </div>
    </DashboardShell>
  );
}
