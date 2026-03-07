import { describe, expect, it, vi } from "vitest";
import {
  createAccelerometerSessionController,
  detectAccelerometerSupport,
  type TelemetrySessionState,
} from "@/utils/accelerometer-session";

function createFakeWindow(overrides: Record<string, unknown> = {}) {
  return {
    isSecureContext: true,
    navigator: {
      userAgent: "Mozilla/5.0 Chrome/126.0",
    },
    DeviceMotionEvent: {},
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setTimeout: vi.fn(() => 1),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(() => 1),
    clearInterval: vi.fn(),
    console: {
      info: vi.fn(),
      warn: vi.fn(),
    },
    ...overrides,
  };
}

describe("accelerometer-session support", () => {
  it("reports insecure context explicitly", () => {
    const support = detectAccelerometerSupport(
      createFakeWindow({ isSecureContext: false }),
    );

    expect(support.status).toBe("insecure_context");
  });

  it("flags Brave with a browser hint", () => {
    const support = detectAccelerometerSupport(
      createFakeWindow({
        navigator: {
          userAgent: "Mozilla/5.0 Brave/1.78",
          brave: {},
        },
      }),
    );

    expect(support.isBrave).toBe(true);
    expect(support.browserHint).toContain("Brave");
  });

  it("marks desktop unsupported message more explicitly", () => {
    const support = detectAccelerometerSupport(
      createFakeWindow({
        DeviceMotionEvent: undefined,
        navigator: {
          userAgent: "Mozilla/5.0 Windows NT 10.0; Win64; x64 Chrome/126.0",
        },
      }),
    );

    expect(support.isLikelyMobile).toBe(false);
    expect(support.message).toContain("desktop");
  });
});

describe("accelerometer-session controller", () => {
  it("streams live samples and flushes remaining queue on stop", async () => {
    const runtimeCapture: {
      onSample: ((sample: {
        t: string;
        x: number;
        y: number;
        z: number;
      }) => void) | null;
    } = {
      onSample: null,
    };
    const states: TelemetrySessionState[] = [];
    const flushSamples = vi.fn().mockResolvedValue({ accepted: 2 });
    const now = vi
      .fn()
      .mockReturnValueOnce(1700000000000)
      .mockReturnValueOnce(1700000000100)
      .mockReturnValueOnce(1700000000200);
    const controller = createAccelerometerSessionController({
      deviceId: "telemetry-1",
      now,
      flushSamples,
      onStateChange(state) {
        states.push(state);
      },
      createRuntime: async (_targetWindow, sampleHandler) => {
        runtimeCapture.onSample = sampleHandler;
        return {
          source: "devicemotion",
          stop() {
            return undefined;
          },
        };
      },
    });

    const fakeWindow = createFakeWindow();

    await controller.start(fakeWindow);
    expect(runtimeCapture.onSample).toBeTypeOf("function");
    const sampleHandler = runtimeCapture.onSample!;
    sampleHandler({
      t: "2026-03-07T16:00:00.000Z",
      x: 0.1,
      y: 0.2,
      z: 9.7,
    });
    sampleHandler({
      t: "2026-03-07T16:00:00.100Z",
      x: 0.3,
      y: 0.4,
      z: 9.6,
    });

    await controller.stop(fakeWindow);

    expect(flushSamples).toHaveBeenCalledTimes(1);
    expect(flushSamples.mock.calls[0]?.[0].samples).toHaveLength(2);
    expect(states.at(-1)?.status).toBe("stopped");
    expect(states.some((state) => state.status === "stopping")).toBe(true);
    expect(states.at(-1)?.lastStoppedAt).toBeTruthy();
    expect(states.at(-1)?.lastAcceptedCount).toBe(2);
    expect(states.some((state) => state.liveSampleCount >= 2)).toBe(true);
  });

  it("marks the session denied when permission is rejected", async () => {
    const controller = createAccelerometerSessionController({
      deviceId: "telemetry-1",
      flushSamples: vi.fn().mockResolvedValue({ accepted: 0 }),
    });

    const fakeWindow = createFakeWindow({
      DeviceMotionEvent: {
        requestPermission: vi.fn().mockResolvedValue("denied"),
      },
    });

    const state = await controller.start(fakeWindow);

    expect(state.status).toBe("denied");
  });
});
