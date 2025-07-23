"use client";

import { PoolCard } from "@/components/pool-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { usePoolList } from "@/hooks/usePoolList";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("tvl");
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filters = useMemo(() => ({
    search: debouncedSearch,
    sortBy,
  }), [debouncedSearch, sortBy]);

  const { 
    pools, 
    totalPools,
    isLoading, 
    page, 
    setPage, 
    totalPages, 
    hasNextPage, 
    hasPreviousPage 
  } = usePoolList(filters);

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Explore Pools</h1>
          <p className="text-muted-foreground">
            Discover and analyze all active Whirlpool liquidity pools
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search by token symbol (e.g., SOL, USDC)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[180px] font-medium">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tvl">Sort by TVL</SelectItem>
              <SelectItem value="volume">Sort by Volume (24h)</SelectItem>
              <SelectItem value="feeRate">Sort by Fee</SelectItem>
              <SelectItem value="liquidity">Sort by Liquidity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchQuery && !isLoading && (
          <div className="text-sm text-muted-foreground">
            Found {totalPools} pool{totalPools !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-20" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pools.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <PoolCard key={pool.address.toString()} pool={pool} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `No pools found matching "${searchQuery}". Try searching for a different token symbol.`
                    : "No pools found matching your search criteria."}
                </p>
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="mt-4"
                  >
                    Clear search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
} 