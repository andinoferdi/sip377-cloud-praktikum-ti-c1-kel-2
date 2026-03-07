import { requestGas } from "@/services/gas-client";

const ACCELEROMETER_PATHS = {
  batch: "/telemetry/accel",
  latest: "/telemetry/accel/latest",
} as const;

export type AccelSample = {
  t: string;
  x: number;
  y: number;
  z: number;
};

export type AccelBatchPayload = {
  device_id: string;
  ts: string;
  samples: AccelSample[];
};

export type AccelLatestData = {
  t: string;
  x: number;
  y: number;
  z: number;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
};

export type ApiFailure = {
  ok: false;
  error: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export function sendAccelBatch(payload: AccelBatchPayload, signal?: AbortSignal) {
  return requestGas<ApiResponse<{ accepted: number }>>(ACCELEROMETER_PATHS.batch, {
    method: "POST",
    json: payload,
    signal,
  });
}

export function getAccelLatest(deviceId: string, signal?: AbortSignal) {
  return requestGas<ApiResponse<AccelLatestData | Record<string, never>>>(
    ACCELEROMETER_PATHS.latest,
    {
      method: "GET",
      query: { device_id: deviceId },
      signal,
    },
  );
}
