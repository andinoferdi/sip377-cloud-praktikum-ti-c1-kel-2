import { fetcher } from "@/services/fetcher";
import type {
  CreatePOSInstancePayload,
  POSInstanceResponse,
  TableLabelResponse,
  UpdatePOSInstancePayload,
  UpdateTableLabelPayload,
} from "../types";

const BASE = "/api/portal/pos-instances";

export const posInstanceService = {
  list: () => fetcher<POSInstanceResponse[]>(BASE),

  getById: (id: string) => fetcher<POSInstanceResponse>(`${BASE}/${id}`),

  create: (payload: CreatePOSInstancePayload) =>
    fetcher<POSInstanceResponse>(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  update: (id: string, payload: UpdatePOSInstancePayload) =>
    fetcher<POSInstanceResponse>(`${BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  remove: (id: string) =>
    fetcher<{ message: string }>(`${BASE}/${id}`, { method: "DELETE" }),

  restore: (id: string) =>
    fetcher<POSInstanceResponse>(`${BASE}/${id}/restore`, {
      method: "PATCH",
    }),

  listTables: (posInstanceId: string) =>
    fetcher<TableLabelResponse[]>(`${BASE}/${posInstanceId}/tables`),

  updateTableLabel: (
    posInstanceId: string,
    tableId: string,
    payload: UpdateTableLabelPayload
  ) =>
    fetcher<TableLabelResponse>(
      `${BASE}/${posInstanceId}/tables/${tableId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    ),
};
