import { fetcher } from "@/services/fetcher";
import type { RegisterPayload, RegisterResponse } from "@/features/auth/types";

export const authService = {
  register: (payload: RegisterPayload) =>
    fetcher<RegisterResponse>("/api/auth/register", {
      method: "POST",
      json: payload,
    }),
};
