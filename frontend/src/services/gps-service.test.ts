import { afterEach, describe, expect, it, vi } from "vitest";

const requestGasMock = vi.hoisted(() => vi.fn());

vi.mock("@/services/gas-client", () => ({
  requestGas: requestGasMock,
}));

import { gpsService } from "@/services/gps-service";

describe("gps-service", () => {
  afterEach(() => {
    requestGasMock.mockReset();
  });

  it("sends GPS point payload to telemetry endpoint", async () => {
    requestGasMock.mockResolvedValueOnce({ ok: true, data: { accepted: true } });

    await gpsService.logGpsPoint({
      device_id: "telemetry-1",
      ts: "2026-03-12T10:15:30.000Z",
      lat: -7.2575,
      lng: 112.7521,
      accuracy_m: 12.5,
      altitude_m: 33.2,
    });

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/gps", {
      method: "POST",
      json: {
        device_id: "telemetry-1",
        ts: "2026-03-12T10:15:30.000Z",
        lat: -7.2575,
        lng: 112.7521,
        accuracy_m: 12.5,
        altitude_m: 33.2,
      },
    });
  });

  it("requests latest GPS by device id", async () => {
    requestGasMock.mockResolvedValueOnce({
      ok: true,
      data: { ts: "2026-03-12T10:15:30.000Z", lat: -7.2575, lng: 112.7521 },
    });

    await gpsService.getLatestGps("telemetry-1");

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/gps/latest", {
      method: "GET",
      query: {
        device_id: "telemetry-1",
      },
    });
  });

  it("requests GPS history with limit and time window", async () => {
    requestGasMock.mockResolvedValueOnce({
      ok: true,
      data: {
        device_id: "telemetry-1",
        items: [
          { ts: "2026-03-12T10:15:10.000Z", lat: -7.2573, lng: 112.752 },
          { ts: "2026-03-12T10:15:30.000Z", lat: -7.2575, lng: 112.7521 },
        ],
      },
    });

    await gpsService.getGpsHistory({
      deviceId: "telemetry-1",
      limit: 200,
      from: "2026-03-12T10:00:00.000Z",
      to: "2026-03-12T11:00:00.000Z",
    });

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/gps/history", {
      method: "GET",
      query: {
        device_id: "telemetry-1",
        limit: 200,
        from: "2026-03-12T10:00:00.000Z",
        to: "2026-03-12T11:00:00.000Z",
      },
    });
  });

  it("returns backend error envelope without transforming it", async () => {
    requestGasMock.mockResolvedValueOnce({
      ok: false,
      error: "missing_field: device_id",
      data: {},
    });

    const result = await gpsService.getLatestGps("");

    expect(result).toEqual({
      ok: false,
      error: "missing_field: device_id",
      data: {},
    });
  });
});
