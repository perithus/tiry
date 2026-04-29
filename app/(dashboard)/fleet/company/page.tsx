import { unstable_noStore as noStore } from "next/cache";
import { CompanyProfileForm } from "@/components/forms/company-profile-form";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

export default async function FleetCompanyPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const session = await requireRole("CARRIER_OWNER");
  const company = session.user.companyId
    ? await prisma.company.findUnique({ where: { id: session.user.companyId } })
    : null;

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.companyHeading}
      subheading={t.dashboard.fleet.companySubheading}
      locale={locale}
    >
      <CompanyProfileForm
        defaultValues={{
          legalName: company?.legalName ?? "",
          displayName: company?.displayName ?? "",
          description: company?.description ?? "",
          websiteUrl: company?.websiteUrl ?? "",
          email: company?.email ?? "",
          phone: company?.phone ?? "",
          vatNumber: company?.vatNumber ?? "",
          headquartersCity: company?.headquartersCity ?? "",
          headquartersCountry: company?.headquartersCountry ?? "",
          fleetSize: company?.fleetSize ?? 1
        }}
      />
    </DashboardShell>
  );
}
