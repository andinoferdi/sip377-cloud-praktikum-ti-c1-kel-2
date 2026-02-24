"use client";

import { queryKeys } from "@/hooks/query-keys";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { posInstanceService } from "../services/pos-instance-service";
import type { CreatePOSInstancePayload, UpdatePOSInstancePayload } from "../types";

export function usePOSInstances() {
  return useQuery({
    queryKey: queryKeys.posInstances.list(),
    queryFn: posInstanceService.list,
  });
}

export function useCreatePOSInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePOSInstancePayload) =>
      posInstanceService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posInstances.all });
    },
  });
}

export function useUpdatePOSInstance(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePOSInstancePayload) =>
      posInstanceService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posInstances.all });
    },
  });
}

export function useDeletePOSInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => posInstanceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posInstances.all });
    },
  });
}

export function useRestorePOSInstance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => posInstanceService.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posInstances.all });
    },
  });
}
