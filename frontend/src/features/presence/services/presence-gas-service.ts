import { requestGas } from "@/services/gas-client";
import type {
  ApiResponse,
  CheckInData,
  CheckInRequest,
  GenerateQrData,
  GenerateQrRequest,
  StatusData,
  StatusRequest,
} from "@/features/presence/types";

const PRESENCE_API_PATHS = {
  generate: "/presence/qr/generate",
  checkIn: "/presence/checkin",
  status: "/presence/status",
} as const;

export const presenceGasService = {
  generateToken(payload: GenerateQrRequest) {
    return requestGas<ApiResponse<GenerateQrData>>(PRESENCE_API_PATHS.generate, {
      method: "POST",
      json: payload,
    });
  },

  checkIn(payload: CheckInRequest) {
    return requestGas<ApiResponse<CheckInData>>(PRESENCE_API_PATHS.checkIn, {
      method: "POST",
      json: payload,
    });
  },

  checkStatus(params: StatusRequest) {
    return requestGas<ApiResponse<StatusData>>(PRESENCE_API_PATHS.status, {
      method: "GET",
      query: params,
    });
  },
};
