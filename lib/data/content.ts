import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import type { Locale } from "@/lib/i18n/shared";

export async function getPublishedContentPage(slug: string, locale: Locale) {
  noStore();

  return prisma.contentPage.findFirst({
    where: {
      slug,
      locale,
      status: "PUBLISHED"
    }
  });
}

export async function getPublishedFaqItems(locale: Locale) {
  noStore();

  return prisma.faqItem.findMany({
    where: {
      locale,
      active: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
  });
}
