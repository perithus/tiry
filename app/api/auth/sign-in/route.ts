import { NextResponse } from "next/server";
import { AuditAction, NotificationType } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { signInSchema } from "@/lib/validation/auth";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { createAuditLog } from "@/lib/security/audit";
import { assertTrustedOrigin, getClientIp } from "@/lib/security/http";
import { detectSignInAnomalies, isSecurityIncidentKind } from "@/lib/security/anomaly";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { env } from "@/lib/config/env";
import { dashboardHomeByRole } from "@/lib/auth/constants";
import { createNotifications } from "@/lib/notifications/service";

function getUserAlertCopy(kind: string) {
  if (kind === "rapid_ip_rotation_sign_in") {
    return {
      title: "Suspicious sign-in pattern detected",
      body: "We noticed sign-ins from multiple network contexts in a short period. Review your active sessions immediately if this was not you."
    };
  }

  if (kind === "session_burst_sign_in") {
    return {
      title: "Unusual sign-in activity detected",
      body: "We noticed an unusual burst of recent sign-ins on your account. Review your active sessions if this activity looks unfamiliar."
    };
  }

  if (kind === "new_network_sign_in") {
    return {
      title: "New network sign-in detected",
      body: "We noticed a sign-in from a new network context. If this was not you, review your active sessions immediately."
    };
  }

  if (kind === "new_user_agent_sign_in") {
    return {
      title: "New browser or device detected",
      body: "We noticed a sign-in from a browser or device we have not seen before. Review your sessions if the activity looks suspicious."
    };
  }

  return {
    title: "New sign-in detected",
    body: "We noticed a sign-in from a new device or network. If this was not you, review your active sessions immediately."
  };
}

function getAdminAlertCopy(email: string, kind: string, severity: "info" | "warning" | "danger") {
  if (severity === "danger") {
    return {
      title: "High-risk sign-in anomaly detected",
      body: `${email} triggered a high-risk sign-in anomaly. Review security logs and recent session activity as soon as possible.`
    };
  }

  if (kind === "new_network_sign_in") {
    return {
      title: "Security alert: new network sign-in",
      body: `${email} signed in from a new network context. Review security logs if the activity looks suspicious.`
    };
  }

  if (kind === "new_user_agent_sign_in") {
    return {
      title: "Security alert: new browser or device",
      body: `${email} signed in from a browser or device that has not been seen before.`
    };
  }

  return {
    title: "Security alert: anomalous sign-in",
    body: `${email} triggered a sign-in anomaly. Review security logs if the activity looks suspicious.`
  };
}

export async function POST(request: Request) {
  assertTrustedOrigin(request);
  const ip = getClientIp(request.headers);
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

  if (user.status === "SUSPENDED") {
    return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
  }

  const passwordMatches = await verifyPassword(input.data.password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const userAgent = request.headers.get("user-agent");
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [knownSessions, recentSignIns] = await Promise.all([
    prisma.session.findMany({
      where: { userId: user.id },
      select: {
        ipAddress: true,
        userAgent: true,
        createdAt: true
      },
      take: 10,
      orderBy: [{ lastSeenAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.auditLog.findMany({
      where: {
        actorId: user.id,
        action: "SIGN_IN",
        createdAt: { gte: oneDayAgo }
      },
      select: {
        ipAddress: true,
        createdAt: true,
        metadata: true
      },
      take: 25,
      orderBy: { createdAt: "desc" }
    })
  ]);
  const anomaly = detectSignInAnomalies({
    ipAddress: ip,
    userAgent,
    historicalSessions: knownSessions.map((session) => ({
      ipAddress: session.ipAddress,
      userAgent: session.userAgent ?? null,
      createdAt: session.createdAt
    })),
    historicalSignIns: recentSignIns.map((entry) => ({
      ipAddress: entry.ipAddress,
      userAgent:
        entry.metadata && typeof entry.metadata === "object" && !Array.isArray(entry.metadata) && typeof entry.metadata.userAgent === "string"
          ? entry.metadata.userAgent
          : null,
      createdAt: entry.createdAt
    }))
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    companyId: user.companyId
  });

  if (isSecurityIncidentKind(anomaly.kind)) {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SUPER_ADMIN"] },
        status: "ACTIVE"
      },
      select: { id: true }
    });
    const userAlert = getUserAlertCopy(anomaly.kind);
    const adminAlert = getAdminAlertCopy(user.email, anomaly.kind, anomaly.severity);

    await createNotifications({
      userIds: [user.id],
      type: NotificationType.SYSTEM,
      title: userAlert.title,
      body: userAlert.body,
      category: "security_alerts"
    });

    await createNotifications({
      userIds: admins.map((admin) => admin.id),
      type: NotificationType.SYSTEM,
      title: adminAlert.title,
      body: adminAlert.body,
      category: "security_alerts"
    });
  }

  await createAuditLog({
    actorId: user.id,
    action: AuditAction.SIGN_IN,
    entityType: "User",
    entityId: user.id,
    ipAddress: ip,
    metadata: {
      kind: anomaly.kind,
      severity: anomaly.severity,
      signals: anomaly.signals,
      userAgent,
      ipAddress: ip,
      signInCount1h: anomaly.signInCount1h,
      distinctIpCount24h: anomaly.distinctIpCount24h
    }
  });

  return NextResponse.json({
    redirectTo: dashboardHomeByRole[user.role] ?? "/"
  });
}
