import { unstable_noStore as noStore } from "next/cache";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { duplicateCampaignOffer, saveCampaignOffer, withdrawCampaignOffer } from "@/lib/actions/offers";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getFleetNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";
import { expireStaleOffers, parseOfferTerms } from "@/lib/utils/offers";

const copy = {
  en: {
    offerTitle: "Offer title",
    offerTerms: "Commercial terms",
    offerPrice: "Price (cents)",
    offerCurrency: "Currency",
    bookedFrom: "Booked from",
    bookedTo: "Booked to",
    expiresAt: "Expires at",
    submitOffer: "Send offer",
    saveDraft: "Save draft",
    updateOffer: "Update offer",
    duplicateOffer: "Duplicate",
    withdrawOffer: "Withdraw",
    sentOffers: "Offers sent",
    advertiser: "Advertiser",
    listing: "Listing",
    noOffers: "No offers yet.",
    lifecycle: "Offer lifecycle",
    expiresLabel: "Expires"
  },
  pl: {
    offerTitle: "Tytul oferty",
    offerTerms: "Warunki handlowe",
    offerPrice: "Cena (w centach)",
    offerCurrency: "Waluta",
    bookedFrom: "Rezerwacja od",
    bookedTo: "Rezerwacja do",
    expiresAt: "Wygasa",
    submitOffer: "Wyslij oferte",
    saveDraft: "Zapisz draft",
    updateOffer: "Zapisz zmiany",
    duplicateOffer: "Duplikuj",
    withdrawOffer: "Wycofaj",
    sentOffers: "Wyslane oferty",
    advertiser: "Reklamodawca",
    listing: "Oferta",
    noOffers: "Brak ofert.",
    lifecycle: "Lifecycle oferty",
    expiresLabel: "Wygasa"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED" || status === "ACCEPTED") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT" || status === "SENT" || status === "DRAFT") return "warning";
  if (status === "DECLINED" || status === "REJECTED" || status === "CLOSED" || status === "EXPIRED") return "danger";
  return "neutral";
}

export default async function FleetInquiriesPage() {
  noStore();
  const locale = await getLocale();
  const t = getMessages(locale);
  const c = copy[locale];
  const session = await requireRole("CARRIER_OWNER");
  await expireStaleOffers();

  const inquiries = await prisma.campaignInquiry.findMany({
    where: {
      listing: {
        companyId: session.user.companyId ?? "missing-company"
      }
    },
    include: {
      advertiser: true,
      listing: true,
      offers: {
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.fleet.title}
      nav={getFleetNav(locale)}
      heading={t.dashboard.fleet.inquiriesHeading}
      subheading={t.dashboard.fleet.inquiriesSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry.id} className="glass-panel p-6">
            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-ink-900">{inquiry.campaignName}</h3>
                  <StatusBadge label={inquiry.status.replaceAll("_", " ")} tone={getTone(inquiry.status)} />
                </div>
                <div className="grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                  <p>
                    <span className="font-medium text-ink-900">{c.advertiser}:</span> {inquiry.advertiser.name}
                  </p>
                  <p>
                    <span className="font-medium text-ink-900">{c.listing}:</span> {inquiry.listing.title}
                  </p>
                </div>
                <p className="text-sm leading-6 text-ink-700">{inquiry.message}</p>

                <div className="rounded-[1.5rem] border border-ink-100 bg-white/80 p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{c.sentOffers}</h4>
                  <div className="mt-3 space-y-3">
                    {inquiry.offers.length === 0 ? (
                      <p className="text-sm text-ink-600">{c.noOffers}</p>
                    ) : (
                      inquiry.offers.map((offer) => {
                        const terms = parseOfferTerms(offer.terms);

                        return (
                          <div key={offer.id} className="rounded-2xl border border-ink-100 px-4 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-ink-900">{offer.title}</p>
                                <p className="mt-1 text-sm text-ink-600">
                                  {new Intl.NumberFormat("en-GB", {
                                    style: "currency",
                                    currency: offer.currency,
                                    maximumFractionDigits: 0
                                  }).format(offer.priceCents / 100)}
                                </p>
                              </div>
                              <StatusBadge label={offer.status} tone={getTone(offer.status)} />
                            </div>
                            {offer.expiresAt ? (
                              <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink-500">
                                {c.expiresLabel}: {offer.expiresAt.toISOString().slice(0, 10)}
                              </p>
                            ) : null}

                            <div className="mt-4 grid gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4">
                              <p className="text-xs uppercase tracking-[0.16em] text-ink-500">{c.lifecycle}</p>
                              <form action={saveCampaignOffer} className="grid gap-3">
                                <input type="hidden" name="offerId" value={offer.id} />
                                <input type="hidden" name="inquiryId" value={inquiry.id} />
                                <input name="title" defaultValue={offer.title} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                                <textarea
                                  name="terms"
                                  rows={3}
                                  defaultValue={terms.body ?? ""}
                                  className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                                />
                                <div className="grid gap-3 md:grid-cols-2">
                                  <input name="priceCents" type="number" min={1} defaultValue={offer.priceCents} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                                  <input name="currency" defaultValue={offer.currency} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <input name="bookedFrom" type="date" defaultValue={terms.bookedFrom ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                                  <input name="bookedTo" type="date" defaultValue={terms.bookedTo ?? ""} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                                </div>
                                <input
                                  name="expiresAt"
                                  type="date"
                                  defaultValue={offer.expiresAt ? offer.expiresAt.toISOString().slice(0, 10) : ""}
                                  className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                                />
                                <div className="flex flex-wrap gap-3">
                                  <button name="submitMode" value="draft" className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                                    {c.saveDraft}
                                  </button>
                                  <button name="submitMode" value="send" className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                                    {c.updateOffer}
                                  </button>
                                </div>
                              </form>

                              <div className="flex flex-wrap gap-3">
                                <form action={duplicateCampaignOffer}>
                                  <input type="hidden" name="offerId" value={offer.id} />
                                  <button className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                                    {c.duplicateOffer}
                                  </button>
                                </form>
                                {offer.status !== "ACCEPTED" ? (
                                  <form action={withdrawCampaignOffer}>
                                    <input type="hidden" name="offerId" value={offer.id} />
                                    <button className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100">
                                      {c.withdrawOffer}
                                    </button>
                                  </form>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              <form action={saveCampaignOffer} className="grid gap-3 rounded-[1.75rem] border border-ink-100 bg-white/80 p-5">
                <input type="hidden" name="inquiryId" value={inquiry.id} />
                <Field label={c.offerTitle}>
                  <input name="title" defaultValue={`${inquiry.campaignName} offer`} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                </Field>
                <Field label={c.offerTerms}>
                  <textarea
                    name="terms"
                    rows={4}
                    defaultValue={`Placement for ${inquiry.campaignName} including production coordination and route allocation.`}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                </Field>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={c.offerPrice}>
                    <input name="priceCents" type="number" min={1} defaultValue={450000} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  </Field>
                  <Field label={c.offerCurrency}>
                    <input name="currency" defaultValue="EUR" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  </Field>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label={c.bookedFrom}>
                    <input name="bookedFrom" type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  </Field>
                  <Field label={c.bookedTo}>
                    <input name="bookedTo" type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  </Field>
                </div>
                <Field label={c.expiresAt}>
                  <input name="expiresAt" type="date" className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                </Field>
                <div className="flex flex-wrap gap-3">
                  <button name="submitMode" value="draft" className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50">
                    {c.saveDraft}
                  </button>
                  <button name="submitMode" value="send" className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">
                    {c.submitOffer}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ))}
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
