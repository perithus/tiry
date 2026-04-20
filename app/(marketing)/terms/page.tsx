import { getLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";
import { getPublishedContentPage } from "@/lib/data/content";

export default async function TermsPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const page = await getPublishedContentPage("terms", locale);

  return (
    <section className="container-shell py-20">
      <div className="mx-auto max-w-4xl glass-panel p-8">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">{page?.title ?? t.marketing.terms.title}</h1>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-ink-600">{page?.body ?? t.marketing.terms.body}</p>
      </div>
    </section>
  );
}
