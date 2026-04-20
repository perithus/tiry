import { z } from "zod";

export const companyProfileSchema = z.object({
  legalName: z.string().min(2).max(160),
  displayName: z.string().min(2).max(120),
  description: z.string().max(1200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  headquartersCity: z.string().min(2).max(100),
  headquartersCountry: z.string().min(2).max(100),
  fleetSize: z.coerce.number().int().min(1).max(100000)
});

export const companyTeamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  role: z.enum(["FLEET_MANAGER", "CARRIER_OWNER"])
});

export const verificationDocumentSchema = z.object({
  type: z.enum(["COMPANY_REGISTRATION", "VAT_CERTIFICATE", "INSURANCE", "IDENTITY", "OTHER"]),
  filename: z.string().trim().min(3).max(200),
  mimeType: z.string().trim().min(3).max(120),
  sizeBytes: z.coerce.number().int().min(1).max(25_000_000),
  storageKey: z.string().trim().min(4).max(255)
});
