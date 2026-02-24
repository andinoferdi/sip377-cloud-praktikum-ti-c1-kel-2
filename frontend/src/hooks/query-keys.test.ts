import { queryKeys } from "@/hooks/query-keys";
import { describe, expect, it } from "vitest";

describe("queryKeys", () => {
  it("keeps stable health base key", () => {
    expect(queryKeys.health.all).toEqual(["health"]);
  });

  it("returns deterministic health status key", () => {
    expect(queryKeys.health.status()).toEqual(["health", "status"]);
    expect(queryKeys.health.status()).toEqual(queryKeys.health.status());
  });

  it("returns serializable key values", () => {
    const key = queryKeys.health.status();
    const serialized = JSON.stringify(key);

    expect(serialized).toBe("[\"health\",\"status\"]");
    expect(JSON.parse(serialized)).toEqual(key);
  });
});
