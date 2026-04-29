import { DashboardShell } from "@/components/layout/dashboard-shell";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetNotificationsPage() {
  const locale = await getLocale();
  const session = await requireRole("CARRIER_OWNER");
  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={locale === "pl" ? "Panel floty" : "Fleet workspace"}
      nav={getFleetNav(locale)}
      heading={locale === "pl" ? "Powiadomienia" : "Notifications"}
      subheading={locale === "pl" ? "Śledź nowe zapytania, wiadomości, bookingi i sygnały operacyjne dotyczące Twojej floty." : "Track new inquiries, messages, bookings, and operational signals across your fleet."}
      locale={locale}
    >
      <NotificationCenter locale={locale} notifications={notifications} />
    </DashboardShell>
  );
}
