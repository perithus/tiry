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
    title: locale === "pl" ? "Dla reklamodawców: reklama na ciężarówkach" : "For Advertisers: Truck Advertising Campaign Planning",
    description:
      locale === "pl"
        ? "Planuj kampanie reklamy na ciężarówkach i naczepach z wykorzystaniem zweryfikowanego inventory, danych o trasach i workflow ofertowego."
        : "Plan truck and trailer advertising campaigns with verified inventory, route data, and a structured offer workflow.",
    path: "/advertisers",
    keywords: ["truck advertising for brands", "fleet advertising for advertisers", "mobile outdoor campaign planning"]
  });
}

export default async function AdvertisersPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const seoBody =
    locale === "pl"
      ? "Strona dla reklamodawców odpowiada na potrzeby zespołów marketingowych, które szukają przewidywalnego sposobu zakupu reklamy na ciężarówkach. Zamiast ręcznie szukać przewoźników, możesz porównać inventory, ocenić coverage i prowadzić kampanię od briefu do bookingu."
      : "This page serves advertisers looking for a reliable way to buy truck advertising. Instead of manually sourcing carriers, teams can compare inventory, assess route coverage, and move from brief to booking in one workflow.";

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.advertisers.eyebrow}
        title={t.marketing.advertisers.title}
        description={t.marketing.advertisers.description}
      />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6 text-sm leading-7 text-ink-600">{seoBody}</div>
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
            {locale === "pl" ? "Przejdź do aktywnego inventory" : "Go straight to live inventory"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            {locale === "pl"
              ? "Jeśli szukasz dostępnych powierzchni reklamowych, przejdź od razu do marketplace i filtruj oferty według kraju, typu trasy i modelu cenowego."
              : "If you are searching for available media space, jump directly into the marketplace and filter listings by country, route scope, and pricing model."}
          </p>
          <Link href="/marketplace" className="mt-5 inline-flex rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
            {locale === "pl" ? "Przeglądaj marketplace" : "Browse marketplace"}
          </Link>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {t.marketing.advertisers.features.map(([title, body]) => (
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
