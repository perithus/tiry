import { describe, expect, it } from "vitest";
import { consumeRateLimit } from "@/lib/rate-limit/memory";

describe("consumeRateLimit", () => {
  it("blocks once the request count is exceeded inside the window", () => {
    const key = `test-key-${Date.now()}`;

    expect(consumeRateLimit(key, 2, 10_000).success).toBe(true);
    expect(consumeRateLimit(key, 2, 10_000).success).toBe(true);
    expect(consumeRateLimit(key, 2, 10_000).success).toBe(false);
  });
});
