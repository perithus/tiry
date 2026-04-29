import { NextResponse } from "next/server";
import { AuditAction, UserRole, UserStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signUpSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/security/audit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/http";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { env } from "@/lib/config/env";
import { dashboardHomeByRole } from "@/lib/auth/constants";

export async function POST(request: Request) {
  assertTrustedOrigin(request);
  const limit = consumeRateLimit(`signup:${getClientIp(request.headers)}`, 10, env.RATE_LIMIT_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many sign-up attempts. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const input = signUpSchema.safeParse(body);

  if (!input.success) {
    return NextResponse.json({ error: "Invalid sign-up data." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: {
      email: input.data.email.toLowerCase()
    }
  });

  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: input.data.email.toLowerCase(),
      passwordHash: await hashPassword(input.data.password),
      name: input.data.name,
      role: input.data.role as UserRole,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date()
    }
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId
  });

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.SIGN_UP,
    entityType: "User",
    entityId: user.id
  });

  return NextResponse.json({
    redirectTo: dashboardHomeByRole[user.role] ?? "/"
  });
}
