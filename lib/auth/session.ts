import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/config/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const encoder = new TextEncoder();
const secret = encoder.encode(env.SESSION_SECRET);
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string | null;
};

type SessionPayload = {
  sid: string;
  sub: string;
  role: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function createSession(user: SessionUser) {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
      ipAddress: (await headers()).get("x-forwarded-for") ?? "unknown",
      userAgent: (await headers()).get("user-agent")
    }
  });

  const jwt = await new SignJWT({
    sid: session.id,
    role: user.role,
    tokenHash
  } satisfies Omit<SessionPayload, "sub"> & { tokenHash: string })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(secret);

  (await cookies()).set(SESSION_COOKIE_NAME, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, secret);
    const payload = verified.payload as SessionPayload & { tokenHash: string };
    const session = await prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        tokenHash: payload.tokenHash,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return null;
    }

    return {
      sessionId: session.id,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        companyId: session.user.companyId
      }
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    try {
      const verified = await jwtVerify(token, secret);
      const payload = verified.payload as SessionPayload;
      await prisma.session.deleteMany({
        where: {
          id: payload.sid,
          userId: payload.sub
        }
      });
    } catch {
      // Best-effort session cleanup.
    }
  }

  (await cookies()).set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0)
  });
}
