import Link from "next/link";
import { updateInboxThreadStateAction } from "@/lib/actions/messages";
import { MessageComposer } from "@/components/dashboard/message-composer";
import { StatusBadge } from "@/components/shared/status-badge";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/lib/i18n/shared";

type InboxThread = {
  id: string;
  type: "inquiry" | "campaign";
  title: string;
  counterpart: string;
  context: string;
  status: string;
  latestAt: Date;
  latestPreview: string;
  unreadCount: number;
  pinned: boolean;
  archived: boolean;
  closed: boolean;
};

type InboxMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: Date;
};

type ActiveThread = InboxThread & {
  emptyBody: string;
  placeholder: string;
  submitLabel: string;
  successLabel: string;
  inquiryId?: string;
  campaignId?: string;
  messages: InboxMessage[];
};

function getTone(status: string): "neutral" | "success" | "warning" | "danger" {
  if (["BOOKED", "ACTIVE", "VERIFIED", "COMPLETED", "CONFIRMED", "ACCEPTED"].includes(status)) return "success";
  if (["SUBMITTED", "IN_REVIEW", "OFFER_SENT", "PENDING", "PLANNING", "NEGOTIATION", "READY_TO_BOOK"].includes(status)) return "warning";
  if (["DECLINED", "CLOSED", "REJECTED", "SUSPENDED", "CANCELLED"].includes(status)) return "danger";
  return "neutral";
}

