import { afterEach, describe, expect, it, vi } from "vitest";

const requestGasMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/gas-client", () => ({
  requestGas: requestGasMock,
}));

import { accelerometerService } from "@/services/accelerometer-service";

describe("accelerometer-service", () => {
  afterEach(() => {
    requestGasMock.mockReset();
  });

  it("flushes telemetry samples to the accel batch endpoint", async () => {
    requestGasMock.mockResolvedValueOnce({ ok: true, data: { accepted: 2 } });

    await accelerometerService.flushTelemetrySamples({
      device_id: "telemetry-1",
      ts: "2026-03-07T16:00:00.000Z",
      samples: [
        { t: "2026-03-07T16:00:00.000Z", x: 0.1, y: 0.2, z: 9.7 },
        { t: "2026-03-07T16:00:00.200Z", x: 0.3, y: 0.4, z: 9.6 },
      ],
    });

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/accel", {
      method: "POST",
      json: {
        device_id: "telemetry-1",
        ts: "2026-03-07T16:00:00.000Z",
        samples: [
          { t: "2026-03-07T16:00:00.000Z", x: 0.1, y: 0.2, z: 9.7 },
          { t: "2026-03-07T16:00:00.200Z", x: 0.3, y: 0.4, z: 9.6 },
        ],
      },
    });
  });

  it("requests latest telemetry by device id", async () => {
    requestGasMock.mockResolvedValueOnce({
      ok: true,
      data: { t: "2026-03-07T16:00:00.200Z", x: 0.3, y: 0.4, z: 9.6 },
    });

    await accelerometerService.getLatestTelemetry("telemetry-1");

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/accel/latest", {
      method: "GET",
      query: {
        device_id: "telemetry-1",
      },
    });
  });

  it("requests telemetry history with query window and limit", async () => {
    requestGasMock.mockResolvedValueOnce({
      ok: true,
      data: {
        device_id: "telemetry-1",
        items: [
          { t: "2026-03-07T16:00:00.000Z", x: 0.1, y: 0.2, z: 9.7 },
          { t: "2026-03-07T16:00:01.000Z", x: 0.2, y: 0.3, z: 9.6 },
        ],
      },
    });

    await accelerometerService.getTelemetryHistory({
      deviceId: "telemetry-1",
      limit: 120,
      from: "2026-03-07T16:00:00.000Z",
      to: "2026-03-07T16:10:00.000Z",
    });

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/accel/history", {
      method: "GET",
      query: {
        device_id: "telemetry-1",
        limit: 120,
        from: "2026-03-07T16:00:00.000Z",
        to: "2026-03-07T16:10:00.000Z",
      },
    });
  });
});
