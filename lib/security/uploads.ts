import { env } from "@/lib/config/env";

function hasAllowedSignature(mimeType: string, bytes: Uint8Array) {
  if (mimeType === "application/pdf") {
    return bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }

  if (mimeType === "image/png") {
    return bytes.length >= 8 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a;
  }

  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (mimeType === "image/webp") {
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50
    );
  }

  return false;
}

export async function validateUploadFile(file: File) {
  if (!file || file.size === 0) {
    throw new Error("Please select a file.");
  }

  const allowedTypes = env.UPLOAD_ALLOWED_TYPES.split(",").map((item) => item.trim()).filter(Boolean);
  const maxBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new Error(`File is too large. Maximum size is ${env.UPLOAD_MAX_FILE_SIZE_MB} MB.`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error("This file type is not allowed.");
  }

  const headerBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasAllowedSignature(file.type, headerBytes)) {
    throw new Error("The uploaded file content does not match its declared type.");
  }
}
