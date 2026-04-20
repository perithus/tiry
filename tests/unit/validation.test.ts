import { describe, expect, it } from "vitest";
import { signUpSchema } from "@/lib/validation/auth";
import { inquirySchema } from "@/lib/validation/listing";

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
});
