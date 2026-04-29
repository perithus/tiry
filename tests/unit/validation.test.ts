import { describe, expect, it } from "vitest";
import { hasMinimumRole } from "@/lib/auth/permissions";
import { validateUploadFile } from "@/lib/security/uploads";
import { forgotPasswordSchema, resetPasswordSchema, signUpSchema } from "@/lib/validation/auth";
import { blocksBookingWindow, rangesOverlap } from "@/lib/utils/bookings";
import { campaignMilestoneSchema, campaignTaskDetailsUpdateSchema, participantCampaignWrapUpSchema } from "@/lib/validation/campaign";
import { companyProfileSchema, companyTeamMemberAccessSchema, fleetOwnerProfileSchema } from "@/lib/validation/company";
import { inquirySchema } from "@/lib/validation/listing";
import { campaignOfferLifecycleSchema } from "@/lib/validation/offer";

describe("validation schemas", () => {
  it("accepts a strong sign-up payload", () => {
    const result = signUpSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "StrongPass123",
      role: "ADVERTISER"
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak passwords", () => {
    const result = signUpSchema.safeParse({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "weakpass",
      role: "ADVERTISER"
    });

    expect(result.success).toBe(false);
  });

  it("accepts forgot password payloads", () => {
    const result = forgotPasswordSchema.safeParse({
      email: "ada@example.com"
    });

    expect(result.success).toBe(true);
  });

  it("accepts password reset payloads with matching passwords", () => {
    const result = resetPasswordSchema.safeParse({
      token: "1234567890123456789012345678901234567890",
      password: "StrongPass123",
      confirmPassword: "StrongPass123"
    });

    expect(result.success).toBe(true);
  });

  it("normalizes comma-delimited target countries in inquiries", () => {
    const result = inquirySchema.safeParse({
      listingId: "ck1234567890123456789012",
      campaignName: "Retail launch",
      message: "We need a high-visibility cross-border activation for our launch window.",
      targetCountries: "Poland, Germany"
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.targetCountries).toEqual(["Poland", "Germany"]);
    }
  });

  it("accepts team member access updates", () => {
    const result = companyTeamMemberAccessSchema.safeParse({
      memberId: "cm9abcdefghijklmnopqrstuv",
      role: "FLEET_MANAGER",
      status: "ACTIVE"
    });

    expect(result.success).toBe(true);
  });

  it("keeps carrier owners above fleet managers in RBAC", () => {
    expect(hasMinimumRole("CARRIER_OWNER", "FLEET_MANAGER")).toBe(true);
    expect(hasMinimumRole("FLEET_MANAGER", "CARRIER_OWNER")).toBe(false);
  });

  it("detects overlapping booking windows", () => {
    expect(rangesOverlap(new Date("2026-05-01"), new Date("2026-05-10"), new Date("2026-05-08"), new Date("2026-05-15"))).toBe(true);
    expect(rangesOverlap(new Date("2026-05-01"), new Date("2026-05-05"), new Date("2026-05-06"), new Date("2026-05-09"))).toBe(false);
  });

  it("marks only live booking states as blocking", () => {
    expect(blocksBookingWindow("CONFIRMED")).toBe(true);
    expect(blocksBookingWindow("ACTIVE")).toBe(true);
    expect(blocksBookingWindow("COMPLETED")).toBe(false);
  });

  it("accepts an allowed verification upload", () => {
    const file = new File([Uint8Array.from([0x25, 0x50, 0x44, 0x46, 0x2d])], "insurance.pdf", { type: "application/pdf" });

    return expect(validateUploadFile(file)).resolves.toBeUndefined();
  });

  it("rejects unsupported verification upload types", () => {
    const file = new File(["sample"], "script.exe", { type: "application/x-msdownload" });

    return expect(validateUploadFile(file)).rejects.toThrow("This file type is not allowed.");
  });

  it("rejects files whose bytes do not match the declared type", () => {
    const file = new File([Uint8Array.from([0x4d, 0x5a, 0x90, 0x00])], "fake.pdf", { type: "application/pdf" });

    return expect(validateUploadFile(file)).rejects.toThrow("The uploaded file content does not match its declared type.");
  });

  it("accepts extended company profile fields", () => {
    const result = companyProfileSchema.safeParse({
      legalName: "Fleet Group Sp. z o.o.",
      displayName: "Fleet Group",
      description: "Carrier inventory operator",
      websiteUrl: "https://fleet.example.com",
      email: "ops@fleet.example.com",
      phone: "+48123123123",
      vatNumber: "PL1234567890",
      headquartersCity: "Poznan",
      headquartersCountry: "Poland",
      fleetSize: 24
    });

    expect(result.success).toBe(true);
  });

  it("accepts fleet owner profile updates", () => {
    const result = fleetOwnerProfileSchema.safeParse({
      name: "Owner Name",
      email: "owner@example.com",
      phone: "+48111111111",
      avatarUrl: "https://example.com/avatar.png"
    });

    expect(result.success).toBe(true);
  });

  it("accepts campaign task detail updates", () => {
    const result = campaignTaskDetailsUpdateSchema.safeParse({
      taskId: "cm9abcdefghijklmnopqrstuv",
      campaignId: "cm9abcdefghijklmnopqrstuw",
      title: "Confirm creative installation slot",
      description: "Coordinate installation timing with the carrier team.",
      assigneeId: "cm9abcdefghijklmnopqrstux",
      dueDate: "2026-05-12",
      status: "IN_PROGRESS"
    });

    expect(result.success).toBe(true);
  });

  it("accepts offer lifecycle payloads for draft saves", () => {
    const result = campaignOfferLifecycleSchema.safeParse({
      offerId: "cm9abcdefghijklmnopqrstuv",
      inquiryId: "cm9abcdefghijklmnopqrstuw",
      title: "Transit launch package",
      terms: "Placement, production coordination, and route allocation for a two-week campaign window.",
      priceCents: 450000,
      currency: "EUR",
      expiresAt: "2026-05-22",
      bookedFrom: "2026-05-10",
      bookedTo: "2026-05-24",
      submitMode: "draft"
    });

    expect(result.success).toBe(true);
  });

  it("accepts campaign milestone payloads", () => {
    const result = campaignMilestoneSchema.safeParse({
      campaignId: "cm9abcdefghijklmnopqrstuv",
      title: "Approve final artwork",
      phase: "Creative approval",
      assigneeId: "cm9abcdefghijklmnopqrstuw",
      dueDate: "2026-05-18",
      status: "IN_PROGRESS"
    });

    expect(result.success).toBe(true);
  });

  it("accepts participant wrap-up feedback", () => {
    const result = participantCampaignWrapUpSchema.safeParse({
      campaignId: "cm9abcdefghijklmnopqrstuv",
      feedback: "Delivery went smoothly and we want to renew in Q3.",
      rating: 5
    });

    expect(result.success).toBe(true);
  });
});
