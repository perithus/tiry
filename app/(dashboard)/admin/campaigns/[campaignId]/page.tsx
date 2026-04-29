import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignActivityFeed } from "@/components/dashboard/campaign-activity-feed";
import { CampaignFilesPanel } from "@/components/dashboard/campaign-files-panel";
import { CampaignOperationsPanel } from "@/components/dashboard/campaign-operations-panel";
import { AdminCampaignWrapUpPanel } from "@/components/dashboard/campaign-wrap-up-panel";
import { StatusBadge } from "@/components/shared/status-badge";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { getCampaignWrapUp, listCampaignMilestones } from "@/lib/campaign-operations";
import { listCampaignFiles } from "@/lib/campaign-files";
import {
  addCampaignNote,
  addCampaignTask,
  updateCampaignDetails,
  updateCampaignStatus,
  updateCampaignTaskDetails
} from "@/lib/actions/campaigns";
import { requireRole } from "@/lib/auth/permissions";
import { getAdminNav } from "@/lib/data/navigation";
import { getCampaignActivityLogs } from "@/lib/data/campaign-activity";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";
import { bookingStatusValues } from "@/lib/validation/booking";
import { campaignPriorityValues, campaignStatusValues, campaignTaskStatusValues } from "@/lib/validation/campaign";

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
    details: "Campaign details",
    notes: "Internal notes",
    tasks: "Execution tasks",
    campaignName: "Campaign name",
    priority: "Priority",
    plannedStartDate: "Planned start date",
    plannedEndDate: "Planned end date",
    bookedStartDate: "Booked start date",
    bookedEndDate: "Booked end date",
    currency: "Currency",
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
    createdAt: "Created",
    booking: "Booking",
    bookingOps: "Booking operations",
    bookingStatus: "Booking status",
    offer: "Accepted offer",
    noOffer: "No accepted offer yet",
    noBooking: "No booking yet",
    saveBooking: "Save booking",
    inquiryBudget: "Inquiry budget",
    budget: "Campaign budget",
    saveDetails: "Save campaign details",
    activity: "Activity timeline",
    noActivity: "No campaign activity yet.",
    saveTaskDetails: "Save task details",
    taskStatus: "Task status",
    files: "Campaign files",
    filesHelp: "Keep briefs, signed PDFs, artwork, proofs, and delivery attachments in one secure campaign record.",
    fileLabel: "File label",
    fileLabelPlaceholder: "Optional label, e.g. signed contract",
    fileInput: "Choose file",
    uploadFile: "Upload file",
    noFiles: "No files uploaded yet.",
    openFile: "Open file",
    uploadedBy: "Uploaded by",
    uploadedAt: "Uploaded",
    operations: "Campaign operations",
    noMilestones: "No campaign milestones yet.",
    phase: "Phase",
    wrapUp: "Post-campaign wrap-up",
    deliverySummary: "Delivery summary",
    proofOfDelivery: "Proof of delivery",
    internalOutcome: "Internal outcome",
    renewalOpportunity: "Renewal opportunity",
    followUpOwner: "Follow-up owner"
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
    details: "Dane kampanii",
    notes: "Notatki wewnętrzne",
    tasks: "Taski realizacyjne",
    campaignName: "Nazwa kampanii",
    priority: "Priorytet",
    plannedStartDate: "Planowany start",
    plannedEndDate: "Planowany koniec",
    bookedStartDate: "Booked start",
    bookedEndDate: "Booked end",
    currency: "Waluta",
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
    createdAt: "Utworzono",
    booking: "Booking",
    bookingOps: "Operacje bookingowe",
    bookingStatus: "Status bookingu",
    offer: "Zaakceptowana oferta",
    noOffer: "Brak zaakceptowanej oferty",
    noBooking: "Brak bookingu",
    saveBooking: "Zapisz booking",
    inquiryBudget: "Budżet inquiry",
    budget: "Budżet kampanii",
    saveDetails: "Zapisz dane kampanii",
    activity: "Timeline aktywności",
    noActivity: "Brak aktywności kampanii.",
    saveTaskDetails: "Zapisz dane taska",
    taskStatus: "Status taska",
    files: "Pliki kampanii",
    filesHelp: "Trzymaj briefy, podpisane PDF-y, grafiki, proofy i zalaczniki realizacyjne w jednym bezpiecznym rekordzie.",
    fileLabel: "Etykieta pliku",
    fileLabelPlaceholder: "Opcjonalna etykieta, np. podpisana umowa",
    fileInput: "Wybierz plik",
    uploadFile: "Dodaj plik",
    noFiles: "Brak plikow.",
    openFile: "Otworz plik",
    uploadedBy: "Dodane przez",
    uploadedAt: "Dodano",
    operations: "Operacje kampanii",
    noMilestones: "Brak milestone'ow kampanii.",
    phase: "Etap",
    wrapUp: "Podsumowanie po kampanii",
    deliverySummary: "Podsumowanie realizacji",
    proofOfDelivery: "Proof of delivery",
    internalOutcome: "Wynik wewnetrzny",
    renewalOpportunity: "Szansa odnowienia",
    followUpOwner: "Owner follow-upu"
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

