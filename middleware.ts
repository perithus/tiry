import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.SESSION_SECRET ?? "development-only-secret-not-for-prod");

const protectedRoutes: Array<{ prefix: string; roles?: string[] }> = [
  { prefix: "/advertiser", roles: ["ADVERTISER"] },
  { prefix: "/fleet", roles: ["CARRIER_OWNER", "FLEET_MANAGER", "ADMIN", "SUPER_ADMIN"] },
  { prefix: "/admin", roles: ["ADMIN", "SUPER_ADMIN"] }
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const matched = protectedRoutes.find((route) => pathname.startsWith(route.prefix));
  if (!matched) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  try {
    const verified = await jwtVerify(token, secret);
    const role = verified.payload.role as string | undefined;
    if (!role || (matched.roles && !matched.roles.includes(role))) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
}

export const config = {
  matcher: ["/advertiser/:path*", "/fleet/:path*", "/admin/:path*"]
};
