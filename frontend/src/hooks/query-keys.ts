export const queryKeys = {
  health: {
    all: ['health'] as const,
    status: () => [...queryKeys.health.all, 'status'] as const,
  },
  posInstances: {
    all: ['posInstances'] as const,
    list: () => [...queryKeys.posInstances.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.posInstances.all, 'detail', id] as const,
    tables: (id: string) => [...queryKeys.posInstances.all, 'tables', id] as const,
  },
};
