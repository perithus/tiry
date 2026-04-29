import { z } from "zod";

export const campaignStatusValues = [
  "DRAFT",
  "PLANNING",
  "NEGOTIATION",
  "READY_TO_BOOK",
  "ACTIVE",
  "COMPLETED",
  "CANCELLED"
] as const;

export const campaignPriorityValues = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const campaignSourceValues = ["MARKETPLACE_INQUIRY", "DIRECT_SALES", "REFERRAL", "PARTNER", "OTHER"] as const;
export const campaignTaskStatusValues = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;
export const campaignMilestoneStatusValues = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"] as const;

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalNonNegativeInt = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  z.coerce.number().int().nonnegative().optional()
);

export const campaignSchema = z
  .object({
    name: z.string().trim().min(3).max(120),
    advertiserId: z.string().cuid(),
    companyId: z.string().cuid().optional().or(z.literal("")),
    primaryListingId: z.string().cuid().optional().or(z.literal("")),
    inquiryId: z.string().cuid().optional().or(z.literal("")),
    ownerId: z.string().cuid().optional().or(z.literal("")),
    status: z.enum(campaignStatusValues),
    priority: z.enum(campaignPriorityValues),
    source: z.enum(campaignSourceValues),
    brief: z.string().trim().max(5000).optional().or(z.literal("")),
    internalSummary: z.string().trim().max(3000).optional().or(z.literal("")),
    budgetCents: optionalNonNegativeInt,
    currency: z.string().trim().length(3).default("EUR"),
    plannedStartDate: optionalDate,
    plannedEndDate: optionalDate
  })
  .refine(
    (input) => {
      if (!input.plannedStartDate || !input.plannedEndDate) {
        return true;
      }

      return new Date(input.plannedEndDate) >= new Date(input.plannedStartDate);
    },
    {
      message: "Planned end date must be after the planned start date.",
      path: ["plannedEndDate"]
    }
  );

export const campaignNoteSchema = z.object({
  campaignId: z.string().cuid(),
  body: z.string().trim().min(5).max(2000)
});

export const campaignTaskSchema = z.object({
  campaignId: z.string().cuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1500).optional().or(z.literal("")),
  assigneeId: z.string().cuid().optional().or(z.literal("")),
  dueDate: optionalDate
});

export const campaignStatusUpdateSchema = z.object({
  campaignId: z.string().cuid(),
  status: z.enum(campaignStatusValues)
});

export const campaignDetailsUpdateSchema = z
  .object({
    campaignId: z.string().cuid(),
    name: z.string().trim().min(3).max(120),
    priority: z.enum(campaignPriorityValues),
    ownerId: z.string().cuid().optional().or(z.literal("")),
    budgetCents: optionalNonNegativeInt,
    currency: z.string().trim().length(3).default("EUR"),
    plannedStartDate: optionalDate,
    plannedEndDate: optionalDate,
    bookedStartDate: optionalDate,
    bookedEndDate: optionalDate,
    brief: z.string().trim().max(5000).optional().or(z.literal("")),
    internalSummary: z.string().trim().max(3000).optional().or(z.literal(""))
  })
  .refine(
    (input) => {
      if (!input.plannedStartDate || !input.plannedEndDate) {
        return true;
      }

      return new Date(input.plannedEndDate) >= new Date(input.plannedStartDate);
    },
    {
      message: "Planned end date must be after the planned start date.",
      path: ["plannedEndDate"]
    }
  )
  .refine(
    (input) => {
      if (!input.bookedStartDate || !input.bookedEndDate) {
        return true;
      }

      return new Date(input.bookedEndDate) >= new Date(input.bookedStartDate);
    },
    {
      message: "Booked end date must be after the booked start date.",
      path: ["bookedEndDate"]
    }
  );

export const campaignTaskStatusUpdateSchema = z.object({
  taskId: z.string().cuid(),
  campaignId: z.string().cuid(),
  status: z.enum(campaignTaskStatusValues)
});

export const campaignTaskDetailsUpdateSchema = z.object({
  taskId: z.string().cuid(),
  campaignId: z.string().cuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(1500).optional().or(z.literal("")),
  assigneeId: z.string().cuid().optional().or(z.literal("")),
  dueDate: optionalDate,
  status: z.enum(campaignTaskStatusValues)
});

export const campaignFileUploadSchema = z.object({
  campaignId: z.string().cuid(),
  label: z.string().trim().max(120).optional().or(z.literal(""))
});

export const campaignMilestoneSchema = z.object({
  campaignId: z.string().cuid(),
  title: z.string().trim().min(3).max(160),
  phase: z.string().trim().min(2).max(60),
  assigneeId: z.string().cuid().optional().or(z.literal("")),
  dueDate: optionalDate,
  status: z.enum(campaignMilestoneStatusValues)
});

export const campaignMilestoneUpdateSchema = campaignMilestoneSchema.extend({
  milestoneId: z.string().uuid()
});

export const adminCampaignWrapUpSchema = z.object({
  campaignId: z.string().cuid(),
  deliverySummary: z.string().trim().max(3000).optional().or(z.literal("")),
  proofOfDelivery: z.string().trim().max(3000).optional().or(z.literal("")),
  internalOutcome: z.string().trim().max(2000).optional().or(z.literal("")),
  renewalOpportunity: z.string().trim().max(120).optional().or(z.literal("")),
  followUpOwner: z.string().trim().max(120).optional().or(z.literal(""))
});

export const participantCampaignWrapUpSchema = z.object({
  campaignId: z.string().cuid(),
  feedback: z.string().trim().max(2000).optional().or(z.literal("")),
  rating: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.coerce.number().int().min(1).max(5).optional()
  )
});

export const campaignFromInquirySchema = z.object({
  inquiryId: z.string().cuid()
});

export type CampaignInput = z.infer<typeof campaignSchema>;
