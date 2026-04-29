import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getPublishedFaqItems } from "@/lib/data/content";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  return buildPageMetadata({
    locale,
    title: locale === "pl" ? "FAQ: reklama na ciężarówkach i marketplace B2B" : "FAQ: Truck Advertising Marketplace",
    description:
      locale === "pl"
        ? "Najczęstsze pytania o reklamę na ciężarówkach, weryfikację przewoźników, bookingi i workflow kampanii na platformie TIY."
        : "Frequently asked questions about truck advertising, carrier verification, bookings, and campaign workflows on TIY.",
    path: "/faq",
    keywords: ["truck advertising faq", "fleet advertising questions", "carrier verification faq"]
  });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const faqItems = await getPublishedFaqItems(locale);
  const items = faqItems.length > 0 ? faqItems.map((item) => [item.question, item.answer] as const) : t.marketing.faq.items;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer
      }
    }))
  };

  return (
    <section className="container-shell py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">{t.marketing.faq.title}</h1>
        {items.map(([question, answer]) => (
          <div key={question} className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-ink-900">{question}</h2>
            <p className="mt-3 text-sm leading-7 text-ink-600">{answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
