import Link from "next/link";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { updateBookingStatus } from "@/lib/actions/bookings";
import { addCampaignNote } from "@/lib/actions/campaigns";
import { CampaignActivityFeed } from "@/components/dashboard/campaign-activity-feed";
import { CampaignFilesPanel } from "@/components/dashboard/campaign-files-panel";
import { ParticipantCampaignWrapUpPanel } from "@/components/dashboard/campaign-wrap-up-panel";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { getCampaignWrapUp, listCampaignMilestones } from "@/lib/campaign-operations";
import { listCampaignFiles } from "@/lib/campaign-files";
import { requireRole } from "@/lib/auth/permissions";
import { bookingStatusValues } from "@/lib/validation/booking";
import { getCampaignActivityLogs } from "@/lib/data/campaign-activity";
import { getFleetNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/shared";
import { isCampaignMessage, parseCampaignMessage } from "@/lib/utils/campaign-messages";

const copy = {
  en: {
    title: "Fleet workspace",
    heading: "Campaign workspace",
    subheading: "Coordinate delivery, booking, and advertiser communication from one campaign record.",
    back: "Back to campaigns",
    advertiser: "Advertiser",
    listing: "Listing",
    owner: "Owner",
    budget: "Budget",
    booking: "Booking window",
    bookingOps: "Booking operations",
    bookingStatus: "Booking status",
    noBooking: "No booking yet",
    brief: "Campaign brief",
    summary: "Internal summary",
    offer: "Accepted offer",
    latestOffer: "Latest offer",
    noOffer: "No offer attached yet",
    tasks: "Execution tasks",
    noTasks: "No tasks yet.",
    assignee: "Assignee",
    dueDate: "Due date",
    unassigned: "Unassigned",
    notes: "Operational notes",
    notePlaceholder: "Add an installation note, route blocker, or readiness update.",
    addNote: "Add note",
    noNotes: "No notes yet.",
    saveBooking: "Save booking",
    messages: "Campaign conversation",
    noMessages: "No messages in this conversation yet.",
    messagePlaceholder: "Write a message to the advertiser...",
    send: "Send message",
    files: "Campaign files",
    filesHelp: "Upload briefs, artwork, signed documents, and proof of delivery in one campaign record.",
    fileLabel: "File label",
    fileLabelPlaceholder: "Optional label, e.g. install photos",
    fileInput: "Choose file",
    uploadFile: "Upload file",
    noFiles: "No files uploaded yet.",
    openFile: "Open file",
    uploadedBy: "Uploaded by",
    uploadedAt: "Uploaded",
    milestones: "Campaign milestones",
    noMilestones: "No milestones yet.",
    phase: "Phase",
    wrapUp: "Post-campaign wrap-up",
    feedback: "Capture install notes, route outcomes, and delivery feedback.",
    rating: "Rating 1-5",
    activity: "Activity timeline",
    noActivity: "No campaign activity yet."
  },
  pl: {
    title: "Panel floty",
    heading: "Workspace kampanii",
    subheading: "Koordynuj realizacje, booking i komunikacje z reklamodawca z jednego rekordu kampanii.",
    back: "Wroc do kampanii",
    advertiser: "Reklamodawca",
    listing: "Oferta",
    owner: "Owner",
    budget: "Budzet",
    booking: "Okno bookingu",
    bookingOps: "Operacje bookingowe",
    bookingStatus: "Status bookingu",
    noBooking: "Brak bookingu",
    brief: "Brief kampanii",
    summary: "Podsumowanie wewnetrzne",
    offer: "Zaakceptowana oferta",
    latestOffer: "Najnowsza oferta",
    noOffer: "Brak powiazanej oferty",
    tasks: "Taski realizacyjne",
    noTasks: "Brak taskow.",
    assignee: "Assignee",
    dueDate: "Termin",
    unassigned: "Bez przypisania",
    notes: "Notatki operacyjne",
    notePlaceholder: "Dodaj notatke o montazu, blockerze trasowym albo gotowosci realizacyjnej.",
    addNote: "Dodaj notatke",
    noNotes: "Brak notatek.",
    saveBooking: "Zapisz booking",
    messages: "Rozmowa kampanii",
    noMessages: "W tej rozmowie nie ma jeszcze wiadomosci.",
    messagePlaceholder: "Napisz wiadomosc do reklamodawcy...",
    send: "Wyslij wiadomosc",
    files: "Pliki kampanii",
    filesHelp: "Dodawaj briefy, grafiki, podpisane dokumenty i proofy realizacji w rekordzie kampanii.",
    fileLabel: "Etykieta pliku",
    fileLabelPlaceholder: "Opcjonalna etykieta, np. zdjecia montazu",
    fileInput: "Wybierz plik",
    uploadFile: "Dodaj plik",
    noFiles: "Brak plikow.",
    openFile: "Otworz plik",
    uploadedBy: "Dodane przez",
    uploadedAt: "Dodano",
    milestones: "Milestone'y kampanii",
    noMilestones: "Brak milestone'ow.",
    phase: "Etap",
    wrapUp: "Podsumowanie po kampanii",
    feedback: "Zapisz notatki z montazu, wyniki tras i feedback po realizacji.",
    rating: "Ocena 1-5",
    activity: "Timeline aktywnosci",
    noActivity: "Brak aktywnosci kampanii."
  }
} as const;

function formatDate(value: Date | null | undefined, locale: Locale) {
  if (!value) return null;

  return new Intl.DateTimeFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(value);
}

function formatCurrency(amountInCents?: number | null, currency = "EUR", locale: Locale = "en") {
  if (amountInCents == null) return "Custom";

  return new Intl.NumberFormat(locale === "pl" ? "pl-PL" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "CONFIRMED" || status === "ACCEPTED" || status === "DONE") {
    return "success";
  }
  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "PLANNING" || status === "IN_PROGRESS" || status === "BLOCKED") {
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

export default async function FleetCampaignDetailPage({ params }: { params: Promise<{ campaignId: string }> }) {
  noStore();
  const locale = await getLocale();
  const c = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  const { campaignId } = await params;

  const [campaign, activityLogs, campaignFiles, milestones, wrapUp] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        advertiser: true,
        owner: true,
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
    getCampaignActivityLogs(campaignId, 18),
    listCampaignFiles(campaignId),
    listCampaignMilestones(campaignId),
    getCampaignWrapUp(campaignId)
  ]);

  if (!campaign || !session.user.companyId || campaign.companyId !== session.user.companyId) {
    notFound();
  }

  const acceptedOffer = campaign.inquiry?.offers.find((offer) => offer.status === "ACCEPTED") ?? null;
  const fallbackOffer = campaign.inquiry?.offers[0] ?? null;
  const featuredOffer = acceptedOffer ?? fallbackOffer;
  const parsedOffer = featuredOffer ? parseOfferTerms(featuredOffer.terms) : null;
  const campaignMessages = campaign.notes.filter((note) => isCampaignMessage(note.body)).reverse();
  const internalNotes = campaign.notes.filter((note) => !isCampaignMessage(note.body));

  return (
    <DashboardShell title={c.title} nav={getFleetNav(locale)} heading={`${c.heading}: ${campaign.name}`} subheading={c.subheading} locale={locale}>
      <div className="flex justify-start">
        <Link href="/fleet/campaigns" className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
          {c.back}
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="glass-panel p-6">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
              {campaign.inquiry?.booking ? <StatusBadge label={campaign.inquiry.booking.status} tone={getTone(campaign.inquiry.booking.status)} /> : null}
              {acceptedOffer ? <StatusBadge label={acceptedOffer.status} tone={getTone(acceptedOffer.status)} /> : null}
            </div>

            <div className="mt-5 grid gap-3 text-sm text-ink-600 md:grid-cols-2">
              <p><span className="font-medium text-ink-900">{c.advertiser}:</span> {campaign.advertiser.name}</p>
              <p><span className="font-medium text-ink-900">{c.owner}:</span> {campaign.owner?.name ?? c.unassigned}</p>
              <p><span className="font-medium text-ink-900">{c.listing}:</span> {campaign.primaryListing?.title ?? "N/A"}</p>
              <p><span className="font-medium text-ink-900">{c.budget}:</span> {formatCurrency(campaign.budgetCents, campaign.currency, locale)}</p>
              <p className="md:col-span-2">
                <span className="font-medium text-ink-900">{c.booking}:</span>{" "}
                {campaign.inquiry?.booking
                  ? `${formatDate(campaign.inquiry.booking.bookedFrom, locale)} - ${formatDate(campaign.inquiry.booking.bookedTo, locale)}`
                  : c.noBooking}
              </p>
            </div>

            {campaign.brief ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{c.brief}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{campaign.brief}</p>
              </div>
            ) : null}

            {campaign.internalSummary ? (
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{c.summary}</h2>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{campaign.internalSummary}</p>
              </div>
            ) : null}
          </section>

          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{acceptedOffer ? c.offer : c.latestOffer}</h2>
            {featuredOffer ? (
              <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-ink-900">{featuredOffer.title}</p>
                    <p className="mt-1 text-sm text-ink-600">{formatCurrency(featuredOffer.priceCents, featuredOffer.currency, locale)}</p>
                  </div>
                  <StatusBadge label={featuredOffer.status} tone={getTone(featuredOffer.status)} />
                </div>
                {parsedOffer?.body ? <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{parsedOffer.body}</p> : null}
                {parsedOffer?.bookedFrom && parsedOffer?.bookedTo ? (
                  <p className="mt-3 text-sm text-ink-600">
                    {c.booking}: {parsedOffer.bookedFrom} - {parsedOffer.bookedTo}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-ink-600">{c.noOffer}</p>
            )}
          </section>

          <CampaignFilesPanel
            campaignId={campaign.id}
            files={campaignFiles}
            locale={locale}
            copy={{
              title: c.files,
              uploadHelp: c.filesHelp,
              label: c.fileLabel,
              labelPlaceholder: c.fileLabelPlaceholder,
              file: c.fileInput,
              save: c.uploadFile,
              open: c.openFile,
              noFiles: c.noFiles,
              uploadedBy: c.uploadedBy,
              uploadedAt: c.uploadedAt
            }}
          />

          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.milestones}</h2>
            <div className="mt-5 space-y-3">
              {milestones.length === 0 ? (
                <p className="text-sm text-ink-600">{c.noMilestones}</p>
              ) : (
                milestones.map((milestone) => (
                  <article key={milestone.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{milestone.title}</p>
                        <p className="mt-1 text-sm text-ink-600">{c.phase}: {milestone.phase}</p>
                      </div>
                      <StatusBadge label={milestone.status} tone={getTone(milestone.status)} />
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <ParticipantCampaignWrapUpPanel
            campaignId={campaign.id}
            wrapUp={wrapUp}
            role="carrier"
            copy={{
              title: c.wrapUp,
              feedback: c.feedback,
              rating: c.rating,
              save: c.addNote
            }}
          />

          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.notes}</h2>
            <form action={addCampaignNote} className="mt-5 grid gap-3">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <textarea name="body" rows={4} placeholder={c.notePlaceholder} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
              <div className="flex justify-end">
                <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{c.addNote}</button>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {internalNotes.length === 0 ? (
                <p className="text-sm text-ink-600">{c.noNotes}</p>
              ) : (
                internalNotes.map((note) => (
                  <article key={note.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-medium text-ink-900">{note.author.name}</p>
                      <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{formatDate(note.createdAt, locale)}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-700">{note.body}</p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.bookingOps}</h2>
            {campaign.inquiry?.booking ? (
              <form action={updateBookingStatus} className="mt-5 space-y-3">
                <input type="hidden" name="bookingId" value={campaign.inquiry.booking.id} />
                <input type="hidden" name="campaignId" value={campaign.id} />
                <label className="block text-sm font-medium text-ink-700">
                  {c.bookingStatus}
                  <select name="status" defaultValue={campaign.inquiry.booking.status} className="mt-2 w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm">
                    {bookingStatusValues.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="w-full rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{c.saveBooking}</button>
              </form>
            ) : (
              <p className="mt-4 text-sm text-ink-600">{c.noBooking}</p>
            )}
          </section>

          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.tasks}</h2>
            <div className="mt-5 space-y-4">
              {campaign.tasks.length === 0 ? (
                <p className="text-sm text-ink-600">{c.noTasks}</p>
              ) : (
                campaign.tasks.map((task) => (
                  <article key={task.id} className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink-900">{task.title}</p>
                      <StatusBadge label={task.status} tone={getTone(task.status)} />
                    </div>
                    {task.description ? <p className="mt-3 text-sm leading-6 text-ink-700">{task.description}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-4 text-xs uppercase tracking-[0.16em] text-ink-500">
                      <span>{c.assignee}: {task.assignee?.name ?? c.unassigned}</span>
                      {task.dueDate ? <span>{c.dueDate}: {formatDate(task.dueDate, locale)}</span> : null}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>

          <CampaignActivityFeed locale={locale} logs={activityLogs} title={c.activity} emptyLabel={c.noActivity} />

          <section className="glass-panel p-6">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.messages}</h2>
            <div className="mt-5 space-y-3 rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
              {campaignMessages.length ? (
                campaignMessages.map((message) => {
                  const own = message.author.id === session.user.id;
                  return (
                    <div key={message.id} className={own ? "flex justify-end" : "flex justify-start"}>
                      <div
                        className={
                          own
                            ? "max-w-[85%] rounded-[1.5rem] bg-ink-900 px-4 py-3 text-sm text-white"
                            : "max-w-[85%] rounded-[1.5rem] bg-ink-100 px-4 py-3 text-sm text-ink-800"
                        }
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{message.author.name}</p>
                        <p className="mt-2 whitespace-pre-wrap leading-6">{parseCampaignMessage(message.body)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-ink-600">{c.noMessages}</p>
              )}

              <MessageComposer
                campaignId={campaign.id}
                placeholder={c.messagePlaceholder}
                submitLabel={c.send}
                successLabel={locale === "pl" ? "Wiadomosc zostala wyslana." : "Message sent successfully."}
              />
            </div>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
