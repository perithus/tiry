import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/config/env";

export type PasswordResetTokenRecord = {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  expiresAt: Date;
};

const tableName = "password_reset_tokens";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function ensurePasswordResetTokensTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      requested_ip TEXT,
      expires_at TIMESTAMP(3) NOT NULL,
      consumed_at TIMESTAMP(3),
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx
    ON ${tableName} (user_id, created_at DESC)
  `);
}

export async function issuePasswordResetToken(input: {
  userId: string;
  requestedIp?: string | null;
}) {
  await ensurePasswordResetTokensTable();
  await deleteExpiredPasswordResetTokens();

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO password_reset_tokens (
      id,
      user_id,
      token_hash,
      requested_ip,
      expires_at
    )
    VALUES (
      ${id},
      ${input.userId},
      ${tokenHash},
      ${input.requestedIp ?? null},
      ${expiresAt}
    )
  `);

  return {
    rawToken,
    expiresAt
  };
}

export async function consumePasswordResetToken(rawToken: string) {
  await ensurePasswordResetTokensTable();
  const tokenHash = sha256(rawToken);

  const rows = await prisma.$queryRaw<Array<PasswordResetTokenRecord>>(Prisma.sql`
    SELECT
      prt.id,
      prt.user_id AS "userId",
      u.email,
      u.name,
      prt.expires_at AS "expiresAt"
    FROM password_reset_tokens prt
    INNER JOIN "User" u
      ON u.id = prt.user_id
    WHERE prt.token_hash = ${tokenHash}
      AND prt.consumed_at IS NULL
      AND prt.expires_at > NOW()
    LIMIT 1
  `);

  const record = rows[0] ?? null;
  if (!record) {
    return null;
  }

  await prisma.$executeRaw(Prisma.sql`
    UPDATE password_reset_tokens
    SET consumed_at = NOW()
    WHERE id = ${record.id}
      AND consumed_at IS NULL
  `);

  return record;
}

export async function deleteExpiredPasswordResetTokens() {
  await ensurePasswordResetTokensTable();

  await prisma.$executeRawUnsafe(`
    DELETE FROM ${tableName}
    WHERE expires_at <= NOW()
       OR consumed_at IS NOT NULL
  `);
}
