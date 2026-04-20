import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { sendInquiryMessage } from "@/lib/actions/messages";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    title: "Admin control",
    heading: "Conversation oversight",
    subheading: "Monitor inquiry threads, step into conversations, and support both sides when deal flow needs moderation.",
    advertiser: "Advertiser",
    carrier: "Carrier",
    listing: "Listing",
    empty: "No inquiry conversations yet.",
    noMessages: "No messages in this thread yet.",
    placeholder: "Reply as platform admin...",
    send: "Send reply"
  },
  pl: {
    title: "Panel administratora",
    heading: "Nadzór nad rozmowami",
    subheading: "Monitoruj wątki zapytań, wchodź do rozmów i wspieraj obie strony, gdy workflow wymaga moderacji.",
    advertiser: "Reklamodawca",
    carrier: "Przewoźnik",
    listing: "Oferta",
    empty: "Nie ma jeszcze rozmów powiązanych z zapytaniami.",
    noMessages: "W tym wątku nie ma jeszcze wiadomości.",
    placeholder: "Odpowiedz jako administrator platformy...",
    send: "Wyślij odpowiedź"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED" || status === "ACTIVE") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT") return "warning";
  if (status === "DECLINED" || status === "CLOSED") return "danger";
  return "neutral";
}

export default async function AdminMessagesPage() {
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("ADMIN");
  const inquiries = await prisma.campaignInquiry.findMany({
    include: {
      advertiser: { select: { name: true } },
      listing: {
        select: {
          title: true,
          company: { select: { displayName: true } }
        }
      },
      conversation: {
        include: {
          messages: {
            include: {
              sender: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: "asc" }
          }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <div className="grid gap-4">
        {inquiries.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">{t.empty}</div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="glass-panel p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-ink-900">{inquiry.campaignName}</h2>
                <StatusBadge label={inquiry.status.replaceAll("_", " ")} tone={getTone(inquiry.status)} />
              </div>
              <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-3">
                <p><span className="font-medium text-ink-900">{t.advertiser}:</span> {inquiry.advertiser.name}</p>
                <p><span className="font-medium text-ink-900">{t.carrier}:</span> {inquiry.listing.company.displayName}</p>
                <p><span className="font-medium text-ink-900">{t.listing}:</span> {inquiry.listing.title}</p>
              </div>
              <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
                <div className="space-y-3">
                  {inquiry.conversation?.messages.length ? (
                    inquiry.conversation.messages.map((message) => {
                      const own = message.sender.id === session.user.id;
                      return (
                        <div key={message.id} className={own ? "flex justify-end" : "flex justify-start"}>
                          <div className={own ? "max-w-[85%] rounded-[1.5rem] bg-ink-900 px-4 py-3 text-sm text-white" : "max-w-[85%] rounded-[1.5rem] bg-ink-100 px-4 py-3 text-sm text-ink-800"}>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{message.sender.name}</p>
                            <p className="mt-2 whitespace-pre-wrap leading-6">{message.body}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-600">{t.noMessages}</p>
                  )}
                </div>
                <form action={sendInquiryMessage} className="mt-4 grid gap-3">
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <textarea name="body" rows={4} placeholder={t.placeholder} className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm" />
                  <div className="flex justify-end">
                    <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{t.send}</button>
                  </div>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardShell>
  );
}
