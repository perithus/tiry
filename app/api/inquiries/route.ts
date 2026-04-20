import { NextResponse } from "next/server";
import { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { inquirySchema } from "@/lib/validation/listing";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { env } from "@/lib/config/env";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in to submit an inquiry." }, { status: 401 });
  }

  const limit = consumeRateLimit(`inquiry:${session.user.id}`, 15, env.RATE_LIMIT_WINDOW_MS);
  if (!limit.success) {
    return NextResponse.json({ error: "Too many inquiries. Please try again later." }, { status: 429 });
  }

  const body = await request.json();
  const input = inquirySchema.safeParse(body);

  if (!input.success) {
    return NextResponse.json({ error: "Invalid inquiry payload." }, { status: 400 });
  }

  const inquiry = await prisma.campaignInquiry.create({
    data: {
      advertiserId: session.user.id,
      listingId: input.data.listingId,
      campaignName: input.data.campaignName,
      message: input.data.message,
      budgetMinCents: input.data.budgetMinCents,
      budgetMaxCents: input.data.budgetMaxCents,
      desiredStartDate: input.data.desiredStartDate ? new Date(input.data.desiredStartDate) : undefined,
      desiredEndDate: input.data.desiredEndDate ? new Date(input.data.desiredEndDate) : undefined,
      targetCountries: input.data.targetCountries,
      status: InquiryStatus.SUBMITTED
    }
  });

  return NextResponse.json({ inquiryId: inquiry.id });
}
