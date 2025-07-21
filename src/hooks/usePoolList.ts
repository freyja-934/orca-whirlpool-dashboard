import { fetchPoolsWithDetails } from "@/lib/fetchWhirlpoolPools";
import { queryKeys } from "@/lib/query-client";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

const POOLS_PER_PAGE = 12;

export function usePoolList(filters?: { search?: string; sortBy?: string }) {
  const { connection } = useConnection();
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: queryKeys.pools.list(filters),
    queryFn: async () => {
      return fetchPoolsWithDetails(connection, 100);
    },
    enabled: !!connection,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
  });

  const filteredPools = useMemo(() => {
    if (!query.data) return [];
    
    let pools = [...query.data];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      pools = pools.filter((pool) => {
        const tokenAMatch = pool.tokenA?.symbol?.toLowerCase().includes(searchLower) || 
                           pool.tokenA?.name?.toLowerCase().includes(searchLower);
        const tokenBMatch = pool.tokenB?.symbol?.toLowerCase().includes(searchLower) || 
                           pool.tokenB?.name?.toLowerCase().includes(searchLower);
        return tokenAMatch || tokenBMatch;
      });
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "tvl":
          pools.sort((a, b) => b.tvl - a.tvl);
          break;
        case "feeRate":
          pools.sort((a, b) => b.feeRate - a.feeRate);
          break;
        case "liquidity":
          pools.sort((a, b) => {
            const aLiq = BigInt(a.liquidity);
            const bLiq = BigInt(b.liquidity);
            return aLiq > bLiq ? -1 : aLiq < bLiq ? 1 : 0;
          });
          break;
      }
    }

    return pools;
  }, [query.data, filters]);

  const paginatedPools = useMemo(() => {
    const startIndex = (page - 1) * POOLS_PER_PAGE;
    const endIndex = startIndex + POOLS_PER_PAGE;
    return filteredPools.slice(startIndex, endIndex);
  }, [filteredPools, page]);

  const totalPages = Math.ceil(filteredPools.length / POOLS_PER_PAGE);

  return {
    pools: paginatedPools,
    allPools: filteredPools,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    page,
    setPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
} 