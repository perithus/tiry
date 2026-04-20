import { env } from "@/lib/config/env";

const allowedTypes = env.UPLOAD_ALLOWED_TYPES.split(",").map((value) => value.trim());

export function validateUpload(file: File) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Unsupported file type.");
  }

  const limitBytes = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024;
  if (file.size > limitBytes) {
    throw new Error("File exceeds size limit.");
  }
}
