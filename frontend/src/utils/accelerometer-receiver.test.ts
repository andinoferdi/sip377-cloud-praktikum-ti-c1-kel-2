import { describe, expect, it } from "vitest";
import {
  applyReceiverDeviceSelection,
  createInitialReceiverBindingState,
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
});
