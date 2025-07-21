import { fetchUserPositions } from "@/lib/fetchWhirlpoolPools";
import { queryKeys } from "@/lib/query-client";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "./useWallet";

export function useWalletPositions() {
  const { publicKey, connection, isConnected } = useWallet();

  const query = useQuery({
    queryKey: queryKeys.wallet.positions(publicKey?.toString() || ""),
    queryFn: async () => {
      if (!publicKey || !connection) {
        return [];
      }
      return fetchUserPositions(connection, publicKey);
    },
    enabled: !!publicKey && !!connection && isConnected,
    refetchInterval: 30000,
    staleTime: 25000,
  });

  const activePositions = query.data?.filter((position) => {
    const lowerTick = position.data.tickLowerIndex;
    const upperTick = position.data.tickUpperIndex;
    const currentTick = position.data.pool.tickCurrentIndex;
    return currentTick >= lowerTick && currentTick <= upperTick;
  }) || [];

  const inactivePositions = query.data?.filter((position) => {
    const lowerTick = position.data.tickLowerIndex;
    const upperTick = position.data.tickUpperIndex;
    const currentTick = position.data.pool.tickCurrentIndex;
    return currentTick < lowerTick || currentTick > upperTick;
  }) || [];

  return {
    positions: query.data || [],
    activePositions,
    inactivePositions,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
} 