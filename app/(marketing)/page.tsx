import { ArrowRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { ButtonLink } from "@/components/shared/button";
import { MetricCard } from "@/components/shared/metric-card";
import { SectionHeading } from "@/components/shared/section-heading";
import { ListingCard } from "@/components/marketplace/listing-card";
import { getFeaturedListings } from "@/lib/data/queries";
import { heroMetrics, valueProps } from "@/lib/data/mock";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export default async function HomePage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const listings = await getFeaturedListings();

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden bg-hero-glow text-white">
        <div className="hero-grid-overlay" />
        <div className="hero-orb animate-glow left-[-4rem] top-16 h-40 w-40 bg-teal-300/35" />
        <div className="hero-orb animate-float right-[8%] top-24 h-56 w-56 bg-white/15" />
        <div className="hero-orb animate-glow bottom-[-4rem] right-[-2rem] h-52 w-52 bg-amber-200/20" />

        <div className="container-shell relative grid gap-10 py-20 lg:grid-cols-[1.12fr_0.88fr] lg:py-32">
          <div className="animate-rise space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/90">
              <ShieldCheck className="h-4 w-4" />
              {t.home.badge}
            </div>
            <div className="space-y-5">
              <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl xl:text-7xl">
                {t.home.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/78">{t.home.description}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/marketplace" className="gap-2 bg-white text-ink-900 hover:-translate-y-0.5 hover:bg-white/90">
                {t.home.primaryCta}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/transport-companies" variant="secondary" className="border-white/20 bg-white/10 text-white ring-0 hover:-translate-y-0.5 hover:bg-white/20">
                {t.home.secondaryCta}
              </ButtonLink>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-3">
              {[
                locale === "pl" ? "Zweryfikowane firmy" : "Verified companies",
                locale === "pl" ? "Komercyjne workflow" : "Commercial workflows",
                locale === "pl" ? "Admin governance" : "Admin governance"
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white/88 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="glass-panel-premium ambient-card animate-rise p-6 text-ink-900" style={{ animationDelay: "120ms" }}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                {locale === "pl" ? "Pulse platformy" : "Platform pulse"}
              </p>
              <div className="mt-5 grid gap-4">
                {heroMetrics.map((metric) => (
                  <MetricCard
                    key={metric.label}
                    label={locale === "pl" ? metric.labelPl : metric.label}
                    value={metric.value}
                    description={t.home.metricsDescription}
                  />
                ))}
              </div>
            </div>

            <div className="glass-panel-premium ambient-card animate-rise p-6 text-ink-900" style={{ animationDelay: "220ms" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {locale === "pl" ? "Dla zespołów handlowych" : "For commercial teams"}
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-semibold tracking-tight text-ink-900">
                    {locale === "pl" ? "Lead, oferta, booking, kampania" : "Lead, offer, booking, campaign"}
                  </h2>
                </div>
                <Sparkles className="h-8 w-8 text-teal-700" />
              </div>
              <div className="premium-divider my-5" />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-ink-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "pl" ? "CRM" : "CRM"}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-700">
                    {locale === "pl"
                      ? "Kampanie, taski, notatki i ownerzy w jednym operacyjnym workflow."
                      : "Campaigns, tasks, notes, and owners in one operational workflow."}
                  </p>
                </div>
                <div className="rounded-2xl bg-ink-50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "pl" ? "Supply" : "Supply"}</p>
                  <p className="mt-2 text-sm leading-6 text-ink-700">
                    {locale === "pl"
                      ? "Pojazdy, listingi i dostępność prowadzone bez chaosu w mailach."
                      : "Vehicles, listings, and availability managed without email chaos."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wash container-shell relative py-20">
        <SectionHeading eyebrow={t.home.whyEyebrow} title={t.home.whyTitle} description={t.home.whyDescription} />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {valueProps.map((item, index) => {
            const icons = [Truck, Sparkles, ShieldCheck];
            const Icon = icons[index] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="glass-panel-premium ambient-card hover-lift animate-rise p-7"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <div className="inline-flex rounded-2xl bg-teal-50 p-3">
                  <Icon className="h-8 w-8 text-teal-700" />
                </div>
                <h3 className="font-display mt-5 text-2xl font-semibold tracking-tight text-ink-900">
                  {locale === "pl" ? item.titlePl : item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-600">{locale === "pl" ? item.bodyPl : item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-shell py-8">
        <SectionHeading eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} description={t.home.featuredDescription} />
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {listings.map((listing, index) => (
            <div key={listing.id} className="animate-rise hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <ListingCard listing={listing} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
