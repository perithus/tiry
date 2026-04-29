import { prisma } from "@/lib/db/prisma";

export async function getCampaignActivityLogs(campaignId: string, take = 20) {
  return prisma.auditLog.findMany({
    where: {
      OR: [
        {
          entityType: "Campaign",
          entityId: campaignId
        },
        {
          metadata: {
            path: ["campaignId"],
            equals: campaignId
          }
        }
      ]
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take
  });
}
