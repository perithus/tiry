import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { env } from "@/lib/config/env";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { buildSecurityHeaders } from "@/lib/security/http";

const encoder = new TextEncoder();
const secret = encoder.encode(env.SESSION_SECRET);
const securityHeaders = buildSecurityHeaders();

const protectedRoutes: Array<{ prefix: string; roles?: string[] }> = [
  { prefix: "/advertiser", roles: ["ADVERTISER"] },
  { prefix: "/fleet", roles: ["CARRIER_OWNER", "FLEET_MANAGER", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN", "SUPER_ADMIN"] }
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matched = protectedRoutes.find((route) => pathname.startsWith(route.prefix));
  const applyHeaders = (response: NextResponse) => {
    for (const [key, value] of Object.entries(securityHeaders)) {
      response.headers.set(key, value);
    }

    return response;
  };

  if (!matched) {
    return applyHeaders(NextResponse.next());
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return applyHeaders(NextResponse.redirect(new URL("/sign-in", request.url)));
  }

  try {
    const verified = await jwtVerify(token, secret);
    const role = verified.payload.role as string | undefined;
    if (!role || (matched.roles && !matched.roles.includes(role))) {
      return applyHeaders(NextResponse.redirect(new URL("/sign-in", request.url)));
    }

    return applyHeaders(NextResponse.next());
  } catch {
    return applyHeaders(NextResponse.redirect(new URL("/sign-in", request.url)));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