function formatCurrency(amountInCents: number | null | undefined, currency = "EUR") {
  if (amountInCents == null) {
    return "Custom";
  }

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

function getStatusTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "DONE" || status === "CONFIRMED" || status === "ACCEPTED") {
    return "success";
  }

  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "IN_PROGRESS" || status === "BLOCKED" || status === "PENDING") {
    return "warning";
  }

  if (status === "CANCELLED" || status === "REJECTED") {
    return "danger";
  }

  return "neutral";
}

function parseOfferTerms(terms: string) {
  try {
    return JSON.parse(terms) as { body?: string; bookedFrom?: string; bookedTo?: string };
  } catch {
    return { body: terms };
  }
}

export default async function AdminCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  await requireRole("ADMIN");
  const { campaignId } = await params;

  const [campaign, assignees, activityLogs, campaignFiles, milestones, wrapUp] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        advertiser: true,
        owner: true,
        company: true,
        primaryListing: true,
        inquiry: {
          include: {
            offers: {
              orderBy: { createdAt: "desc" }
            },
            booking: true
          }
        },
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
    }),
    getCampaignActivityLogs(campaignId, 24),
    listCampaignFiles(campaignId),
    listCampaignMilestones(campaignId),
    getCampaignWrapUp(campaignId)
  ]);

  if (!campaign) {
    notFound();
  }

  const acceptedOffer = campaign.inquiry?.offers.find((offer) => offer.status === "ACCEPTED") ?? null;
  const parsedTerms = acceptedOffer ? parseOfferTerms(acceptedOffer.terms) : null;

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
              {campaign.inquiry?.booking ? <StatusBadge label={campaign.inquiry.booking.status} tone={getStatusTone(campaign.inquiry.booking.status)} /> : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-ink-600 md:grid-cols-2">
              <p><span className="font-medium text-ink-900">{t.advertiser}:</span> {campaign.advertiser.name}</p>
              <p><span className="font-medium text-ink-900">{t.owner}:</span> {campaign.owner?.name ?? t.unassigned}</p>
              <p><span className="font-medium text-ink-900">{t.company}:</span> {campaign.company?.displayName ?? t.noLinkedEntity}</p>
              <p><span className="font-medium text-ink-900">{t.linkedListing}:</span> {campaign.primaryListing?.title ?? t.noLinkedEntity}</p>
              <p><span className="font-medium text-ink-900">{t.linkedInquiry}:</span> {campaign.inquiry?.campaignName ?? t.noLinkedEntity}</p>
              <p><span className="font-medium text-ink-900">{t.createdAt}:</span> {formatDate(campaign.createdAt, locale)}</p>
              <p><span className="font-medium text-ink-900">{t.inquiryBudget}:</span> {formatCurrency(campaign.inquiry?.budgetMaxCents ?? campaign.inquiry?.budgetMinCents)}</p>
              <p><span className="font-medium text-ink-900">{t.booking}:</span> {campaign.inquiry?.booking ? `${formatDate(campaign.inquiry.booking.bookedFrom, locale)} - ${formatDate(campaign.inquiry.booking.bookedTo, locale)}` : t.noBooking}</p>
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
              <h2 className="font-display text-2xl font-semibold text-ink-900">{t.offer}</h2>
            </div>
            {acceptedOffer ? (
              <div className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-ink-900">{acceptedOffer.title}</h3>
                    <p className="mt-1 text-sm text-ink-600">{formatCurrency(acceptedOffer.priceCents, acceptedOffer.currency)}</p>
                  </div>
                  <StatusBadge label={acceptedOffer.status} tone={getStatusTone(acceptedOffer.status)} />
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-700">{parsedTerms?.body}</p>
                {parsedTerms?.bookedFrom && parsedTerms?.bookedTo ? (
                  <p className="mt-3 text-sm text-ink-600">{formatDate(new Date(parsedTerms.bookedFrom), locale)} - {formatDate(new Date(parsedTerms.bookedTo), locale)}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-ink-600">{t.noOffer}</p>
            )}
          </div>

          <CampaignFilesPanel
            campaignId={campaign.id}
            files={campaignFiles}
            locale={locale}
            copy={{
              title: t.files,
              uploadHelp: t.filesHelp,
              label: t.fileLabel,
              labelPlaceholder: t.fileLabelPlaceholder,
              file: t.fileInput,
              save: t.uploadFile,
              open: t.openFile,
              noFiles: t.noFiles,
              uploadedBy: t.uploadedBy,
              uploadedAt: t.uploadedAt
            }}
          />

          <CampaignOperationsPanel
            locale={locale}
            campaignId={campaign.id}
            milestones={milestones}
            assignees={assignees}
            copy={{
              title: t.operations,
              add: t.addTask,
              noItems: t.noMilestones,
              milestoneTitle: t.taskTitle,
              phase: t.phase,
              assignee: t.assignee,
              dueDate: t.dueDate,
              status: t.taskStatus,
              save: t.saveTaskDetails,
              unassigned: t.unassigned
            }}
          />

          <AdminCampaignWrapUpPanel
            campaignId={campaign.id}
            wrapUp={wrapUp}
            copy={{
              title: t.wrapUp,
              deliverySummary: t.deliverySummary,
              proofOfDelivery: t.proofOfDelivery,
              internalOutcome: t.internalOutcome,
              renewalOpportunity: t.renewalOpportunity,
              followUpOwner: t.followUpOwner,
              save: t.saveDetails
            }}
          />

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
                      <p className="text-sm font-medium text-ink-900">{t.noteAuthor}: {note.author.name}</p>
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
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.details}</h2>
            <form action={updateCampaignDetails} className="mt-4 space-y-4">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <label className="block text-sm font-medium text-ink-700">
                {t.campaignName}
                <input
                  name="name"
                  defaultValue={campaign.name}
                  className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink-700">
                  {t.priority}
                  <select name="priority" defaultValue={campaign.priority} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    {campaignPriorityValues.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block text-sm font-medium text-ink-700">
                  {t.owner}
                  <select name="ownerId" defaultValue={campaign.ownerId ?? ""} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    <option value="">{t.unassigned}</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name} ({assignee.email})
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink-700">
                  {t.budget}
                  <input
                    name="budgetCents"
                    type="number"
                    min="0"
                    step="100"
                    defaultValue={campaign.budgetCents ?? ""}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-700">
                  {t.currency}
                  <input
                    name="currency"
                    maxLength={3}
                    defaultValue={campaign.currency}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm uppercase"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink-700">
                  {t.plannedStartDate}
                  <input
                    name="plannedStartDate"
                    type="date"
                    defaultValue={campaign.plannedStartDate ? campaign.plannedStartDate.toISOString().slice(0, 10) : ""}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-700">
                  {t.plannedEndDate}
                  <input
                    name="plannedEndDate"
                    type="date"
                    defaultValue={campaign.plannedEndDate ? campaign.plannedEndDate.toISOString().slice(0, 10) : ""}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-ink-700">
                  {t.bookedStartDate}
                  <input
                    name="bookedStartDate"
                    type="date"
                    defaultValue={campaign.bookedStartDate ? campaign.bookedStartDate.toISOString().slice(0, 10) : ""}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
                <label className="block text-sm font-medium text-ink-700">
                  {t.bookedEndDate}
                  <input
                    name="bookedEndDate"
                    type="date"
                    defaultValue={campaign.bookedEndDate ? campaign.bookedEndDate.toISOString().slice(0, 10) : ""}
                    className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </label>
              </div>
              <label className="block text-sm font-medium text-ink-700">
                {t.brief}
                <textarea
                  name="brief"
                  rows={4}
                  defaultValue={campaign.brief ?? ""}
                  className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="block text-sm font-medium text-ink-700">
                {t.summary}
                <textarea
                  name="internalSummary"
                  rows={4}
                  defaultValue={campaign.internalSummary ?? ""}
                  className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <button className="w-full rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveDetails}</button>
            </form>
          </div>

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
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.bookingOps}</h2>
            {campaign.inquiry?.booking ? (
              <form action={updateBookingStatus} className="mt-4 space-y-3">
                <input type="hidden" name="bookingId" value={campaign.inquiry.booking.id} />
                <input type="hidden" name="campaignId" value={campaign.id} />
                <label className="text-sm font-medium text-ink-700">
                  {t.bookingStatus}
                  <select name="status" defaultValue={campaign.inquiry.booking.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    {bookingStatusValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="w-full rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveBooking}</button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-ink-600">{t.noBooking}</p>
            )}
          </div>

          <div className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{t.tasks}</h2>
            <form action={addCampaignTask} className="mt-4 space-y-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <input name="title" placeholder={t.taskTitle} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              <textarea name="description" rows={3} placeholder={t.taskDescription} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
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
                    <form action={updateCampaignTaskDetails} className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/70 p-4">
                      <input type="hidden" name="campaignId" value={campaign.id} />
                      <input type="hidden" name="taskId" value={task.id} />
                      <input name="title" defaultValue={task.title} placeholder={t.taskTitle} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={task.description ?? ""}
                        placeholder={t.taskDescription}
                        className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <select name="assigneeId" defaultValue={task.assigneeId ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                          <option value="">{t.unassigned}</option>
                          {assignees.map((assignee) => (
                            <option key={assignee.id} value={assignee.id}>
                              {assignee.name} ({assignee.email})
                            </option>
                          ))}
                        </select>
                        <input
                          name="dueDate"
                          type="date"
                          defaultValue={task.dueDate ? task.dueDate.toISOString().slice(0, 10) : ""}
                          className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                        />
                      </div>
                      <label className="text-sm font-medium text-ink-700">
                        {t.taskStatus}
                        <select name="status" defaultValue={task.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                          {campaignTaskStatusValues.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.saveTaskDetails}</button>
                    </form>
                  </article>
                ))
              )}
            </div>
          </div>

          <CampaignActivityFeed locale={locale} logs={activityLogs} title={t.activity} emptyLabel={t.noActivity} />
        </div>
      </div>
    </DashboardShell>
  );
}
