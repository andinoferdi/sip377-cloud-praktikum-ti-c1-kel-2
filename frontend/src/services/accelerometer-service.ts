import { requestGas } from "@/services/gas-client";

type ApiResponse<T> = {
  ok: boolean;
  data: T;
  error?: string;
};

export type AccelerometerSample = {
  t: string;
  x: number;
  y: number;
  z: number;
};

export type AccelerometerFlushPayload = {
  device_id: string;
  ts: string;
  samples: AccelerometerSample[];
};

export type AccelerometerFlushData = {
  accepted: number;
};

export type AccelerometerLatestData = Partial<AccelerometerSample>;

const ACCELEROMETER_API_PATHS = {
  flush: "/telemetry/accel",
  latest: "/telemetry/accel/latest",
} as const;

export const accelerometerService = {
  flushTelemetrySamples(payload: AccelerometerFlushPayload) {
    return requestGas<ApiResponse<AccelerometerFlushData>>(
      ACCELEROMETER_API_PATHS.flush,
      {
        method: "POST",
        json: payload,
      },
    );
  },

  getLatestTelemetry(deviceId: string) {
    return requestGas<ApiResponse<AccelerometerLatestData>>(
      ACCELEROMETER_API_PATHS.latest,
      {
        method: "GET",
        query: {
          device_id: deviceId,
        },
      },
    );
  },
};
