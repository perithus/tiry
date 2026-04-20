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
    <div className="pb-20">
      <section className="relative overflow-hidden bg-hero-glow text-white">
        <div className="hero-orb animate-glow left-[-4rem] top-16 h-40 w-40 bg-teal-300/35" />
        <div className="hero-orb animate-float right-[8%] top-24 h-56 w-56 bg-white/15" />
        <div className="hero-orb animate-glow bottom-[-4rem] right-[-2rem] h-52 w-52 bg-ink-300/30" />
        <div className="container-shell relative grid gap-10 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="animate-rise space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-white/90">
              <ShieldCheck className="h-4 w-4" />
              {t.home.badge}
            </div>
            <div className="space-y-5">
              <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
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
          </div>
          <div className="glass-panel-premium animate-rise animate-float grid gap-4 p-6 text-ink-900" style={{ animationDelay: "120ms" }}>
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
      </section>

      <section className="container-shell py-20">
        <SectionHeading
          eyebrow={t.home.whyEyebrow}
          title={t.home.whyTitle}
          description={t.home.whyDescription}
        />
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {valueProps.map((item, index) => {
            const icons = [Truck, Sparkles, ShieldCheck];
            const Icon = icons[index] ?? Sparkles;
            return (
              <div
                key={item.title}
                className="glass-panel-premium hover-lift animate-rise p-6"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <Icon className="h-10 w-10 text-teal-700" />
                <h3 className="font-display mt-5 text-xl font-semibold tracking-tight text-ink-900">
                  {locale === "pl" ? item.titlePl : item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-600">{locale === "pl" ? item.bodyPl : item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container-shell py-8">
        <SectionHeading
          eyebrow={t.home.featuredEyebrow}
          title={t.home.featuredTitle}
          description={t.home.featuredDescription}
        />
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
