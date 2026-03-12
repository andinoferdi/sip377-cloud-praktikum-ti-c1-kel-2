import { describe, expect, it } from "vitest";
import {
  applyReceiverDeviceSelection,
  buildReceiverFilteredSample,
  computeReceiverRefetchIntervalMs,
  createInitialReceiverBindingState,
  RECEIVER_REFETCH_INTERVAL_DEFAULT_MS,
  RECEIVER_REFETCH_INTERVAL_MAX_MS,
  RECEIVER_REFETCH_INTERVAL_MIN_MS,
} from "@/utils/accelerometer-receiver";

describe("accelerometer-receiver", () => {
  it("creates hydration-safe initial state with empty ids", () => {
    const state = createInitialReceiverBindingState();
    expect(state.draftDeviceId).toBe("");
    expect(state.activeDeviceId).toBe("");
  });

  it("applies selected device id from trimmed draft", () => {
    expect(applyReceiverDeviceSelection("  telemetry-web-abc123  ")).toBe(
      "telemetry-web-abc123",
    );
  });

  it("computes adaptive polling interval with 2-5 second clamp", () => {
    expect(computeReceiverRefetchIntervalMs()).toBe(
      RECEIVER_REFETCH_INTERVAL_DEFAULT_MS,
    );
    expect(computeReceiverRefetchIntervalMs(1000)).toBe(
      RECEIVER_REFETCH_INTERVAL_MIN_MS,
    );
    expect(computeReceiverRefetchIntervalMs(3200)).toBe(2560);
    expect(computeReceiverRefetchIntervalMs(9000)).toBe(
      RECEIVER_REFETCH_INTERVAL_MAX_MS,
    );
  });

  it("filters z drift on receiver while keeping latest sample payload shape", () => {
    const history = [
      { t: "2026-03-12T10:00:00.000Z", x: 0.1, y: -0.1, z: 9.811 },
      { t: "2026-03-12T10:00:01.000Z", x: 0.1, y: -0.1, z: 9.815 },
      { t: "2026-03-12T10:00:02.000Z", x: 0.1, y: -0.1, z: 9.820 },
      { t: "2026-03-12T10:00:03.000Z", x: 0.1, y: -0.1, z: 10.1 },
    ];

    const sample = buildReceiverFilteredSample(history);
    expect(sample).not.toBeNull();
    expect(sample?.t).toBe("2026-03-12T10:00:03.000Z");
    expect(sample?.x).toBe(0.1);
    expect(sample?.y).toBe(-0.1);
    expect(sample?.z ?? 0).toBeGreaterThan(9.82);
    expect(sample?.z ?? 0).toBeLessThan(10.1);
  });
});
