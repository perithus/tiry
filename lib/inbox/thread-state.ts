import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type InboxThreadType = "inquiry" | "campaign";

export type InboxThreadState = {
  threadId: string;
  threadType: InboxThreadType;
  pinned: boolean;
  archived: boolean;
  closed: boolean;
};

const tableName = "inbox_thread_state";

export async function ensureInboxThreadStateTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      thread_type TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      pinned BOOLEAN NOT NULL DEFAULT FALSE,
      archived BOOLEAN NOT NULL DEFAULT FALSE,
      closed BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, thread_type, thread_id)
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS inbox_thread_state_user_updated_idx
    ON ${tableName} (user_id, updated_at DESC)
  `);
}

export async function getInboxThreadStates(userId: string) {
  await ensureInboxThreadStateTable();

  const rows = await prisma.$queryRaw<Array<InboxThreadState>>(Prisma.sql`
    SELECT
      thread_id AS "threadId",
      thread_type AS "threadType",
      pinned,
      archived,
      closed
    FROM inbox_thread_state
    WHERE user_id = ${userId}
  `);

  return rows;
}

export async function upsertInboxThreadState(input: {
  userId: string;
  threadId: string;
  threadType: InboxThreadType;
  patch: Partial<Pick<InboxThreadState, "pinned" | "archived" | "closed">>;
}) {
  await ensureInboxThreadStateTable();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO inbox_thread_state (
      user_id,
      thread_type,
      thread_id,
      pinned,
      archived,
      closed,
      updated_at
    )
    VALUES (
      ${input.userId},
      ${input.threadType},
      ${input.threadId},
      ${input.patch.pinned ?? false},
      ${input.patch.archived ?? false},
      ${input.patch.closed ?? false},
      NOW()
    )
    ON CONFLICT (user_id, thread_type, thread_id) DO UPDATE SET
      pinned = COALESCE(${input.patch.pinned}, inbox_thread_state.pinned),
      archived = COALESCE(${input.patch.archived}, inbox_thread_state.archived),
      closed = COALESCE(${input.patch.closed}, inbox_thread_state.closed),
      updated_at = NOW()
  `);
}
