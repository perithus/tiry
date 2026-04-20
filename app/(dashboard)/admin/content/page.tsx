import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { createFaqItem, upsertContentPage } from "@/lib/actions/content";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";

const copy = {
  en: {
    title: "Admin control",
    heading: "Content CMS",
    subheading: "Manage public pages and FAQ entries in both languages from one internal publishing workspace.",
    pages: "Content pages",
    faq: "FAQ items",
    savePage: "Save page",
    addFaq: "Add FAQ item",
    slug: "Slug",
    locale: "Locale",
    pageTitle: "Page title",
    seoTitle: "SEO title",
    seoDescription: "SEO description",
    excerpt: "Excerpt",
    body: "Body",
    status: "Status",
    question: "Question",
    answer: "Answer",
    category: "Category",
    sortOrder: "Sort order",
    active: "Active",
    lastUpdated: "Last updated",
    editedBy: "Edited by",
    noEditor: "System",
    published: "Published",
    draft: "Draft"
  },
  pl: {
    title: "Panel administratora",
    heading: "CMS treści",
    subheading: "Zarządzaj stronami publicznymi i elementami FAQ w obu językach z jednego wewnętrznego panelu publikacji.",
    pages: "Strony treści",
    faq: "Elementy FAQ",
    savePage: "Zapisz stronę",
    addFaq: "Dodaj element FAQ",
    slug: "Slug",
    locale: "Język",
    pageTitle: "Tytuł strony",
    seoTitle: "Tytuł SEO",
    seoDescription: "Opis SEO",
    excerpt: "Lead",
    body: "Treść",
    status: "Status",
    question: "Pytanie",
    answer: "Odpowiedź",
    category: "Kategoria",
    sortOrder: "Kolejność",
    active: "Aktywne",
    lastUpdated: "Ostatnia zmiana",
    editedBy: "Edytowane przez",
    noEditor: "System",
    published: "Opublikowana",
    draft: "Szkic"
  }
} as const;

function formatDate(value: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

export default async function AdminContentPage() {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");

  const [pages, faqItems] = await Promise.all([
    prisma.contentPage.findMany({
      include: {
        editedBy: {
          select: { name: true }
        }
      },
      orderBy: [{ slug: "asc" }, { locale: "asc" }]
    }),
    prisma.faqItem.findMany({
      include: {
        editedBy: {
          select: { name: true }
        }
      },
      orderBy: [{ locale: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
    })
  ]);

  return (
    <DashboardShell
      title={t.title}
      nav={getAdminNav(locale)}
      heading={t.heading}
      subheading={t.subheading}
      locale={locale}
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.pages}</h2>
          <form action={upsertContentPage} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.slug}>
                <input name="slug" defaultValue="privacy-policy" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
              <Field label={t.locale}>
                <select name="locale" defaultValue={locale} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                  <option value="pl">PL</option>
                  <option value="en">EN</option>
                </select>
              </Field>
            </div>
            <Field label={t.pageTitle}>
              <input name="title" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.seoTitle}>
              <input name="seoTitle" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.seoDescription}>
              <textarea name="seoDescription" rows={2} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.excerpt}>
              <textarea name="excerpt" rows={2} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.body}>
              <textarea name="body" rows={10} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.status}>
              <select name="status" defaultValue="PUBLISHED" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="DRAFT">{t.draft}</option>
                <option value="PUBLISHED">{t.published}</option>
              </select>
            </Field>
            <div className="flex justify-end">
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.savePage}</button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {pages.map((page) => (
              <article key={`${page.slug}-${page.locale}`} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                      /{page.slug} · {page.locale.toUpperCase()}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ink-900">{page.title}</h3>
                  </div>
                  <StatusBadge label={page.status} tone={page.status === "PUBLISHED" ? "success" : "warning"} />
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-600">
                  <span>
                    {t.editedBy}: {page.editedBy?.name ?? t.noEditor}
                  </span>
                  <span>
                    {t.lastUpdated}: {formatDate(page.updatedAt, locale)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="glass-panel p-6">
          <h2 className="font-display text-2xl font-semibold text-ink-900">{t.faq}</h2>
          <form action={createFaqItem} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.locale}>
                <select name="locale" defaultValue={locale} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                  <option value="pl">PL</option>
                  <option value="en">EN</option>
                </select>
              </Field>
              <Field label={t.category}>
                <input name="category" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              </Field>
            </div>
            <Field label={t.question}>
              <input name="question" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <Field label={t.answer}>
              <textarea name="answer" rows={5} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
            </Field>
            <div className="grid gap-4 md:grid-cols-[0.5fr_auto] md:items-end">
              <Field label={t.sortOrder}>
                <input
                  name="sortOrder"
                  type="number"
                  min={0}
                  defaultValue={0}
                  className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                />
              </Field>
              <label className="inline-flex items-center gap-3 text-sm text-ink-700">
                <input type="checkbox" name="active" defaultChecked className="h-4 w-4 rounded border-ink-300" />
                {t.active}
              </label>
            </div>
            <div className="flex justify-end">
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.addFaq}</button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {faqItems.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-ink-500">
                    {item.locale.toUpperCase()} · {item.category ?? "General"} · #{item.sortOrder}
                  </p>
                  <StatusBadge label={item.active ? t.active : "Inactive"} tone={item.active ? "success" : "neutral"} />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-ink-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-600">{item.answer}</p>
                <p className="mt-3 text-sm text-ink-500">
                  {t.editedBy}: {item.editedBy?.name ?? t.noEditor}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-ink-700">{label}</span>
      {children}
    </label>
  );
}
