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
export type AccelerometerHistoryData = {
  device_id: string;
  items: AccelerometerSample[];
  items_count?: number;
  server_time?: string;
  query_ms?: number;
};

export type AccelerometerHistoryQuery = {
  deviceId: string;
  limit?: number;
  from?: string;
  to?: string;
};

const ACCELEROMETER_API_PATHS = {
  flush: "/telemetry/accel",
  latest: "/telemetry/accel/latest",
  history: "/telemetry/accel/history",
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

  getTelemetryHistory(query: AccelerometerHistoryQuery) {
    return requestGas<ApiResponse<AccelerometerHistoryData>>(
      ACCELEROMETER_API_PATHS.history,
      {
        method: "GET",
        query: {
          device_id: query.deviceId,
          limit: query.limit,
          from: query.from,
          to: query.to,
        },
      },
    );
  },
};
