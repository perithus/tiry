import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetAvailabilityPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  await requireRole("CARRIER_OWNER");

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.availabilityHeading}
      subheading={t.dashboard.fleet.availabilitySubheading}
      locale={locale}
    >
      <div className="glass-panel p-8 text-sm text-ink-600">{t.dashboard.fleet.availabilityPlaceholder}</div>
    </DashboardShell>
  );
}
