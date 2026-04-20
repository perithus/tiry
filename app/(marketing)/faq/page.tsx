import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getPublishedFaqItems } from "@/lib/data/content";

export default async function FaqPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const faqItems = await getPublishedFaqItems(locale);
  const items = faqItems.length > 0 ? faqItems.map((item) => [item.question, item.answer] as const) : t.marketing.faq.items;

  return (
    <section className="container-shell py-20">
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
