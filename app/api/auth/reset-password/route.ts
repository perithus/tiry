import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { consumePasswordResetToken } from "@/lib/auth/password-reset";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/config/env";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { createAuditLog } from "@/lib/security/audit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/http";
import { resetPasswordSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  assertTrustedOrigin(request);
  const ip = getClientIp(request.headers);
  const limit = consumeRateLimit(`reset-password:${ip}`, 10, env.RATE_LIMIT_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many password reset attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid request." }, { status: 400 });
  }

  const tokenRecord = await consumePasswordResetToken(parsed.data.token);
  if (!tokenRecord) {
    return NextResponse.json({ error: "This password reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: {
        passwordHash
      }
    });

    await tx.session.deleteMany({
      where: {
        userId: tokenRecord.userId
      }
    });
  });

  await createAuditLog({
    actorId: tokenRecord.userId,
    action: AuditAction.USER_UPDATED,
    entityType: "PasswordReset",
    entityId: tokenRecord.userId,
    ipAddress: ip,
    metadata: {
      kind: "password_reset_completed"
    }
  });

  return NextResponse.json({
    ok: true,
    redirectTo: "/sign-in"
  });
}
