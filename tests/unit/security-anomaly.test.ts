import { describe, expect, it } from "vitest";
import { detectSignInAnomalies } from "@/lib/security/anomaly";

describe("detectSignInAnomalies", () => {
  it("returns standard sign-in when context is already known", () => {
    const now = new Date("2026-04-26T10:00:00.000Z");
    const result = detectSignInAnomalies({
      ipAddress: "1.1.1.1",
      userAgent: "Browser A",
      historicalSessions: [{ ipAddress: "1.1.1.1", userAgent: "Browser A", createdAt: new Date("2026-04-25T09:00:00.000Z") }],
      historicalSignIns: [],
      now
    });

    expect(result.kind).toBe("standard_sign_in");
    expect(result.severity).toBe("info");
  });

  it("detects a new network sign-in", () => {
    const now = new Date("2026-04-26T10:00:00.000Z");
    const result = detectSignInAnomalies({
      ipAddress: "2.2.2.2",
      userAgent: "Browser A",
      historicalSessions: [{ ipAddress: "1.1.1.1", userAgent: "Browser A", createdAt: new Date("2026-04-25T09:00:00.000Z") }],
      historicalSignIns: [],
      now
    });

    expect(result.kind).toBe("new_device_sign_in");
    expect(result.signals).toContain("new_network_sign_in");
    expect(result.severity).toBe("warning");
  });

  it("escalates to danger on rapid ip rotation", () => {
    const now = new Date("2026-04-26T10:00:00.000Z");
    const result = detectSignInAnomalies({
      ipAddress: "3.3.3.3",
      userAgent: "Browser A",
      historicalSessions: [],
      historicalSignIns: [
        { ipAddress: "1.1.1.1", userAgent: "Browser A", createdAt: new Date("2026-04-26T08:00:00.000Z") },
        { ipAddress: "2.2.2.2", userAgent: "Browser A", createdAt: new Date("2026-04-26T09:00:00.000Z") }
      ],
      now
    });

    expect(result.kind).toBe("rapid_ip_rotation_sign_in");
    expect(result.severity).toBe("danger");
    expect(result.distinctIpCount24h).toBe(3);
  });
});
