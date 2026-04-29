import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { canAccessCampaignFiles, getCampaignFileAccessContext, getCampaignFileById } from "@/lib/campaign-files";
import { getSession } from "@/lib/auth/session";
import { getPrivateUploadAbsolutePath } from "@/lib/storage/provider";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { fileId } = await params;
  const fileRecord = await getCampaignFileById(fileId);

  if (!fileRecord) {
    return new NextResponse("Not found", { status: 404 });
  }

  const campaign = await getCampaignFileAccessContext(fileRecord.campaignId);
  if (!campaign) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!canAccessCampaignFiles(session.user, campaign)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const absolutePath = getPrivateUploadAbsolutePath(fileRecord.storageKey);
  if (!existsSync(absolutePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const file = await readFile(absolutePath);
  return new NextResponse(file, {
    status: 200,
    headers: {
      "Content-Type": fileRecord.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileRecord.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store, max-age=0"
    }
  });
}
