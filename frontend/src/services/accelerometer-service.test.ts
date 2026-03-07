import { beforeEach, describe, expect, it, vi } from "vitest";

const requestGasMock = vi.fn();

vi.mock("@/services/gas-client", () => ({
  requestGas: requestGasMock,
}));

describe("accelerometer-service", () => {
  beforeEach(() => {
    requestGasMock.mockReset();
  });

  it("sends telemetry batch through the active GAS contract", async () => {
    requestGasMock.mockResolvedValue({ ok: true, data: { accepted: 2 } });

    const { sendAccelBatch } = await import("@/services/accelerometer-service");
    const payload = {
      device_id: "dev-001",
      ts: "2026-03-07T10:15:30.000Z",
      samples: [
        { t: "2026-03-07T10:15:29.000Z", x: 0.1, y: 0.2, z: 9.7 },
        { t: "2026-03-07T10:15:29.300Z", x: 0.2, y: 0.1, z: 9.6 },
      ],
    };

    await sendAccelBatch(payload);

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/accel", {
      method: "POST",
      json: payload,
      signal: undefined,
    });
  });

  it("requests latest telemetry using device_id query param", async () => {
    requestGasMock.mockResolvedValue({ ok: true, data: {} });

    const { getAccelLatest } = await import("@/services/accelerometer-service");
    await getAccelLatest("dev-123");

    expect(requestGasMock).toHaveBeenCalledWith("/telemetry/accel/latest", {
      method: "GET",
      query: { device_id: "dev-123" },
      signal: undefined,
    });
  });
});
