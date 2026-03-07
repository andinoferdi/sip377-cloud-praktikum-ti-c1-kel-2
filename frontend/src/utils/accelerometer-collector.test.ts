import { describe, expect, it } from "vitest";
import { getAccelerometerSupport } from "@/utils/accelerometer-collector";

describe("getAccelerometerSupport", () => {
  it("returns unsupported when window is unavailable", () => {
    expect(getAccelerometerSupport(undefined)).toEqual({
      supported: false,
      reason: "Sensor hanya bisa diakses dari browser.",
      requiresPermission: false,
    });
  });

  it("requires secure context before reading sensor", () => {
    expect(
      getAccelerometerSupport({
        isSecureContext: false,
        DeviceMotionEvent: class DeviceMotionEventMock {} as never,
      }),
    ).toEqual({
      supported: false,
      reason: "Sensor memerlukan secure context seperti HTTPS atau localhost.",
      requiresPermission: false,
    });
  });

  it("reports permission requirement when requestPermission exists", () => {
    class DeviceMotionEventMock {}

    expect(
      getAccelerometerSupport({
        isSecureContext: true,
        DeviceMotionEvent: Object.assign(DeviceMotionEventMock, {
          requestPermission: async () => "granted" as const,
        }) as never,
      }),
    ).toEqual({
      supported: true,
      reason: null,
      requiresPermission: true,
    });
  });
});
