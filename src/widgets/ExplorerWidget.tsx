'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePoolList } from '@/hooks/usePoolList';
import { formatNumber } from '@/lib/chartData';

export default function ExplorerWidget() {
  const { pools, isLoading, error } = usePoolList();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-500">
        Error loading pools
      </div>
    );
  }

  if (!pools || pools.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No pools found
      </div>
    );
  }

  return (
    <div className="space-y-1 overflow-auto h-full p-2">
      {pools.slice(0, 5).map((pool) => (
        <Card key={pool.address.toString()} className="p-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">
                {pool.tokenA.symbol}/{pool.tokenB.symbol}
              </span>
              <span className="text-xs text-muted-foreground">
                {(pool.feeRate / 10000).toFixed(2)}%
              </span>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium">
                {formatNumber(pool.tvl)}
              </div>
              <div className="text-xs text-muted-foreground">
                {pool.apr ? `${pool.apr.toFixed(1)}% APR` : 'N/A'}
              </div>
            </div>
          </div>
        </Card>
      ))}
      {pools.length > 5 && (
        <div className="text-xs text-center text-muted-foreground py-1">
          +{pools.length - 5} more pools
        </div>
      )}
    </div>
  );
} 