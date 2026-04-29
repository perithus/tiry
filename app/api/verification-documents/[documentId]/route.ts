import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getPrivateUploadAbsolutePath } from "@/lib/storage/provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { documentId } = await params;
  const document = await prisma.verificationDocument.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      filename: true,
      storageKey: true,
      mimeType: true,
      companyId: true,
      userId: true
    }
  });

  if (!document) {
    return new NextResponse("Not found", { status: 404 });
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
  const isOwnCompany = Boolean(session.user.companyId && document.companyId && session.user.companyId === document.companyId);
  const isOwnDocument = document.userId === session.user.id;

  if (!isAdmin && !isOwnCompany && !isOwnDocument) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const privatePath = getPrivateUploadAbsolutePath(document.storageKey);
  const legacyPublicPath = path.join(process.cwd(), "public", "uploads", document.storageKey.replace(/^\/+/, ""));
  const absolutePath = existsSync(privatePath) ? privatePath : legacyPublicPath;

  if (!existsSync(absolutePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readFile(absolutePath);
  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": document.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${document.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store, max-age=0"
    }
  });
}
