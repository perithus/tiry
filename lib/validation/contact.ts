import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().min(2).max(120).optional().or(z.literal("")),
  subject: z.string().min(3).max(160),
  message: z.string().min(20).max(3000),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: "Privacy consent is required." })
  }),
  marketingConsent: z.boolean().default(false),
  captchaToken: z.string().optional()
});
