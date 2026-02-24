"use client";

import { queryKeys } from "@/hooks/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posInstanceService } from "../services/pos-instance-service";
import type { UpdateTableLabelPayload } from "../types";

export function usePOSInstanceDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.posInstances.detail(id),
    queryFn: () => posInstanceService.getById(id),
    enabled: !!id,
  });
}

export function useTableLabels(posInstanceId: string) {
  return useQuery({
    queryKey: queryKeys.posInstances.tables(posInstanceId),
    queryFn: () => posInstanceService.listTables(posInstanceId),
    enabled: !!posInstanceId,
  });
}

export function useUpdateTableLabel(posInstanceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tableId,
      payload,
    }: {
      tableId: string;
      payload: UpdateTableLabelPayload;
    }) => posInstanceService.updateTableLabel(posInstanceId, tableId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.posInstances.tables(posInstanceId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.posInstances.detail(posInstanceId),
      });
    },
  });
}
