import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { addCampaignNote, addCampaignTask, updateCampaignStatus } from "@/lib/actions/campaigns";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";
import { campaignStatusValues } from "@/lib/validation/campaign";

const copy = {
  en: {
    title: "Admin control",
    heading: "Campaign details",
    subheading: "Manage campaign status, internal notes, and execution tasks from one record.",
    linkedListing: "Linked listing",
    linkedInquiry: "Linked inquiry",
    owner: "Owner",
    advertiser: "Advertiser",
    company: "Carrier company",
    brief: "Campaign brief",
    summary: "Internal summary",
    notes: "Internal notes",
    tasks: "Execution tasks",
    addNote: "Add note",
    addTask: "Add task",
    notePlaceholder: "Capture a sales update, blocker, negotiation detail, or internal decision.",
    taskTitle: "Task title",
    taskDescription: "Task description",
    assignee: "Assignee",
    dueDate: "Due date",
    saveStatus: "Save status",
    noNotes: "No notes yet.",
    noTasks: "No tasks yet.",
    unassigned: "Unassigned",
    saveTask: "Create task",
    status: "Status",
    noteAuthor: "Author",
    noLinkedEntity: "Not linked",
    createdAt: "Created"
  },
  pl: {
    title: "Panel administratora",
    heading: "Szczegóły kampanii",
    subheading: "Zarządzaj statusem kampanii, notatkami wewnętrznymi i taskami realizacyjnymi z jednego rekordu.",
    linkedListing: "Powiązana oferta",
    linkedInquiry: "Powiązane zapytanie",
    owner: "Owner",
    advertiser: "Reklamodawca",
    company: "Firma transportowa",
    brief: "Brief kampanii",
    summary: "Podsumowanie wewnętrzne",
    notes: "Notatki wewnętrzne",
    tasks: "Taski realizacyjne",
    addNote: "Dodaj notatkę",
    addTask: "Dodaj task",
    notePlaceholder: "Zapisz update sprzedażowy, blocker, szczegół negocjacji albo decyzję wewnętrzną.",
    taskTitle: "Tytuł taska",
    taskDescription: "Opis taska",
    assignee: "Assignee",
    dueDate: "Termin",
    saveStatus: "Zapisz status",
    noNotes: "Brak notatek.",
    noTasks: "Brak tasków.",
    unassigned: "Bez przypisania",
    saveTask: "Utwórz task",
    status: "Status",
    noteAuthor: "Autor",
    noLinkedEntity: "Brak powiązania",
    createdAt: "Utworzono"
  }
} as const;

const statusLabels = {
  en: {
    DRAFT: "Draft",
    PLANNING: "Planning",
    NEGOTIATION: "Negotiation",
    READY_TO_BOOK: "Ready to book",
    ACTIVE: "Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  },
  pl: {
    DRAFT: "Szkic",
    PLANNING: "Planowanie",
    NEGOTIATION: "Negocjacje",
    READY_TO_BOOK: "Gotowa do bookingu",
    ACTIVE: "Aktywna",
    COMPLETED: "Zakończona",
    CANCELLED: "Anulowana"
  }
} as const;

function formatDate(value: Date | null | undefined, locale: Locale) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function getStatusTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "DONE") {
    return "success";
  }

  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "IN_PROGRESS" || status === "BLOCKED") {
    return "warning";
  }

  if (status === "CANCELLED") {
    return "danger";
  }

  return "neutral";
}

export default async function AdminCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const { campaignId } = await params;

  const [campaign, assignees] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        advertiser: true,
        owner: true,
        company: true,
        primaryListing: true,
        inquiry: true,
        notes: {
          include: {
            author: true
          },
          orderBy: { createdAt: "desc" }
        },
        tasks: {
          include: {
            assignee: true
          },
          orderBy: [{ completedAt: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
        }
      }
    }),
    prisma.user.findMany({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true }
    })
  ]);

  if (!campaign) {
    notFound();
  }

  return (
    <DashboardShell
      title={t.title}
      nav={getAdminNav(locale)}
      heading={`${t.heading}: ${campaign.name}`}
      subheading={t.subheading}
      locale={locale}
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={campaign.status} tone={getStatusTone(campaign.status)} />
              <StatusBadge label={campaign.priority} tone={campaign.priority === "URGENT" ? "danger" : "neutral"} />
            </div>

            <div className="mt-5 grid gap-3 text-sm text-ink-600 md:grid-cols-2">
              <p>
                <span className="font-medium text-ink-900">{t.advertiser}:</span> {campaign.advertiser.name}
              </p>
              <p>
                <span className="font-medium text-ink-900">{t.owner}:</span> {campaign.owner?.name ?? t.unassigned}
              </p>
              <p>
                <span className="font-medium text-ink-900">{t.company}:</span> {campaign.company?.displayName ?? t.noLinkedEntity}
              </p>
              <p>
                <span className="font-medium text-ink-900">{t.linkedListing}:</span> {campaign.primaryListing?.title ?? t.noLinkedEntity}
              </p>
              <p>
                <span className="font-medium text-ink-900">{t.linkedInquiry}:</span> {campaign.inquiry?.campaignName ?? t.noLinkedEntity}
              </p>
              <p>
                <span className="font-medium text-ink-900">{t.createdAt}:</span> {formatDate(campaign.createdAt, locale)}
              </p>
            </div>

            {campaign.brief ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">{t.brief}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{campaign.brief}</p>
              </div>
            ) : null}

            {campaign.internalSummary ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-ink-500">{t.summary}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{campaign.internalSummary}</p>
              </div>
            ) : null}
          </div>

          <div className="glass-panel p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-semibold text-ink-900">{t.notes}</h2>
            </div>

            <form action={addCampaignNote} className="mb-6 space-y-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <textarea
                name="body"
                rows={4}
                placeholder={t.notePlaceholder}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
              />
              <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.addNote}</button>
            </form>

            <div className="space-y-4">
              {campaign.notes.length === 0 ? (
                <p className="text-sm text-ink-600">{t.noNotes}</p>
              ) : (
                campaign.notes.map((note) => (
                  <article key={note.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">
                        {t.noteAuthor}: {note.author.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-ink-500">{formatDate(note.createdAt, locale)}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{note.body}</p>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.status}</h2>
            <form action={updateCampaignStatus} className="mt-4 space-y-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <select name="status" defaultValue={campaign.status} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                {campaignStatusValues.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[locale][status]}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveStatus}</button>
            </form>
          </div>

          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.tasks}</h2>
            <form action={addCampaignTask} className="mt-4 space-y-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <input
                name="title"
                placeholder={t.taskTitle}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
              />
              <textarea
                name="description"
                rows={3}
                placeholder={t.taskDescription}
                className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
              />
              <select name="assigneeId" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                <option value="">{t.unassigned}</option>
                {assignees.map((assignee) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name} ({assignee.email})
                  </option>
                ))}
              </select>
              <input name="dueDate" type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              <button className="w-full rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveTask}</button>
            </form>

            <div className="mt-6 space-y-4">
              {campaign.tasks.length === 0 ? (
                <p className="text-sm text-ink-600">{t.noTasks}</p>
              ) : (
                campaign.tasks.map((task) => (
                  <article key={task.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-ink-900">{task.title}</h3>
                      <StatusBadge label={task.status} tone={getStatusTone(task.status)} />
                    </div>
                    {task.description ? <p className="mt-3 text-sm leading-6 text-ink-700">{task.description}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-ink-500">
                      <span>{task.assignee?.name ?? t.unassigned}</span>
                      <span>{task.dueDate ? `${t.dueDate}: ${formatDate(task.dueDate, locale)}` : null}</span>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
