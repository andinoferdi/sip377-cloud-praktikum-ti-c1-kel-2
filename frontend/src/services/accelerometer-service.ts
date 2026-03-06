import { requestGas } from '@/services/gas-client';

export interface AccelSample {
  t: string; // timestamp sensor membaca
  x: number;
  y: number;
  z: number;
}

export interface AccelBatchPayload {
  device_id: string;
  ts: string; // batch timestamp (waktu dikirim)
  samples: AccelSample[];
}

export interface AccelLatestResponse {
  t: string;
  x: number;
  y: number;
  z: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

/**
 * Mengirim batch data accelerometer ke backend
 */
export async function sendAccelBatch(payload: AccelBatchPayload, signal?: AbortSignal) {
  const response = await requestGas<ApiResponse<{ accepted: number }>>(
    'telemetry/accel',
    {
      method: 'POST',
      json: payload,
      signal,
    }
  );
  return response;
}

/**
 * Mengambil data accelerometer terbaru untuk device
 */
export async function getAccelLatest(deviceId: string, signal?: AbortSignal) {
  const response = await requestGas<ApiResponse<AccelLatestResponse>>(
    'telemetry/accel/latest',
    {
      method: 'GET',
      query: { device_id: deviceId },
      signal,
    }
  );
  return response;
}
