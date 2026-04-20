"use server";

import { AuditAction, ContentPageStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/permissions";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { contentPageSchema, faqItemSchema } from "@/lib/validation/content";

export async function upsertContentPage(formData: FormData) {
  const session = await requireRole("ADMIN");

  const parsed = contentPageSchema.safeParse({
    slug: formData.get("slug"),
    locale: formData.get("locale"),
    title: formData.get("title"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    status: formData.get("status")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid content page payload.");
  }

  const page = await prisma.contentPage.upsert({
    where: {
      slug_locale: {
        slug: parsed.data.slug,
        locale: parsed.data.locale
      }
    },
    update: {
      title: parsed.data.title,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
      excerpt: parsed.data.excerpt || undefined,
      body: parsed.data.body,
      status: parsed.data.status as ContentPageStatus,
      editedById: session.user.id,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
    },
    create: {
      slug: parsed.data.slug,
      locale: parsed.data.locale,
      title: parsed.data.title,
      seoTitle: parsed.data.seoTitle || undefined,
      seoDescription: parsed.data.seoDescription || undefined,
      excerpt: parsed.data.excerpt || undefined,
      body: parsed.data.body,
      status: parsed.data.status as ContentPageStatus,
      editedById: session.user.id,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.CONTENT_PAGE_UPDATED,
    entityType: "ContentPage",
    entityId: page.id,
    metadata: { slug: page.slug, locale: page.locale, status: page.status }
  });

  revalidatePath("/admin/content");
  revalidatePath(`/${page.slug === "home" ? "" : page.slug}`);
  revalidatePath("/faq");
  revalidatePath("/privacy-policy");
  revalidatePath("/terms");
}

export async function createFaqItem(formData: FormData) {
  const session = await requireRole("ADMIN");

  const parsed = faqItemSchema.safeParse({
    locale: formData.get("locale"),
    question: formData.get("question"),
    answer: formData.get("answer"),
    category: formData.get("category"),
    sortOrder: formData.get("sortOrder"),
    active: formData.get("active")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid FAQ payload.");
  }

  const item = await prisma.faqItem.create({
    data: {
      locale: parsed.data.locale,
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category || undefined,
      sortOrder: parsed.data.sortOrder,
      active: parsed.data.active,
      editedById: session.user.id
    }
  });

  await createAuditLog({
    actorId: session.user.id,
    action: AuditAction.FAQ_ITEM_UPDATED,
    entityType: "FaqItem",
    entityId: item.id,
    metadata: { locale: item.locale, category: item.category, active: item.active }
  });

  revalidatePath("/admin/content");
  revalidatePath("/faq");
}
