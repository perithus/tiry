import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { CampaignCreateForm } from "@/components/forms/campaign-create-form";
import { StatusBadge } from "@/components/shared/status-badge";
import { addCampaignNote } from "@/lib/actions/campaigns";
import { requireRole } from "@/lib/auth/permissions";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { prisma } from "@/lib/db/prisma";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    emptyTitle: "No campaigns yet",
    emptyBody: "Create your first campaign or connect one to an existing inquiry.",
    linkedListing: "Listing",
    owner: "Owner",
    booking: "Booking",
    budget: "Budget",
    noBooking: "No booking yet",
    notes: "CRM notes",
    details: "Open workspace",
    notePlaceholder: "Add planning context, campaign detail, or an execution update.",
    addNote: "Add note",
    noNotes: "No notes yet."
  },
  pl: {
    emptyTitle: "Brak kampanii",
    emptyBody: "Utwórz swoją pierwszą kampanię albo podepnij ją pod istniejące inquiry.",
    linkedListing: "Oferta",
    owner: "Owner",
    booking: "Booking",
    budget: "Budżet",
    noBooking: "Brak bookingu",
    notes: "Notatki CRM",
    details: "Otwórz workspace",
    notePlaceholder: "Dodaj kontekst planowania, szczegół kampanii albo update realizacyjny.",
    addNote: "Dodaj notatkę",
    noNotes: "Brak notatek."
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "ACTIVE" || status === "COMPLETED" || status === "CONFIRMED") return "success";
  if (status === "NEGOTIATION" || status === "READY_TO_BOOK" || status === "PENDING" || status === "PLANNING") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

function formatCurrency(amountInCents?: number | null, currency = "EUR") {
  if (amountInCents == null) return "Custom";
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amountInCents / 100);
}

export default async function AdvertiserCampaignsPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const c = copy[locale];
  const session = await requireRole("ADVERTISER");

  const [campaigns, listings, inquiries] = await Promise.all([
    prisma.campaign.findMany({
      where: { advertiserId: session.user.id },
      include: {
        owner: true,
        primaryListing: true,
        inquiry: {
          include: {
            booking: true,
            offers: {
              where: { status: "ACCEPTED" },
              take: 1
            }
          }
        },
        notes: {
          include: {
            author: true
          },
          orderBy: { createdAt: "desc" },
          take: 5
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    prisma.listing.findMany({
      where: { status: "ACTIVE", verificationStatus: "VERIFIED" },
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        company: {
          select: {
            displayName: true
          }
        }
      }
    }),
    prisma.campaignInquiry.findMany({
      where: { advertiserId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        campaignName: true,
        listing: {
          select: {
            title: true
          }
        }
      }
    })
  ]);

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.campaignsHeading}
      subheading={t.dashboard.advertiser.campaignsSubheading}
      locale={locale}
    >
      <CampaignCreateForm
        locale={locale}
        advertisers={[
          {
            id: session.user.id,
            label: `${session.user.name} (${session.user.email})`
          }
        ]}
        companies={[]}
        listings={listings.map((listing) => ({
          id: listing.id,
          label: `${listing.title} · ${listing.company.displayName}`
        }))}
        inquiries={inquiries.map((inquiry) => ({
          id: inquiry.id,
          label: `${inquiry.campaignName} · ${inquiry.listing.title}`
        }))}
        owners={[]}
        redirectBase="/advertiser/campaigns"
        appendCampaignIdToRedirect={false}
        allowOwnerAssignment={false}
        allowCompanyLinking={false}
      />

      <div className="grid gap-4">
        {campaigns.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">
            <h2 className="font-display text-2xl font-semibold text-ink-900">{c.emptyTitle}</h2>
            <p className="mt-2">{c.emptyBody}</p>
          </div>
        ) : (
          campaigns.map((campaign) => {
            const booking = campaign.inquiry?.booking;
            const acceptedOffer = campaign.inquiry?.offers[0];
            return (
              <div key={campaign.id} className="glass-panel p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="font-display text-2xl font-semibold text-ink-900">{campaign.name}</h2>
                    <StatusBadge label={campaign.status} tone={getTone(campaign.status)} />
                    {booking ? <StatusBadge label={booking.status} tone={getTone(booking.status)} /> : null}
                  </div>
                  <Link
                    href={`/advertiser/campaigns/${campaign.id}`}
                    className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
                  >
                    {c.details}
                  </Link>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p>{c.linkedListing}: {campaign.primaryListing?.title ?? "N/A"}</p>
                  <p>{c.owner}: {campaign.owner?.name ?? "N/A"}</p>
                  <p>{c.budget}: {formatCurrency(campaign.budgetCents, campaign.currency)}</p>
                  <p>
                    {c.booking}:{" "}
                    {booking
                      ? `${booking.bookedFrom.toISOString().slice(0, 10)} - ${booking.bookedTo.toISOString().slice(0, 10)}`
                      : c.noBooking}
                  </p>
                </div>

                {acceptedOffer ? (
                  <div className="mt-4 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                    <p className="font-medium text-ink-900">{acceptedOffer.title}</p>
                    <p className="mt-1 text-sm text-ink-600">{formatCurrency(acceptedOffer.priceCents, acceptedOffer.currency)}</p>
                  </div>
                ) : null}

                <div className="mt-4 rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{c.notes}</h3>
                  <form action={addCampaignNote} className="mt-4 grid gap-3">
                    <input type="hidden" name="campaignId" value={campaign.id} />
                    <textarea
                      name="body"
                      rows={4}
                      placeholder={c.notePlaceholder}
                      className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                    />
                    <div className="flex justify-end">
                      <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{c.addNote}</button>
                    </div>
                  </form>
                  <div className="mt-4 space-y-3">
                    {campaign.notes.length === 0 ? (
                      <p className="text-sm text-ink-600">{c.noNotes}</p>
                    ) : (
                      campaign.notes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-ink-100 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-500">{note.author.name}</p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-700">{note.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
