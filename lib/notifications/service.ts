import { NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { filterUsersByNotificationPreference } from "@/lib/notifications/preferences";

export async function createNotifications(input: {
  userIds: string[];
  type: NotificationType;
  title: string;
  body: string;
  category?: "messages" | "offers" | "bookings" | "campaign_updates" | "security_alerts" | "verification_updates";
}) {
  const uniqueUserIds = [...new Set(input.userIds.filter(Boolean))];
  if (uniqueUserIds.length === 0) return;
  const eligibleUserIds = await filterUsersByNotificationPreference(uniqueUserIds, input.category);
  if (eligibleUserIds.length === 0) return;

  await prisma.notification.createMany({
    data: eligibleUserIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body
    }))
  });
}
