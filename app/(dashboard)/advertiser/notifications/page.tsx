import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";

export default async function AdvertiserNotificationsPage() {
  const locale = await getLocale();
  const session = await requireRole("ADVERTISER");
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={locale === "pl" ? "Panel reklamodawcy" : "Advertiser workspace"}
      nav={getAdvertiserNav(locale)}
      heading={locale === "pl" ? "Powiadomienia" : "Notifications"}
      subheading={locale === "pl" ? "Śledź nowe oferty, wiadomości, bookingi i zmiany w Twoich kampaniach." : "Track new offers, messages, bookings, and updates across your campaigns."}
      locale={locale}
    >
      <NotificationCenter locale={locale} notifications={notifications} />
    </DashboardShell>
  );
}
