import { z } from "zod";

export const advertiserProfileSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(160),
  avatarUrl: z.string().trim().url().optional().or(z.literal(""))
});

export const advertiserPasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(10)
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[a-z]/, "Password must include a lowercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string().min(1)
  })
  .refine((input) => input.newPassword === input.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"]
  });

export const savedListingSchema = z.object({
  listingId: z.string().cuid()
});
