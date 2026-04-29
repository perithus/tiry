import { unstable_noStore as noStore } from "next/cache";
import { InboxView } from "@/components/dashboard/inbox-view";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { getAdminNav } from "@/lib/data/navigation";
import { getInboxThreadStates } from "@/lib/inbox/thread-state";
import { getLocale } from "@/lib/i18n/server";
import { countUnreadMessages } from "@/lib/utils/inbox";
import { parseCampaignMessage } from "@/lib/utils/campaign-messages";

const copy = {
  en: {
    title: "Admin control",
    heading: "Conversation oversight",
    subheading: "Monitor inquiry and campaign threads, step into conversations, and support both sides from one inbox.",
    all: "All threads",
    unread: "Unread",
    pinned: "Pinned",
    archived: "Archived",
    closed: "Closed",
    inquiry: "Inquiry threads",
    campaign: "Campaign threads",
    emptyThreads: "No conversation threads yet.",
    emptyActive: "Choose a thread to review the conversation and continue messaging.",
    noInquiryMessages: "No messages in this inquiry thread yet.",
    noCampaignMessages: "No campaign messages yet.",
    inquiryPlaceholder: "Reply as platform admin...",
    campaignPlaceholder: "Reply inside the campaign thread...",
    send: "Send reply",
    success: "Message sent successfully.",
    threads: "Inbox threads",
    pinnedBadge: "PINNED",
    archivedBadge: "ARCHIVED",
    closedBadge: "CLOSED",
    pin: "Pin thread",
    unpin: "Unpin thread",
    archive: "Archive thread",
    unarchive: "Restore thread",
    close: "Close thread",
    reopen: "Reopen thread",
    composerClosed: "This thread is closed. Reopen it to send a new message."
  },
  pl: {
    title: "Panel administratora",
    heading: "Nadzor nad rozmowami",
    subheading: "Monitoruj watki zapytan i kampanii, wchodz do rozmow i wspieraj obie strony z jednego inboxu.",
    all: "Wszystkie watki",
    unread: "Nieprzeczytane",
    pinned: "Przypiete",
    archived: "Zarchiwizowane",
    closed: "Zamkniete",
    inquiry: "Watki zapytan",
    campaign: "Watki kampanii",
    emptyThreads: "Brak watkow rozmow.",
    emptyActive: "Wybierz watek, aby zobaczyc rozmowe i odpowiedziec.",
    noInquiryMessages: "W tym watku zapytania nie ma jeszcze wiadomosci.",
    noCampaignMessages: "W tej kampanii nie ma jeszcze wiadomosci.",
    inquiryPlaceholder: "Odpowiedz jako administrator platformy...",
    campaignPlaceholder: "Odpowiedz w watku kampanii...",
    send: "Wyslij odpowiedz",
    success: "Wiadomosc zostala wyslana.",
    threads: "Watki inboxu",
    pinnedBadge: "PRZYPIN",
    archivedBadge: "ARCHIWUM",
    closedBadge: "ZAMKNIETE",
    pin: "Przypnij watek",
    unpin: "Odepnij watek",
    archive: "Archiwizuj watek",
    unarchive: "Przywroc watek",
    close: "Zamknij watek",
    reopen: "Otworz ponownie",
    composerClosed: "Ten watek jest zamkniety. Otworz go ponownie, aby wyslac nowa wiadomosc."
  }
} as const;

