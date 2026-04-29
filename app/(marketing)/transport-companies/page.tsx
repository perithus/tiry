import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return buildPageMetadata({
    locale,
    title: locale === "pl" ? "Dla firm transportowych: monetyzacja floty" : "For Transport Companies: Monetize Fleet Advertising Space",
    description:
      locale === "pl"
        ? "Buduj ofertę reklamy na ciężarówkach i naczepach, zarządzaj zapytaniami oraz bookingami i monetyzuj widoczność swojej floty."
        : "Build truck and trailer advertising listings, manage inquiries and bookings, and monetize your fleet's visibility.",
    path: "/transport-companies",
    keywords: ["monetize fleet advertising", "truck advertising for carriers", "trailer advertising revenue"]
  });
}

export default async function TransportCompaniesPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const seoBody =
    locale === "pl"
      ? "Ta strona jest przygotowana pod firmy transportowe, które chcą zamienić ciężarówki i naczepy w profesjonalnie sprzedawane inventory reklamowe. TIY porządkuje listingi, zapytania, oferty i dostępność, dzięki czemu sprzedaż reklamy flotowej nie opiera się na chaosie w arkuszach i mailach."
      : "This page targets transport companies that want to turn trucks and trailers into professionally sold advertising inventory. TIY organizes listings, inquiries, offers, and availability so fleet advertising sales are not managed through scattered spreadsheets and email threads.";

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.carriers.eyebrow}
        title={t.marketing.carriers.title}
        description={t.marketing.carriers.description}
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6 text-sm leading-7 text-ink-600">{seoBody}</div>
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            {locale === "pl" ? "Zobacz, jak działa workflow" : "See the workflow in action"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            {locale === "pl"
              ? "Jeśli chcesz zobaczyć cały proces od weryfikacji firmy po kampanię i booking, przejdź do sekcji Jak to działa."
              : "If you want to understand the full flow from company verification to booking and campaign delivery, visit the How it works page."}
          </p>
          <Link href="/how-it-works" className="mt-5 inline-flex rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
            {locale === "pl" ? "Zobacz workflow" : "See workflow"}
          </Link>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {t.marketing.carriers.features.map(([title, body]) => (
          <FeatureCard key={title} title={title} body={body} />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="glass-panel p-6">
      <h3 className="font-display text-xl font-semibold tracking-tight text-ink-900">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-600">{body}</p>
    </div>
  );
}
