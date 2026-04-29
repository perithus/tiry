import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import {
  addCompanyTeamMember,
  changeFleetOwnerPassword,
  saveFleetOwnerProfile,
  updateCompanyTeamMemberAccess
} from "@/lib/actions/company";
import { revokeOtherSessions, revokeSession } from "@/lib/actions/security";
import { NotificationPreferencesPanel } from "@/components/dashboard/notification-preferences-panel";
import { SecurityActivityList } from "@/components/dashboard/security-activity-list";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { getNotificationPreferences } from "@/lib/notifications/preferences";
import { normalizeSecurityMetadata } from "@/lib/security/activity";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Team and access control",
    subheading: "Manage your internal fleet team, owner account data, and delegated access from one settings workspace.",
    team: "Team members",
    invite: "Invite team member",
    account: "Owner account",
    password: "Password",
    security: "Security center",
    securityBody: "Review active sessions, recognize devices, and revoke access from other browsers.",
    currentSession: "Current session",
    activeSession: "Active session",
    unknownDevice: "Unknown device",
    lastActive: "Last active",
    createdAt: "Created",
    signOutOthers: "Sign out other sessions",
    revokeSession: "Revoke session",
    signOut: "Sign out",
    recentSecurity: "Recent security activity",
    recentSecurityBody: "Track sign-ins, sign-outs, and important account access changes in one place.",
    viewSecurityLogs: "View full security logs",
    name: "Full name",
    email: "Email",
    phone: "Phone",
    avatarUrl: "Avatar URL",
    role: "Role",
    status: "Status",
    access: "Access controls",
    currentPassword: "Current password",
    newPassword: "New password",
    confirmPassword: "Confirm new password",
    save: "Create invite",
    saveAccess: "Save access",
    saveProfile: "Save profile",
    savePassword: "Update password",
    noTeam: "No additional team members yet.",
    selfManaged: "Your owner account is managed in the profile forms on this page."
  },
  pl: {
    title: "Panel floty",
    heading: "Zespol i kontrola dostepu",
    subheading: "Zarzadzaj zespolem floty, danymi konta ownera i delegowanym dostepem z jednego panelu ustawien.",
    team: "Czlonkowie zespolu",
    invite: "Zapros czlonka zespolu",
    account: "Konto ownera",
    password: "Haslo",
    security: "Centrum bezpieczenstwa",
    securityBody: "Sprawdz aktywne sesje, rozpoznaj urzadzenia i zamknij dostep z innych przegladarek.",
    currentSession: "Biezaca sesja",
    activeSession: "Aktywna sesja",
    unknownDevice: "Nieznane urzadzenie",
    lastActive: "Ostatnia aktywnosc",
    createdAt: "Utworzono",
    signOutOthers: "Wyloguj pozostale sesje",
    revokeSession: "Zamknij sesje",
    signOut: "Wyloguj",
    recentSecurity: "Ostatnia aktywnosc bezpieczenstwa",
    recentSecurityBody: "Sledz logowania, wylogowania i najwazniejsze zmiany zwiazane z dostepem do konta.",
    viewSecurityLogs: "Zobacz pelne logi bezpieczenstwa",
    name: "Imie i nazwisko",
    email: "E-mail",
    phone: "Telefon",
    avatarUrl: "URL avatara",
    role: "Rola",
    status: "Status",
    access: "Kontrola dostepu",
    currentPassword: "Obecne haslo",
    newPassword: "Nowe haslo",
    confirmPassword: "Powtorz nowe haslo",
    save: "Utworz zaproszenie",
    saveAccess: "Zapisz dostep",
    saveProfile: "Zapisz profil",
    savePassword: "Zmien haslo",
    noTeam: "Brak dodatkowych czlonkow zespolu.",
    selfManaged: "Twoje konto ownera jest zarzadzane w formularzach profilu na tej stronie."
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

  const [members, owner, sessions, securityActivity, notificationPreferences] = await Promise.all([
    prisma.user.findMany({
      where: {
        companyId: session.user.companyId ?? "missing-company"
      },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }]
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true, avatarUrl: true }
    }),
    prisma.session.findMany({
      where: { userId: session.user.id },
      orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastSeenAt: true
      }
    }),
    prisma.auditLog.findMany({
      where: {
        actorId: session.user.id,
        OR: [
          { action: "SIGN_IN" },
          { action: "SIGN_OUT" },
          { action: "USER_UPDATED", metadata: { path: ["kind"], equals: "password_change" } },
          { action: "USER_UPDATED", metadata: { path: ["kind"], equals: "fleet_owner_profile" } }
        ]
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        action: true,
        entityType: true,
        ipAddress: true,
        createdAt: true,
        metadata: true
      }
    }),
    getNotificationPreferences(session.user.id)
  ]);

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
                      {member.id === session.user.id ? <StatusBadge label="YOU" tone="success" /> : null}
                    </div>
                  </div>

                  {member.id !== session.user.id ? (
                    <form action={updateCompanyTeamMemberAccess} className="mt-4 grid gap-3 rounded-[1.25rem] border border-ink-100 bg-white p-4 md:grid-cols-3">
                      <input type="hidden" name="memberId" value={member.id} />
                      <Field label={t.role}>
                        <select name="role" defaultValue={member.role} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                          <option value="FLEET_MANAGER">FLEET_MANAGER</option>
                          <option value="CARRIER_OWNER">CARRIER_OWNER</option>
                        </select>
                      </Field>
                      <Field label={t.status}>
                        <select name="status" defaultValue={member.status} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                          <option value="INVITED">INVITED</option>
                          <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                      </Field>
                      <div className="flex items-end">
                        <button className="w-full rounded-2xl bg-ink-900 px-4 py-3 text-sm font-medium text-white hover:bg-ink-800">{t.saveAccess}</button>
                      </div>
                    </form>
                  ) : (
                    <div className="mt-4 rounded-[1.25rem] border border-ink-100 bg-white p-4 text-sm text-ink-600">
                      {t.access}: {t.selfManaged}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.account}</h2>
            <form action={saveFleetOwnerProfile} className="mt-5 grid gap-4">
              <Field label={t.name}>
                <input name="name" defaultValue={owner?.name ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.email}>
                <input name="email" type="email" defaultValue={owner?.email ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.phone}>
                <input name="phone" defaultValue={owner?.phone ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.avatarUrl}>
                <input name="avatarUrl" defaultValue={owner?.avatarUrl ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveProfile}</button>
            </form>
          </div>

          <SecurityActivityList
            locale={locale}
            title={t.recentSecurity}
            description={t.recentSecurityBody}
            activities={securityActivity.map((entry) => ({
              ...entry,
              metadata: normalizeSecurityMetadata(entry.metadata)
            }))}
          />
          <div className="flex justify-end">
            <Link
              href="/fleet/security"
              className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
            >
              {t.viewSecurityLogs}
            </Link>
          </div>
          <NotificationPreferencesPanel
            locale={locale}
            title={locale === "pl" ? "Preferencje powiadomien" : "Notification preferences"}
            description={
              locale === "pl"
                ? "Ustaw, ktore alerty operacyjne i bezpieczenstwa maja trafiac do Twojego centrum powiadomien."
                : "Choose which operational and security alerts should reach your notification center."
            }
            preferences={notificationPreferences}
            redirectPath="/fleet/settings"
          />

          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.password}</h2>
            <form action={changeFleetOwnerPassword} className="mt-5 grid gap-4">
              <Field label={t.currentPassword}>
                <input name="currentPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.newPassword}>
                <input name="newPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.confirmPassword}>
                <input name="confirmPassword" type="password" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.savePassword}</button>
            </form>
          </div>

          <div className="glass-panel p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink-900">{t.security}</h2>
                <p className="mt-2 text-sm text-ink-600">{t.securityBody}</p>
              </div>
              <form action={revokeOtherSessions}>
                <button className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                  {t.signOutOthers}
                </button>
              </form>
            </div>

            <div className="mt-5 space-y-3">
              {sessions.map((activeSession) => (
                <article key={activeSession.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {activeSession.id === session.sessionId ? t.currentSession : t.activeSession}
                      </p>
                      <p className="mt-2 text-sm text-ink-600">{activeSession.userAgent ?? t.unknownDevice}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">{activeSession.ipAddress ?? "unknown"}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {t.lastActive}: {activeSession.lastSeenAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {t.createdAt}: {activeSession.createdAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}
                      </p>
                    </div>
                    <form action={revokeSession}>
                      <input type="hidden" name="sessionId" value={activeSession.id} />
                      <button className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                        {activeSession.id === session.sessionId ? t.signOut : t.revokeSession}
                      </button>
                    </form>
                  </div>
                </article>
              ))}
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
