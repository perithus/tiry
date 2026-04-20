import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function AdvertiserMessagesPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  await requireRole("ADVERTISER");

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.messagesHeading}
      subheading={t.dashboard.advertiser.messagesSubheading}
      locale={locale}
    >
      <div className="glass-panel p-8 text-sm text-ink-600">{t.dashboard.advertiser.messagesPlaceholder}</div>
    </DashboardShell>
  );
}
