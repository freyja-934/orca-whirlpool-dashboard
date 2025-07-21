import { fetchPoolDetails } from "@/lib/fetchWhirlpoolPools";
import { queryKeys } from "@/lib/query-client";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";

export function usePoolDetails(poolId: string) {
  const { connection } = useConnection();

  const query = useQuery({
    queryKey: queryKeys.pools.detail(poolId),
    queryFn: async () => {
      if (!poolId) return null;
      
      try {
        const poolAddress = new PublicKey(poolId);
        return fetchPoolDetails(connection, poolAddress);
      } catch (error) {
        console.error("Invalid pool address:", error);
        return null;
      }
    },
    enabled: !!connection && !!poolId,
    refetchInterval: 7500,
    staleTime: 5000,
  });

  return {
    pool: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
} 