import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export type NotificationPreferenceCategory =
  | "messages"
  | "offers"
  | "bookings"
  | "campaign_updates"
  | "security_alerts"
  | "verification_updates";

export type NotificationPreferences = Record<NotificationPreferenceCategory, boolean>;

export const defaultNotificationPreferences: NotificationPreferences = {
  messages: true,
  offers: true,
  bookings: true,
  campaign_updates: true,
  security_alerts: true,
  verification_updates: true
};

const tableName = "notification_preferences";

export async function ensureNotificationPreferencesTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ${tableName} (
      user_id TEXT PRIMARY KEY REFERENCES "User"(id) ON DELETE CASCADE,
      messages BOOLEAN NOT NULL DEFAULT TRUE,
      offers BOOLEAN NOT NULL DEFAULT TRUE,
      bookings BOOLEAN NOT NULL DEFAULT TRUE,
      campaign_updates BOOLEAN NOT NULL DEFAULT TRUE,
      security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
      verification_updates BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP(3) NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP(3) NOT NULL DEFAULT NOW()
    )
  `);
}

export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  await ensureNotificationPreferencesTable();

  const rows = await prisma.$queryRaw<Array<NotificationPreferences>>(Prisma.sql`
    SELECT
      messages,
      offers,
      bookings,
      campaign_updates,
      security_alerts,
      verification_updates
    FROM notification_preferences
    WHERE user_id = ${userId}
    LIMIT 1
  `);

  return {
    ...defaultNotificationPreferences,
    ...(rows[0] ?? {})
  };
}

export async function saveNotificationPreferences(userId: string, preferences: NotificationPreferences) {
  await ensureNotificationPreferencesTable();

  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO notification_preferences (
      user_id,
      messages,
      offers,
      bookings,
      campaign_updates,
      security_alerts,
      verification_updates,
      updated_at
    )
    VALUES (
      ${userId},
      ${preferences.messages},
      ${preferences.offers},
      ${preferences.bookings},
      ${preferences.campaign_updates},
      ${preferences.security_alerts},
      ${preferences.verification_updates},
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      messages = EXCLUDED.messages,
      offers = EXCLUDED.offers,
      bookings = EXCLUDED.bookings,
      campaign_updates = EXCLUDED.campaign_updates,
      security_alerts = EXCLUDED.security_alerts,
      verification_updates = EXCLUDED.verification_updates,
      updated_at = NOW()
  `);
}

export async function filterUsersByNotificationPreference(userIds: string[], category?: NotificationPreferenceCategory) {
  const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
  if (!category || uniqueUserIds.length === 0) {
    return uniqueUserIds;
  }

  await ensureNotificationPreferencesTable();

  const rows = await prisma.$queryRaw<Array<{ user_id: string }>>(Prisma.sql`
    SELECT user_id
    FROM notification_preferences
    WHERE user_id IN (${Prisma.join(uniqueUserIds)})
      AND ${Prisma.raw(category)} = FALSE
  `);

  const optedOut = new Set(rows.map((row) => row.user_id));
  return uniqueUserIds.filter((userId) => !optedOut.has(userId));
}