export default async function AdminMessagesPage({
  searchParams
}: {
  searchParams?: Promise<{ filter?: string; thread?: string }>;
}) {
  noStore();
  const locale = await getLocale();
  const t = copy[locale];
  const session = await requireRole("ADMIN");
  const params = (await searchParams) ?? {};
  const filter = params.filter ?? "all";

  const [inquiries, campaigns, threadStates] = await Promise.all([
    prisma.campaignInquiry.findMany({
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
    }),
    prisma.campaign.findMany({
      include: {
        advertiser: {
          select: {
            name: true
          }
        },
        company: {
          select: {
            displayName: true
          }
        },
        notes: {
          where: {
            body: {
              startsWith: "[campaign-message]"
            }
          },
          include: {
            author: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { createdAt: "asc" }
        }
      },
      orderBy: { updatedAt: "desc" }
    }),
    getInboxThreadStates(session.user.id)
  ]);
  const threadStateMap = new Map(threadStates.map((state) => [`${state.threadType}:${state.threadId}`, state] as const));

  const inquiryThreads = inquiries.map((inquiry) => {
    const latestMessage = inquiry.conversation?.messages.at(-1);
    const messages =
      inquiry.conversation?.messages.map((message) => ({
        senderId: message.sender.id
      })) ?? [];

    return {
      id: inquiry.id,
      type: "inquiry" as const,
      title: inquiry.campaignName,
      counterpart: `${inquiry.advertiser.name} / ${inquiry.listing.company.displayName}`,
      context: inquiry.listing.title,
      status: inquiry.status,
      latestAt: latestMessage?.createdAt ?? inquiry.updatedAt,
      latestPreview: latestMessage?.body ?? inquiry.message,
      unreadCount: countUnreadMessages(messages, session.user.id),
      pinned: threadStateMap.get(`inquiry:${inquiry.id}`)?.pinned ?? false,
      archived: threadStateMap.get(`inquiry:${inquiry.id}`)?.archived ?? false,
      closed: threadStateMap.get(`inquiry:${inquiry.id}`)?.closed ?? false
    };
  });

  const campaignThreads = campaigns.map((campaign) => {
    const latestMessage = campaign.notes.at(-1);
    const messages = campaign.notes.map((note) => ({
      senderId: note.author.id
    }));

    return {
      id: campaign.id,
      type: "campaign" as const,
      title: campaign.name,
      counterpart: `${campaign.advertiser.name} / ${campaign.company?.displayName ?? (locale === "pl" ? "Brak floty" : "No fleet")}`,
      context: campaign.internalSummary ?? campaign.brief ?? (locale === "pl" ? "Kampania CRM" : "CRM campaign"),
      status: campaign.status,
      latestAt: latestMessage?.createdAt ?? campaign.updatedAt,
      latestPreview: latestMessage ? parseCampaignMessage(latestMessage.body) : campaign.brief ?? campaign.internalSummary ?? campaign.name,
      unreadCount: countUnreadMessages(messages, session.user.id),
      pinned: threadStateMap.get(`campaign:${campaign.id}`)?.pinned ?? false,
      archived: threadStateMap.get(`campaign:${campaign.id}`)?.archived ?? false,
      closed: threadStateMap.get(`campaign:${campaign.id}`)?.closed ?? false
    };
  });

  const sortThreads = <T extends { pinned: boolean; latestAt: Date }>(items: T[]) =>
    items.sort((left, right) => {
      if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
      return right.latestAt.getTime() - left.latestAt.getTime();
    });

  const allThreads = sortThreads([...inquiryThreads, ...campaignThreads]);
  const threads = [...(filter !== "campaign" ? inquiryThreads : []), ...(filter !== "inquiry" ? campaignThreads : [])]
    .filter((thread) => {
      if (filter === "unread") return thread.unreadCount > 0;
      if (filter === "pinned") return thread.pinned;
      if (filter === "archived") return thread.archived;
      if (filter === "closed") return thread.closed;
      return true;
    });
  const filteredThreads = sortThreads(threads);

  const activeThreadKey = params.thread ?? (filteredThreads[0] ? `${filteredThreads[0].type}:${filteredThreads[0].id}` : null);
  const [activeType, activeId] = activeThreadKey?.split(":") ?? [];

  const activeThread =
    activeType === "inquiry"
      ? (() => {
          const inquiry = inquiries.find((item) => item.id === activeId);
          if (!inquiry) return null;

          return {
            id: inquiry.id,
            type: "inquiry" as const,
            title: inquiry.campaignName,
            counterpart: `${inquiry.advertiser.name} / ${inquiry.listing.company.displayName}`,
            context: inquiry.listing.title,
            status: inquiry.status,
            latestAt: inquiry.conversation?.messages.at(-1)?.createdAt ?? inquiry.updatedAt,
            latestPreview: inquiry.conversation?.messages.at(-1)?.body ?? inquiry.message,
            unreadCount: countUnreadMessages(
              inquiry.conversation?.messages.map((message) => ({ senderId: message.sender.id })) ?? [],
              session.user.id
            ),
            pinned: threadStateMap.get(`inquiry:${inquiry.id}`)?.pinned ?? false,
            archived: threadStateMap.get(`inquiry:${inquiry.id}`)?.archived ?? false,
            closed: threadStateMap.get(`inquiry:${inquiry.id}`)?.closed ?? false,
            emptyBody: t.noInquiryMessages,
            placeholder: t.inquiryPlaceholder,
            submitLabel: t.send,
            successLabel: t.success,
            inquiryId: inquiry.id,
            messages:
              inquiry.conversation?.messages.map((message) => ({
                id: message.id,
                senderId: message.sender.id,
                senderName: message.sender.name,
                body: message.body,
                createdAt: message.createdAt
              })) ?? []
          };
        })()
      : activeType === "campaign"
        ? (() => {
            const campaign = campaigns.find((item) => item.id === activeId);
            if (!campaign) return null;

            return {
              id: campaign.id,
              type: "campaign" as const,
              title: campaign.name,
              counterpart: `${campaign.advertiser.name} / ${campaign.company?.displayName ?? (locale === "pl" ? "Brak floty" : "No fleet")}`,
              context: campaign.internalSummary ?? campaign.brief ?? (locale === "pl" ? "Kampania CRM" : "CRM campaign"),
              status: campaign.status,
              latestAt: campaign.notes.at(-1)?.createdAt ?? campaign.updatedAt,
              latestPreview:
                campaign.notes.at(-1) ? parseCampaignMessage(campaign.notes.at(-1)!.body) : campaign.brief ?? campaign.internalSummary ?? campaign.name,
              unreadCount: countUnreadMessages(
                campaign.notes.map((note) => ({
                  senderId: note.author.id
                })),
                session.user.id
              ),
              pinned: threadStateMap.get(`campaign:${campaign.id}`)?.pinned ?? false,
              archived: threadStateMap.get(`campaign:${campaign.id}`)?.archived ?? false,
              closed: threadStateMap.get(`campaign:${campaign.id}`)?.closed ?? false,
              emptyBody: t.noCampaignMessages,
              placeholder: t.campaignPlaceholder,
              submitLabel: t.send,
              successLabel: t.success,
              campaignId: campaign.id,
              messages: campaign.notes.map((note) => ({
                id: note.id,
                senderId: note.author.id,
                senderName: note.author.name,
                body: parseCampaignMessage(note.body),
                createdAt: note.createdAt
              }))
            };
          })()
        : null;

  return (
    <DashboardShell title={t.title} nav={getAdminNav(locale)} heading={t.heading} subheading={t.subheading} locale={locale}>
      <InboxView
        locale={locale}
        basePath="/admin/messages"
        filter={filter}
        filters={[
          { key: "all", label: t.all },
          { key: "unread", label: t.unread },
          { key: "pinned", label: t.pinned },
          { key: "archived", label: t.archived },
          { key: "closed", label: t.closed },
          { key: "inquiry", label: t.inquiry },
          { key: "campaign", label: t.campaign }
        ]}
        threads={filter === "all" ? allThreads : filteredThreads}
        activeThread={activeThread}
        emptyThreadsLabel={t.emptyThreads}
        emptyActiveLabel={t.emptyActive}
        ownUserId={session.user.id}
        threadLabel={t.threads}
        copy={{
          pinned: t.pinnedBadge,
          archived: t.archivedBadge,
          closed: t.closedBadge,
          pin: t.pin,
          unpin: t.unpin,
          archive: t.archive,
          unarchive: t.unarchive,
          close: t.close,
          reopen: t.reopen,
          composerClosed: t.composerClosed
        }}
      />
    </DashboardShell>
  );
}
