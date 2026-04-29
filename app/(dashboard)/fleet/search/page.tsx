import { unstable_noStore as noStore } from "next/cache";
import { GlobalSearchPanel } from "@/components/dashboard/global-search-panel";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { getGlobalSearchResults } from "@/lib/search/global";

export default async function FleetSearchPage({
  searchParams
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("FLEET_MANAGER");
  const params = (await searchParams) ?? {};
  const query = params.q ?? "";
  const sections = await getGlobalSearchResults(session.user, query, locale);

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={locale === "pl" ? "Global search" : "Global search"}
      subheading={
        locale === "pl"
          ? "Szukaj pojazdow, ofert, zapytan, kampanii i czlonkow zespolu w panelu floty."
          : "Search vehicles, listings, inquiries, campaigns, and team members in the fleet workspace."
      }
      locale={locale}
    >
      <GlobalSearchPanel locale={locale} query={query} sections={sections} />
    </DashboardShell>
  );
}
