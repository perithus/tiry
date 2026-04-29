"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { defaultNotificationPreferences, saveNotificationPreferences } from "@/lib/notifications/preferences";

export async function markNotificationRead(formData: FormData) {
  const session = await requireSession();
  const notificationId = String(formData.get("notificationId") ?? "");
  if (!notificationId) {
    throw new Error("Notification id is required.");
  }

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId: session.user.id
    },
    data: {
      readAt: new Date()
    }
  });

  revalidatePath("/advertiser/notifications");
  revalidatePath("/fleet/notifications");
  revalidatePath("/admin/notifications");
}

export async function markAllNotificationsRead() {
  const session = await requireSession();

  await prisma.notification.updateMany({
    where: {
      userId: session.user.id,
      readAt: null
    },
    data: {
      readAt: new Date()
    }
  });

  revalidatePath("/advertiser/notifications");
  revalidatePath("/fleet/notifications");
  revalidatePath("/admin/notifications");
}

export async function saveNotificationPreferencesAction(formData: FormData) {
  const session = await requireSession();
  const redirectPath = String(formData.get("redirectPath") ?? "");

  await saveNotificationPreferences(session.user.id, {
    messages: formData.get("messages") === "on",
    offers: formData.get("offers") === "on",
    bookings: formData.get("bookings") === "on",
    campaign_updates: formData.get("campaign_updates") === "on",
    security_alerts: formData.get("security_alerts") === "on",
    verification_updates: formData.get("verification_updates") === "on"
  });

  revalidatePath("/advertiser/settings");
  revalidatePath("/fleet/settings");
  revalidatePath("/admin/notifications");
  revalidatePath("/advertiser/notifications");
  revalidatePath("/fleet/notifications");

  if (redirectPath) {
    revalidatePath(redirectPath);
  }
}
