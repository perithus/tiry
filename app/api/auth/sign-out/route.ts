import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { assertTrustedOrigin } from "@/lib/security/http";

export async function POST(request: Request) {
  assertTrustedOrigin(request);
  await destroySession();
  return NextResponse.json({ ok: true });
}
