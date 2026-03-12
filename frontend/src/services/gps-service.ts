import { requestGas } from "@/services/gas-client";

type ApiResponse<T> = {
  ok: boolean;
  data: T;
  error?: string;
};

export type GpsPoint = {
  ts: string;
  lat: number;
  lng: number;
  accuracy_m?: number | null;
  altitude_m?: number | null;
};

export type GpsLogPayload = {
  device_id: string;
  ts: string;
  lat: number;
  lng: number;
  accuracy_m?: number | null;
  altitude_m?: number | null;
};

export type GpsLogData = {
  accepted: boolean;
};

export type GpsLatestData = Partial<GpsPoint>;

export type GpsHistoryData = {
  device_id: string;
  items: GpsPoint[];
};

export type GpsHistoryQuery = {
  deviceId: string;
  limit?: number;
  from?: string;
  to?: string;
};

const GPS_API_PATHS = {
  log: "/telemetry/gps",
  latest: "/telemetry/gps/latest",
  history: "/telemetry/gps/history",
} as const;

export const gpsService = {
  logGpsPoint(payload: GpsLogPayload) {
    return requestGas<ApiResponse<GpsLogData>>(GPS_API_PATHS.log, {
      method: "POST",
      json: payload,
    });
  },

  getLatestGps(deviceId: string) {
    return requestGas<ApiResponse<GpsLatestData>>(GPS_API_PATHS.latest, {
      method: "GET",
      query: { device_id: deviceId },
    });
  },

  getGpsHistory(query: GpsHistoryQuery) {
    return requestGas<ApiResponse<GpsHistoryData>>(GPS_API_PATHS.history, {
      method: "GET",
      query: {
        device_id: query.deviceId,
        limit: query.limit,
        from: query.from,
        to: query.to,
      },
    });
  },
};