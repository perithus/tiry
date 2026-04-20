import { AuditAction } from "@prisma/client";
import { NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { createAuditLog } from "@/lib/security/audit";
import { toActionError } from "@/lib/security/errors";
import { verifyCaptcha } from "@/lib/security/captcha";
import { contactFormSchema } from "@/lib/validation/contact";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const limit = consumeRateLimit(`contact:${ip}`, 8, env.RATE_LIMIT_WINDOW_MS);

    if (!limit.success) {
      return NextResponse.json({ error: "Too many contact requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const input = contactFormSchema.safeParse(body);

    if (!input.success) {
      return NextResponse.json({ error: "Invalid contact request." }, { status: 400 });
    }

    await verifyCaptcha(input.data.captchaToken);

    await createAuditLog({
      action: AuditAction.USER_UPDATED,
      entityType: "ContactRequest",
      metadata: {
        email: input.data.email,
        subject: input.data.subject,
        company: input.data.company ?? null,
        marketingConsent: input.data.marketingConsent
      },
      ipAddress: ip
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: toActionError(error) }, { status: 400 });
  }
}
