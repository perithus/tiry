import type { Prisma } from "@prisma/client";

export function normalizeSecurityMetadata(metadata: Prisma.JsonValue | null) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  return {
    kind: typeof metadata.kind === "string" ? metadata.kind : undefined,
    severity: typeof metadata.severity === "string" ? metadata.severity : undefined,
    signals:
      Array.isArray(metadata.signals) && metadata.signals.every((value) => typeof value === "string")
        ? metadata.signals
        : undefined,
    userAgent: typeof metadata.userAgent === "string" ? metadata.userAgent : undefined,
    ipAddress: typeof metadata.ipAddress === "string" ? metadata.ipAddress : undefined,
    signInCount1h: typeof metadata.signInCount1h === "number" ? metadata.signInCount1h : undefined,
    distinctIpCount24h: typeof metadata.distinctIpCount24h === "number" ? metadata.distinctIpCount24h : undefined
  };
}
