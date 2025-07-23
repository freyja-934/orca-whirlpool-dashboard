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
      return fetchPoolsWithDetails(connection);
    },
    enabled: !!connection,
    staleTime: 60000,
    gcTime: 5 * 60 * 1000,
  });

  const filteredPools = useMemo(() => {
    if (!query.data) return [];
    
    let pools = [...query.data];

    // Apply search filter
    if (filters?.search && filters.search.trim() !== '') {
      const searchLower = filters.search.toLowerCase().trim();
      pools = pools.filter((pool) => {
        // Check if either token symbol contains the search query
        const tokenASymbol = pool.tokenA?.symbol?.toLowerCase() || '';
        const tokenBSymbol = pool.tokenB?.symbol?.toLowerCase() || '';
        const tokenAName = pool.tokenA?.name?.toLowerCase() || '';
        const tokenBName = pool.tokenB?.name?.toLowerCase() || '';
        
        // Search in symbol or name
        const matchesTokenA = tokenASymbol.includes(searchLower) || tokenAName.includes(searchLower);
        const matchesTokenB = tokenBSymbol.includes(searchLower) || tokenBName.includes(searchLower);
        
        // Also check if the search term matches the pair (e.g., "SOL/USDC")
        const pairSymbol = `${tokenASymbol}/${tokenBSymbol}`;
        const matchesPair = pairSymbol.includes(searchLower);
        
        return matchesTokenA || matchesTokenB || matchesPair;
      });
    }

    // Apply sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case "tvl":
          pools.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
          break;
        case "feeRate":
          pools.sort((a, b) => b.feeRate - a.feeRate);
          break;
        case "liquidity":
          pools.sort((a, b) => {
            const aLiq = BigInt(a.liquidity || 0);
            const bLiq = BigInt(b.liquidity || 0);
            return aLiq > bLiq ? -1 : aLiq < bLiq ? 1 : 0;
          });
          break;
        case "volume":
          pools.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
          break;
        default:
          // Default to TVL sorting
          pools.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
      }
    } else {
      // Default sort by TVL if no sort specified
      pools.sort((a, b) => (b.tvl || 0) - (a.tvl || 0));
    }

    return pools;
  }, [query.data, filters]);

  // Reset page when filters change
  useMemo(() => {
    setPage(1);
  }, [filters]);

  const paginatedPools = useMemo(() => {
    const startIndex = (page - 1) * POOLS_PER_PAGE;
    const endIndex = startIndex + POOLS_PER_PAGE;
    return filteredPools.slice(startIndex, endIndex);
  }, [filteredPools, page]);

  const totalPages = Math.ceil(filteredPools.length / POOLS_PER_PAGE);

  return {
    pools: paginatedPools,
    allPools: filteredPools,
    totalPools: filteredPools.length,
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