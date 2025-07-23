'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useWalletPositions } from '@/hooks/useWalletPositions';
import { formatNumber } from '@/lib/chartData';
import { Activity, AlertCircle, CheckCircle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';

export default function LPWidget() {
  const { positions, activePositions, inactivePositions, isLoading, error } = useWalletPositions();

  const summary = useMemo(() => {
    if (!positions || positions.length === 0) return null;

    const totalValue = positions.reduce((acc, pos) => 
      acc + (pos.data.positionValueUSD || 0), 0
    );

    const activeValue = activePositions.reduce((acc, pos) => 
      acc + (pos.data.positionValueUSD || 0), 0
    );

    const totalFees = positions.reduce((acc, pos) => 
      acc + (pos.data.feeOwedA || 0) + (pos.data.feeOwedB || 0), 0
    );

    return {
      totalValue,
      activeValue,
      inactiveValue: totalValue - activeValue,
      totalPositions: positions.length,
      activeCount: activePositions.length,
      inactiveCount: inactivePositions.length,
      totalFees,
      activePercent: totalValue > 0 ? (activeValue / totalValue) * 100 : 0
    };
  }, [positions, activePositions, inactivePositions]);

  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500 p-3">
        <AlertCircle className="h-4 w-4" />
        Error loading positions
      </div>
    );
  }

  if (!positions || positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <DollarSign className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm font-medium">No LP Positions</p>
        <p className="text-xs text-muted-foreground">Add liquidity to start earning fees</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="space-y-2">
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-muted-foreground">Total Portfolio Value</span>
            <span className="text-lg font-bold">{formatNumber(summary?.totalValue || 0)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <CheckCircle className="h-3 w-3 text-green-500" />
                In Range
              </span>
              <span className="font-medium text-green-600">
                {formatNumber(summary?.activeValue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-muted-foreground">
                <AlertCircle className="h-3 w-3 text-orange-500" />
                Out of Range
              </span>
              <span className="font-medium text-orange-600">
                {formatNumber(summary?.inactiveValue || 0)}
              </span>
            </div>
          </div>

          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-green-500 transition-all duration-300"
              style={{ width: `${summary?.activePercent || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{summary?.activeCount || 0} Active</span>
            <span>{summary?.activePercent?.toFixed(0) || 0}% In Range</span>
            <span>{summary?.inactiveCount || 0} Inactive</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2">
        {positions.map((position, index) => {
          const isActive = activePositions.includes(position);
          const currentTick = position.data.pool.tickCurrentIndex;
          const tickRange = position.data.tickUpperIndex - position.data.tickLowerIndex;
          const tickPosition = ((currentTick - position.data.tickLowerIndex) / tickRange) * 100;
          
          return (
            <Card key={index} className="p-3 hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-orange-500'}`} />
                    <span className="font-medium text-sm">
                      {position.data.tokenA?.symbol || 'Unknown'}/{position.data.tokenB?.symbol || 'Unknown'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatNumber(position.data.positionValueUSD || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {isActive ? 'Earning fees' : 'Inactive'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min</span>
                    <span>Current Price</span>
                    <span>Max</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full">
                    <div 
                      className={`absolute h-full rounded-full ${
                        isActive ? 'bg-green-500/30' : 'bg-orange-500/30'
                      }`}
                      style={{ left: '0%', right: '0%' }}
                    />
                    {isActive && (
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground"
                        style={{ left: `${Math.max(0, Math.min(100, tickPosition))}%` }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Liquidity</div>
                    <div className="font-medium">
                      {formatNumber(parseFloat(position.data.liquidity.toString()) / 1e6)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Fees</div>
                    <div className="font-medium">
                      ${((position.data.feeOwedA || 0) + (position.data.feeOwedB || 0)).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Range</div>
                    <div className="font-medium flex items-center gap-0.5">
                      {isActive ? (
                        <>
                          <TrendingUp className="h-3 w-3 text-green-500" />
                          <span className="text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="h-3 w-3 text-orange-500" />
                          <span className="text-orange-600">Out</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {summary && summary.totalFees > 0 && (
        <div className="p-3 border-t bg-muted/50">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-3 w-3" />
              Unclaimed Fees
            </span>
            <span className="font-medium text-green-600">
              +${summary.totalFees.toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
} 