export function InboxView({
  locale,
  basePath,
  filter,
  filters,
  threads,
  activeThread,
  emptyThreadsLabel,
  emptyActiveLabel,
  ownUserId,
  threadLabel,
  copy
}: {
  locale: Locale;
  basePath: string;
  filter: string;
  filters: Array<{ key: string; label: string }>;
  threads: InboxThread[];
  activeThread: ActiveThread | null;
  emptyThreadsLabel: string;
  emptyActiveLabel: string;
  ownUserId: string;
  threadLabel: string;
  copy: {
    pinned: string;
    archived: string;
    closed: string;
    pin: string;
    unpin: string;
    archive: string;
    unarchive: string;
    close: string;
    reopen: string;
    composerClosed: string;
  };
}) {
  return (
    <div className="space-y-4">
      <div className="sticky top-20 z-20 -mx-1 overflow-x-auto px-1 pb-2">
        <div className="inline-flex min-w-full gap-2 rounded-[1.75rem] border border-white/70 bg-sand/90 p-2 shadow-sm backdrop-blur sm:flex sm:flex-wrap">
          {filters.map((item) => (
            <Link
              key={item.key}
              aria-current={filter === item.key ? "page" : undefined}
              href={item.key === "all" ? basePath : `${basePath}?filter=${item.key}`}
              className={
                filter === item.key
                  ? "whitespace-nowrap rounded-2xl bg-ink-900 px-4 py-2 text-sm font-medium text-white"
                  : "whitespace-nowrap rounded-2xl border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-900 hover:bg-ink-50"
              }
            >
              <span className="inline-flex items-center gap-2">
                <span>{item.label}</span>
                {item.key === "unread" ? (
                  <span
                    className={
                      filter === item.key ? "rounded-full bg-white/20 px-2 py-0.5 text-xs" : "rounded-full bg-ink-100 px-2 py-0.5 text-xs text-ink-700"
                    }
                  >
                    {threads.filter((thread) => thread.unreadCount > 0).length}
                  </span>
                ) : null}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.28fr]">
        <div className="glass-panel p-4">
          <div className="mb-4 flex items-center justify-between gap-3 px-2">
            <h2 className="font-display text-xl font-semibold text-ink-900">{threadLabel}</h2>
            <StatusBadge label={String(threads.length)} tone="neutral" />
          </div>
          <div aria-label={threadLabel} className="space-y-2" role="list">
            {threads.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/70 p-4 text-sm text-ink-600">{emptyThreadsLabel}</div>
            ) : (
              threads.map((thread) => {
                const href =
                  filter === "all"
                    ? `${basePath}?thread=${thread.type}:${thread.id}`
                    : `${basePath}?filter=${filter}&thread=${thread.type}:${thread.id}`;
                const selected = activeThread?.id === thread.id && activeThread.type === thread.type;

                return (
                  <Link
                    key={`${thread.type}:${thread.id}`}
                    aria-current={selected ? "page" : undefined}
                    href={href}
                    className={cn(
                      "block rounded-[1.5rem] border px-4 py-4 transition hover:border-ink-300 hover:bg-white focus-visible:ring-2 focus-visible:ring-teal-500",
                      selected ? "border-ink-900 bg-white shadow-sm" : "border-ink-100 bg-white/75"
                    )}
                    role="listitem"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-ink-900">{thread.title}</p>
                          <StatusBadge label={thread.type === "campaign" ? "CAMPAIGN" : "INQUIRY"} tone="neutral" />
                          {thread.unreadCount > 0 ? <StatusBadge label={`${thread.unreadCount} NEW`} tone="warning" /> : null}
                          {thread.pinned ? <StatusBadge label={copy.pinned} tone="success" /> : null}
                          {thread.archived ? <StatusBadge label={copy.archived} tone="neutral" /> : null}
                          {thread.closed ? <StatusBadge label={copy.closed} tone="danger" /> : null}
                        </div>
                        <p className="mt-1 text-sm text-ink-600">{thread.counterpart}</p>
                      </div>
                      <span className="shrink-0 text-xs uppercase tracking-[0.16em] text-ink-500">
                        {thread.latestAt.toLocaleDateString(locale === "pl" ? "pl-PL" : "en-GB")}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-600">{thread.latestPreview}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusBadge label={thread.status.replaceAll("_", " ")} tone={getTone(thread.status)} />
                      <span className="text-xs uppercase tracking-[0.16em] text-ink-500">{thread.context}</span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-6">
          {activeThread ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-display text-2xl font-semibold text-ink-900">{activeThread.title}</h2>
                <StatusBadge label={activeThread.status.replaceAll("_", " ")} tone={getTone(activeThread.status)} />
                <StatusBadge label={activeThread.type === "campaign" ? "CAMPAIGN" : "INQUIRY"} tone="neutral" />
                {activeThread.unreadCount > 0 ? <StatusBadge label={`${activeThread.unreadCount} NEW`} tone="warning" /> : null}
                {activeThread.pinned ? <StatusBadge label={copy.pinned} tone="success" /> : null}
                {activeThread.archived ? <StatusBadge label={copy.archived} tone="neutral" /> : null}
                {activeThread.closed ? <StatusBadge label={copy.closed} tone="danger" /> : null}
              </div>

              <div className="mt-4 grid gap-2 text-sm text-ink-600 md:grid-cols-2">
                <p>
                  <span className="font-medium text-ink-900">{locale === "pl" ? "Druga strona" : "Counterpart"}:</span> {activeThread.counterpart}
                </p>
                <p>
                  <span className="font-medium text-ink-900">{locale === "pl" ? "Kontekst" : "Context"}:</span> {activeThread.context}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <ThreadStateButton
                  label={activeThread.pinned ? copy.unpin : copy.pin}
                  action="pinned"
                  currentValue={activeThread.pinned}
                  nextValue={!activeThread.pinned}
                  threadId={activeThread.id}
                  threadType={activeThread.type}
                  redirectPath={`${basePath}?filter=${filter}&thread=${activeThread.type}:${activeThread.id}`}
                />
                <ThreadStateButton
                  label={activeThread.archived ? copy.unarchive : copy.archive}
                  action="archived"
                  currentValue={activeThread.archived}
                  nextValue={!activeThread.archived}
                  threadId={activeThread.id}
                  threadType={activeThread.type}
                  redirectPath={`${basePath}?filter=${filter}&thread=${activeThread.type}:${activeThread.id}`}
                />
                <ThreadStateButton
                  label={activeThread.closed ? copy.reopen : copy.close}
                  action="closed"
                  currentValue={activeThread.closed}
                  nextValue={!activeThread.closed}
                  threadId={activeThread.id}
                  threadType={activeThread.type}
                  redirectPath={`${basePath}?filter=${filter}&thread=${activeThread.type}:${activeThread.id}`}
                />
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-ink-100 bg-white/85 p-4">
                <div aria-label={locale === "pl" ? "Historia wiadomosci" : "Message history"} className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
                  {activeThread.messages.length > 0 ? (
                    activeThread.messages.map((message) => {
                      const own = message.senderId === ownUserId;

                      return (
                        <div key={message.id} className={own ? "flex justify-end" : "flex justify-start"}>
                          <div
                            className={
                              own
                                ? "max-w-[85%] rounded-[1.5rem] bg-ink-900 px-4 py-3 text-sm text-white"
                                : "max-w-[85%] rounded-[1.5rem] bg-ink-100 px-4 py-3 text-sm text-ink-800"
                            }
                          >
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
                              <span>{message.senderName}</span>
                              <span>{message.createdAt.toLocaleString(locale === "pl" ? "pl-PL" : "en-GB")}</span>
                            </div>
                            <p className="mt-2 whitespace-pre-wrap leading-6">{message.body}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-ink-600">{activeThread.emptyBody}</p>
                  )}
                </div>

                {activeThread.closed ? (
                  <div className="mt-4 rounded-[1.25rem] border border-dashed border-ink-200 bg-white/80 p-4 text-sm text-ink-600">
                    {copy.composerClosed}
                  </div>
                ) : (
                  <MessageComposer
                    inquiryId={activeThread.inquiryId}
                    campaignId={activeThread.campaignId}
                    placeholder={activeThread.placeholder}
                    submitLabel={activeThread.submitLabel}
                    successLabel={activeThread.successLabel}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-ink-200 bg-white/70 p-6 text-sm text-ink-600">{emptyActiveLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function ThreadStateButton({
  label,
  action,
  currentValue,
  nextValue,
  threadId,
  threadType,
  redirectPath
}: {
  label: string;
  action: "pinned" | "archived" | "closed";
  currentValue: boolean;
  nextValue: boolean;
  threadId: string;
  threadType: "inquiry" | "campaign";
  redirectPath: string;
}) {
  return (
    <form action={updateInboxThreadStateAction}>
      <input type="hidden" name="action" value={action} />
      <input type="hidden" name="nextValue" value={String(nextValue)} />
      <input type="hidden" name="threadId" value={threadId} />
      <input type="hidden" name="threadType" value={threadType} />
      <input type="hidden" name="redirectPath" value={redirectPath} />
      <button
        aria-label={label}
        aria-pressed={currentValue}
        type="submit"
        className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:bg-ink-50"
      >
        {label}
      </button>
    </form>
  );
}
