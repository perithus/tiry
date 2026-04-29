import { z } from "zod";

export const companyProfileSchema = z.object({
  legalName: z.string().min(2).max(160),
  displayName: z.string().min(2).max(120),
  description: z.string().max(1200).optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  vatNumber: z.string().trim().max(80).optional().or(z.literal("")),
  headquartersCity: z.string().min(2).max(100),
  headquartersCountry: z.string().min(2).max(100),
  fleetSize: z.coerce.number().int().min(1).max(100000)
});

export const fleetOwnerProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  avatarUrl: z.string().trim().url().optional().or(z.literal(""))
});

export const companyTeamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  role: z.enum(["FLEET_MANAGER", "CARRIER_OWNER"])
});

export const companyTeamMemberAccessSchema = z.object({
  memberId: z.string().cuid(),
  role: z.enum(["FLEET_MANAGER", "CARRIER_OWNER"]),
  status: z.enum(["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "INVITED"])
});

export const verificationDocumentSchema = z.object({
  type: z.enum(["COMPANY_REGISTRATION", "VAT_CERTIFICATE", "INSURANCE", "IDENTITY", "OTHER"]),
  filename: z.string().trim().min(3).max(200),
  mimeType: z.string().trim().min(3).max(120),
  sizeBytes: z.coerce.number().int().min(1).max(25_000_000),
  storageKey: z.string().trim().min(4).max(255)
});

export const verificationDocumentUploadSchema = z.object({
  type: z.enum(["COMPANY_REGISTRATION", "VAT_CERTIFICATE", "INSURANCE", "IDENTITY", "OTHER"])
});
