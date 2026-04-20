import { NextResponse } from "next/server";
import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signInSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/security/audit";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { env } from "@/lib/config/env";
import { dashboardHomeByRole } from "@/lib/auth/constants";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const limit = consumeRateLimit(`signin:${ip}`, 10, env.RATE_LIMIT_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many sign-in attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const input = signInSchema.safeParse(body);
  if (!input.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: input.data.email.toLowerCase() }
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const passwordMatches = await verifyPassword(input.data.password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.SIGN_IN,
    entityType: "User",
    entityId: user.id
  });

  return NextResponse.json({
    redirectTo: dashboardHomeByRole[user.role] ?? "/"
  });
}
