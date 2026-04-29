"use server";

import { AuditAction } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/permissions";
import { destroySession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";

export async function revokeSession(formData: FormData) {
  const session = await requireSession();
  const targetSessionId = String(formData.get("sessionId") ?? "");

  if (!targetSessionId) {
    throw new Error("Session is required.");
  }

  const target = await prisma.session.findFirst({
    where: {
      id: targetSessionId,
      userId: session.user.id
    },
    select: {
      id: true
    }
  });

  if (!target) {
    throw new Error("Session not found.");
  }

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.SIGN_OUT,
    entityType: "Session",
    entityId: target.id,
    metadata: {
      kind: target.id === session.sessionId ? "current_session_revoke" : "session_revoke"
    }
  });

  if (target.id === session.sessionId) {
    await destroySession();
  } else {
    await prisma.session.deleteMany({
      where: {
        id: target.id,
        userId: session.user.id
      }
    });
  }

  revalidateSecurityViews();
}

export async function revokeOtherSessions() {
  const session = await requireSession();

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      NOT: {
        id: session.sessionId
      }
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.SIGN_OUT,
    entityType: "Session",
    entityId: session.sessionId,
    metadata: {
      kind: "revoke_other_sessions"
    }
  });

  revalidateSecurityViews();
}

function revalidateSecurityViews() {
  revalidatePath("/advertiser/settings");
  revalidatePath("/fleet/settings");
  revalidatePath("/admin/audit-logs");
}
