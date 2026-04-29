import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const PUBLIC_UPLOAD_ROOT = path.join(process.cwd(), "public", "uploads");
const PRIVATE_UPLOAD_ROOT = path.join(process.cwd(), "storage", "private-uploads");

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function saveUploadedFile(input: {
  file: File;
  folder: string;
  visibility?: "public" | "private";
}) {
  const extension = path.extname(input.file.name) || "";
  const safeBase = sanitizeFilename(path.basename(input.file.name, extension));
  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeBase}${extension}`;
  const relativeFolder = input.folder.replace(/^\/+|\/+$/g, "");
  const relativePath = path.posix.join(relativeFolder, uniqueName);
  const root = input.visibility === "private" ? PRIVATE_UPLOAD_ROOT : PUBLIC_UPLOAD_ROOT;
  const absoluteDir = path.join(root, relativeFolder);
  const absolutePath = path.join(root, relativePath);

  await mkdir(absoluteDir, { recursive: true });
  const arrayBuffer = await input.file.arrayBuffer();
  await writeFile(absolutePath, Buffer.from(arrayBuffer));

  return {
    storageKey: relativePath,
    url: input.visibility === "private" ? null : `/uploads/${relativePath}`
  };
}

export function getPublicUploadUrl(storageKey: string) {
  return `/uploads/${storageKey.replace(/^\/+/, "")}`;
}

export function getPrivateUploadAbsolutePath(storageKey: string) {
  return path.join(PRIVATE_UPLOAD_ROOT, storageKey.replace(/^\/+/, ""));
}
