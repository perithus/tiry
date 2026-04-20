import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function createAuditLog(input: {
  actorId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: input.ipAddress,
      ...(input.actorId
        ? {
            actor: {
              connect: {
                id: input.actorId
              }
            }
          }
        : {})
    }
  });
}
