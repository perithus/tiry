import { NextResponse } from "next/server";
import { InquiryStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { createNotifications } from "@/lib/notifications/service";
import { getSession } from "@/lib/auth/session";
import { inquirySchema } from "@/lib/validation/listing";
import { assertTrustedOrigin } from "@/lib/security/http";
import { consumeRateLimit } from "@/lib/rate-limit/memory";
import { env } from "@/lib/config/env";

export async function POST(request: Request) {
  assertTrustedOrigin(request);
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

  const listing = await prisma.listing.findUnique({
    where: { id: inquiry.listingId },
    include: {
      company: {
        include: {
          users: {
            where: {
              role: { in: ["CARRIER_OWNER", "FLEET_MANAGER"] }
            },
            select: { id: true }
          }
        }
      }
    }
  });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    select: { id: true }
  });

  await createNotifications({
    userIds: [
      ...(listing?.company.users.map((user) => user.id) ?? []),
      ...admins.map((admin) => admin.id)
    ],
    type: "INQUIRY",
    title: `New inquiry: ${inquiry.campaignName}`,
    body: `${session.user.name} submitted an inquiry for ${listing?.title ?? "a listing"}.`,
    category: "campaign_updates"
  });

  return NextResponse.json({ inquiryId: inquiry.id });
}
