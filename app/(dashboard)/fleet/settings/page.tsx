import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { addCompanyTeamMember } from "@/lib/actions/company";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Team and access control",
    subheading: "Manage your internal fleet team, delegated access, and invite-ready company workspace.",
    team: "Team members",
    invite: "Invite team member",
    name: "Full name",
    email: "Email",
    role: "Role",
    status: "Status",
    save: "Create invite",
    noTeam: "No additional team members yet."
  },
  pl: {
    title: "Panel floty",
    heading: "Zespół i kontrola dostępu",
    subheading: "Zarządzaj zespołem floty, delegowanym dostępem i firmowym workspace gotowym do zaproszeń.",
    team: "Członkowie zespołu",
    invite: "Zaproś członka zespołu",
    name: "Imię i nazwisko",
    email: "E-mail",
    role: "Rola",
    status: "Status",
    save: "Utwórz zaproszenie",
    noTeam: "Brak dodatkowych członków zespołu."
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE") return "success";
  if (status === "INVITED" || status === "PENDING_VERIFICATION") return "warning";
  if (status === "SUSPENDED") return "danger";
  return "neutral";
}

export default async function FleetSettingsPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("CARRIER_OWNER");

  const members = await prisma.user.findMany({
    where: {
      companyId: session.user.companyId ?? "missing-company"
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }]
  });

  return (
    <DashboardShell title={t.title} nav={getFleetNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.team}</h2>
          <div className="mt-5 space-y-4">
            {members.length === 0 ? (
              <p className="text-sm text-ink-600">{t.noTeam}</p>
            ) : (
              members.map((member) => (
                <article key={member.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-ink-900">{member.name}</h3>
                      <p className="mt-1 text-sm text-ink-600">{member.email}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge label={member.role} tone="neutral" />
                      <StatusBadge label={member.status} tone={getTone(member.status)} />
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.invite}</h2>
          <form action={addCompanyTeamMember} className="mt-5 grid gap-4">
            <Field label={t.name}>
              <input name="name" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.email}>
              <input name="email" type="email" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.role}>
              <select name="role" defaultValue="FLEET_MANAGER" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="FLEET_MANAGER">FLEET_MANAGER</option>
                <option value="CARRIER_OWNER">CARRIER_OWNER</option>
              </select>
            </Field>
            <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.save}</button>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
