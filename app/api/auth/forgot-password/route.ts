import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { issuePasswordResetToken } from "@/lib/auth/password-reset";
import { prisma } from "@/lib/db/prisma";
import { buildPasswordResetEmail, sendTransactionalEmail } from "@/lib/email/provider";
import { env } from "@/lib/config/env";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { createAuditLog } from "@/lib/security/audit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/http";
import { forgotPasswordSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  assertTrustedOrigin(request);
  const ip = getClientIp(request.headers);
  const limit = consumeRateLimit(`forgot-password:${ip}`, 5, env.RATE_LIMIT_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many reset attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.toLowerCase()
    },
    select: {
      id: true,
      email: true,
      name: true,
      status: true
    }
  });

  if (user && user.status !== "SUSPENDED") {
    const token = await issuePasswordResetToken({
      userId: user.id,
      requestedIp: ip
    });
    const resetUrl = `${env.APP_URL.replace(/\/+$/, "")}/reset-password?token=${encodeURIComponent(token.rawToken)}`;
    const locale = request.headers.get("x-locale") === "pl" ? "pl" : "en";
    const email = buildPasswordResetEmail({
      locale,
      resetUrl,
      userName: user.name
    });

    await sendTransactionalEmail({
      to: user.email,
      subject: email.subject,
      html: email.html,
      text: email.text
    });

    await createAuditLog({
      actorId: user.id,
      action: AuditAction.USER_UPDATED,
      entityType: "PasswordResetRequest",
      entityId: user.id,
      ipAddress: ip,
      metadata: {
        kind: "password_reset_requested"
      }
    });
  }

  return NextResponse.json({
    ok: true
  });
}
