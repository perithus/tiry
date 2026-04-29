import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { StatusBadge } from "@/components/shared/status-badge";
import { getAdminNav } from "@/lib/data/navigation";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { updateUserAccess } from "@/lib/actions/admin";

const copy = {
  en: {
    title: "Admin control",
    heading: "User administration",
    subheading: "Manage account lifecycle, privileges, and company access without leaving the admin workspace.",
    name: "Name",
    email: "Email",
    company: "Company",
    role: "Role",
    status: "Status",
    save: "Save access",
    noCompany: "No company"
  },
  pl: {
    title: "Panel administratora",
    heading: "Administracja użytkownikami",
    subheading: "Zarządzaj cyklem życia konta, uprawnieniami i dostępem firmowym bez wychodzenia z panelu admina.",
    name: "Nazwa",
    email: "E-mail",
    company: "Firma",
    role: "Rola",
    status: "Status",
    save: "Zapisz dostęp",
    noCompany: "Brak firmy"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "PENDING_VERIFICATION" || status === "INVITED") return "warning";
  if (status === "SUSPENDED") return "danger";
  return "neutral";
}

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 12;
  const [totalItems, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      include: {
        company: true
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
  ]);

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="sticky top-20 z-10 rounded-[1.75rem] border border-white/70 bg-sand/90 px-4 py-3 shadow-sm backdrop-blur">
        <p className="text-sm text-ink-600">
          {locale === "pl" ? `Widocznych ${users.length} z ${totalItems} uzytkownikow.` : `Showing ${users.length} of ${totalItems} users.`}
        </p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="glass-panel p-6">
            <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-ink-900">{user.name}</h2>
                  <StatusBadge label={user.status} tone={getTone(user.status)} />
                </div>
                <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p><span className="font-medium text-ink-900">{t.email}:</span> {user.email}</p>
                  <p><span className="font-medium text-ink-900">{t.company}:</span> {user.company?.displayName ?? t.noCompany}</p>
                  <p><span className="font-medium text-ink-900">{t.role}:</span> {user.role}</p>
                  <p><span className="font-medium text-ink-900">{t.status}:</span> {user.status}</p>
                </div>
              </div>
              <form action={updateUserAccess} className="grid gap-3 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <input type="hidden" name="userId" value={user.id} />
                <label className="text-sm font-medium text-ink-700">
                  {t.role}
                  <select name="role" defaultValue={user.role} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="ADVERTISER">ADVERTISER</option>
                    <option value="CARRIER_OWNER">CARRIER_OWNER</option>
                    <option value="FLEET_MANAGER">FLEET_MANAGER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-ink-700">
                  {t.status}
                  <select name="status" defaultValue={user.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                    <option value="INVITED">INVITED</option>
                  </select>
                </label>
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
              </form>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-panel overflow-hidden">
        <PaginationControls locale={locale} page={page} pageSize={pageSize} totalItems={totalItems} basePath="/admin/users" itemLabel={locale === "pl" ? "uzytkownikow" : "users"} />
      </div>
    </DashboardShell>
  );
}
