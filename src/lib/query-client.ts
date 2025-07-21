import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});

export const queryKeys = {
  wallet: {
    all: ["wallet"] as const,
    balance: (address: string) => ["wallet", "balance", address] as const,
    positions: (address: string) => ["wallet", "positions", address] as const,
  },
  pools: {
    all: ["pools"] as const,
    list: (filters?: { search?: string; sortBy?: string }) => ["pools", "list", filters] as const,
    detail: (poolId: string) => ["pools", "detail", poolId] as const,
  },
  positions: {
    all: ["positions"] as const,
    detail: (positionId: string) => ["positions", "detail", positionId] as const,
  },
  tokens: {
    all: ["tokens"] as const,
    list: () => ["tokens", "list"] as const,
  },
} as const; 