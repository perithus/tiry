import { z } from "zod";

export const adminUserUpdateSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(["ADVERTISER", "CARRIER_OWNER", "FLEET_MANAGER", "ADMIN", "SUPER_ADMIN"]),
  status: z.enum(["PENDING_VERIFICATION", "ACTIVE", "SUSPENDED", "INVITED"])
});

export const adminCompanyReviewSchema = z.object({
  companyId: z.string().cuid(),
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"]),
  status: z.enum(["DRAFT", "PENDING_VERIFICATION", "VERIFIED", "REJECTED", "SUSPENDED"])
});

export const adminInquiryUpdateSchema = z.object({
  inquiryId: z.string().cuid(),
  status: z.enum(["SUBMITTED", "IN_REVIEW", "OFFER_SENT", "BOOKED", "DECLINED", "CLOSED"])
});

export const adminListingReviewSchema = z.object({
  listingId: z.string().cuid(),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"]),
  verificationStatus: z.enum(["UNVERIFIED", "PENDING", "VERIFIED", "REJECTED"])
});
