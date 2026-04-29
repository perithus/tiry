import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return buildPageMetadata({
    locale,
    title: locale === "pl" ? "Jak działa reklama na ciężarówkach w TIY" : "How Truck Advertising Works on TIY",
    description:
      locale === "pl"
        ? "Poznaj workflow od dodania inventory i weryfikacji przewoźnika po zapytania, oferty, booking i realizację kampanii."
        : "Learn the workflow from carrier verification and inventory creation to inquiries, offers, bookings, and campaign delivery.",
    path: "/how-it-works",
    keywords: ["how truck advertising works", "truck advertising workflow", "fleet media booking process"]
  });
}

export default async function HowItWorksPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const steps = t.marketing.how.steps;

  return (
    <section className="container-shell py-20">
      <SectionHeading
        eyebrow={t.marketing.how.eyebrow}
        title={t.marketing.how.title}
        description={t.marketing.how.description}
      />
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="glass-panel p-6">
            <p className="text-sm font-semibold text-teal-700">0{index + 1}</p>
            <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink-900">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-ink-600">{step.body}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 rounded-[1.75rem] border border-ink-100 bg-white/80 p-6 text-sm leading-7 text-ink-600">
        {locale === "pl"
          ? "Ten workflow porządkuje zakup i sprzedaż reklamy na ciężarówkach: od discovery inventory, przez zapytania i oferty, po booking, notatki operacyjne i koordynację kampanii."
          : "This workflow structures how truck advertising is bought and sold: from inventory discovery and campaign inquiries to offers, bookings, operational notes, and campaign coordination."}
      </div>
    </section>
  );
}
