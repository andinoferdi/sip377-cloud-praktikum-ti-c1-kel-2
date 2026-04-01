import { describe, expect, it } from "vitest";
import {
  resolveSwapBaseUrl,
  type SwapRuntimeConfig,
} from "@/services/swap-runtime-config";

function config(
  partial: Partial<SwapRuntimeConfig>,
): SwapRuntimeConfig {
  return {
    enabled: false,
    ownBaseUrl: "",
    partnerBaseUrl: "",
    senderMode: "partner",
    visualizerMode: "own",
    updatedAt: "",
    ...partial,
  };
}

describe("swap-runtime-config", () => {
  it("uses own base URL when swap mode is disabled", () => {
    const resolved = resolveSwapBaseUrl("sender", "https://env.example/exec", {
      config: config({
        enabled: false,
        ownBaseUrl: "https://own.example/exec",
      }),
    });

    expect(resolved.baseUrl).toBe("https://own.example/exec");
    expect(resolved.source).toBe("own");
  });

  it("falls back to env base URL when own URL is empty", () => {
    const resolved = resolveSwapBaseUrl("visualizer", "https://env.example/exec", {
      config: config({
        enabled: false,
      }),
    });

    expect(resolved.baseUrl).toBe("https://env.example/exec");
    expect(resolved.source).toBe("env");
  });

  it("routes sender to partner when swap mode is enabled", () => {
    const resolved = resolveSwapBaseUrl("sender", "https://env.example/exec", {
      config: config({
        enabled: true,
        senderMode: "partner",
        visualizerMode: "own",
        ownBaseUrl: "https://own.example/exec",
        partnerBaseUrl: "https://partner.example/exec",
      }),
    });

    expect(resolved.baseUrl).toBe("https://partner.example/exec");
    expect(resolved.source).toBe("partner");
  });

  it("keeps visualizer on own URL for default preset A", () => {
    const resolved = resolveSwapBaseUrl("visualizer", "https://env.example/exec", {
      config: config({
        enabled: true,
        senderMode: "partner",
        visualizerMode: "own",
        ownBaseUrl: "https://own.example/exec",
        partnerBaseUrl: "https://partner.example/exec",
      }),
    });

    expect(resolved.baseUrl).toBe("https://own.example/exec");
    expect(resolved.source).toBe("own");
  });

  it("falls back safely to own/env when partner is missing", () => {
    const withOwn = resolveSwapBaseUrl("sender", "https://env.example/exec", {
      config: config({
        enabled: true,
        senderMode: "partner",
        ownBaseUrl: "https://own.example/exec",
      }),
    });

    const withEnv = resolveSwapBaseUrl("sender", "https://env.example/exec", {
      config: config({
        enabled: true,
        senderMode: "partner",
      }),
    });

    expect(withOwn.baseUrl).toBe("https://own.example/exec");
    expect(withOwn.source).toBe("own");
    expect(withEnv.baseUrl).toBe("https://env.example/exec");
    expect(withEnv.source).toBe("env");
  });

  it("uses explicit override URL when provided", () => {
    const resolved = resolveSwapBaseUrl("sender", "https://env.example/exec", {
      config: config({
        enabled: true,
        senderMode: "partner",
        partnerBaseUrl: "https://partner.example/exec",
      }),
      baseUrlOverride: "https://override.example/exec",
    });

    expect(resolved.baseUrl).toBe("https://override.example/exec");
    expect(resolved.source).toBe("override");
  });
});

