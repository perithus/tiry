import { DashboardShell } from "@/components/layout/dashboard-shell";
import { StatusBadge } from "@/components/shared/status-badge";
import { sendInquiryMessage } from "@/lib/actions/messages";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdvertiserNav } from "@/lib/data/navigation";
import { getMessages } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/server";

const copy = {
  en: {
    counterpart: "Carrier",
    listing: "Listing",
    status: "Status",
    empty: "No conversation threads yet. Start the first message from one of your inquiries.",
    noMessages: "No messages in this thread yet.",
    placeholder: "Write a message to the fleet team...",
    send: "Send message"
  },
  pl: {
    counterpart: "Przewoźnik",
    listing: "Oferta",
    status: "Status",
    empty: "Nie ma jeszcze wątków rozmów. Wyślij pierwszą wiadomość z poziomu jednego ze swoich zapytań.",
    noMessages: "W tym wątku nie ma jeszcze wiadomości.",
    placeholder: "Napisz wiadomość do zespołu floty...",
    send: "Wyślij wiadomość"
  }
} as const;

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (status === "BOOKED" || status === "ACTIVE" || status === "VERIFIED") return "success";
  if (status === "SUBMITTED" || status === "IN_REVIEW" || status === "OFFER_SENT" || status === "PENDING") return "warning";
  if (status === "DECLINED" || status === "CLOSED" || status === "REJECTED" || status === "SUSPENDED") return "danger";
  return "neutral";
}

export default async function AdvertiserMessagesPage() {
  const locale = await getLocale();
  const t = getMessages(locale);
  const c = copy[locale];
  const session = await requireRole("ADVERTISER");
  const inquiries = await prisma.campaignInquiry.findMany({
    where: { advertiserId: session.user.id },
    include: {
      listing: {
        select: {
          title: true,
          company: {
            select: {
              displayName: true
            }
          }
        }
      },
      conversation: {
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true
                }
              }
            },
            orderBy: { createdAt: "asc" }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <DashboardShell
      title={t.dashboard.advertiser.title}
      nav={getAdvertiserNav(locale)}
      heading={t.dashboard.advertiser.messagesHeading}
      subheading={t.dashboard.advertiser.messagesSubheading}
      locale={locale}
    >
      <div className="grid gap-4">
        {inquiries.length === 0 ? (
          <div className="glass-panel p-8 text-sm text-ink-600">{c.empty}</div>
        ) : (
          inquiries.map((inquiry) => (
            <div key={inquiry.id} className="glass-panel p-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-ink-900">{inquiry.campaignName}</h2>
                <StatusBadge label={inquiry.status.replaceAll("_", " ")} tone={getTone(inquiry.status)} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-3">
                <p>
                  <span className="font-medium text-ink-900">{c.counterpart}:</span> {inquiry.listing.company.displayName}
                </p>
                <p>
                  <span className="font-medium text-ink-900">{c.listing}:</span> {inquiry.listing.title}
                </p>
                <p>
                  <span className="font-medium text-ink-900">{c.status}:</span> {inquiry.status.replaceAll("_", " ")}
                </p>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
                <div className="space-y-3">
                  {inquiry.conversation?.messages.length ? (
                    inquiry.conversation.messages.map((message) => {
                      const own = message.sender.id === session.user.id;
                      return (
                        <div key={message.id} className={own ? "flex justify-end" : "flex justify-start"}>
                          <div
                            className={
                              own
                                ? "max-w-[85%] rounded-[1.5rem] bg-ink-900 px-4 py-3 text-sm text-white"
                                : "max-w-[85%] rounded-[1.5rem] bg-ink-100 px-4 py-3 text-sm text-ink-800"
                            }
                          >
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{message.sender.name}</p>
                            <p className="mt-2 whitespace-pre-wrap leading-6">{message.body}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-600">{c.noMessages}</p>
                  )}
                </div>

                <form action={sendInquiryMessage} className="mt-4 grid gap-3">
                  <input type="hidden" name="inquiryId" value={inquiry.id} />
                  <textarea
                    name="body"
                    rows={4}
                    placeholder={c.placeholder}
                    className="w-full rounded-2xl border border-ink-200 bg-white px-4 py-3 text-sm"
                  />
                  <div className="flex justify-end">
                    <button className="rounded-2xl bg-ink-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-ink-800">{c.send}</button>
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
