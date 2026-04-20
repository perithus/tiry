import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(10)
    .regex(/[A-Z]/, "Password must include an uppercase letter.")
    .regex(/[a-z]/, "Password must include a lowercase letter.")
    .regex(/[0-9]/, "Password must include a number."),
  role: z.enum(["ADVERTISER", "CARRIER_OWNER", "FLEET_MANAGER"])
});

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
