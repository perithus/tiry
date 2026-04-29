import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NotificationPreferencesPanel } from "@/components/dashboard/notification-preferences-panel";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import { getNotificationPreferences } from "@/lib/notifications/preferences";

export default async function AdminNotificationsPage() {
  const locale = await getLocale();
  const session = await requireRole("ADMIN");
  const [notifications, notificationPreferences] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    }),
    getNotificationPreferences(session.user.id)
  ]);

  return (
    <DashboardShell
      title={locale === "pl" ? "Panel administratora" : "Admin control"}
      nav={getAdminNav(locale)}
      heading={locale === "pl" ? "Powiadomienia" : "Notifications"}
      subheading={locale === "pl" ? "Monitoruj zapytania, oferty, bookingi i rozmowy wymagające uwagi operacyjnej." : "Monitor inquiries, offers, bookings, and conversations that need operational attention."}
      locale={locale}
    >
      <div className="space-y-6">
        <NotificationPreferencesPanel
          locale={locale}
          title={locale === "pl" ? "Preferencje powiadomien" : "Notification preferences"}
          description={
            locale === "pl"
              ? "Skonfiguruj, ktore alerty operacyjne i bezpieczenstwa maja trafiac do Twojego inboxu admina."
              : "Configure which operational and security alerts should reach your admin inbox."
          }
          preferences={notificationPreferences}
          redirectPath="/admin/notifications"
        />
        <NotificationCenter locale={locale} notifications={notifications} />
      </div>
    </DashboardShell>
  );
}
