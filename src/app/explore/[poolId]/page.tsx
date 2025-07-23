"use client";

import { LiquidityDistribution } from "@/components/charts/liquidity-distribution";
import { PriceChart } from "@/components/charts/price-chart";
import { TVLVolumeChart } from "@/components/charts/tvl-volume-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePoolDetails } from "@/hooks/usePoolDetails";
import {
  formatNumber,
  generateLiquidityDistribution,
  generatePriceHistory,
  generateTVLHistory,
  generateVolumeHistory,
} from "@/lib/chartData";
import { Activity, ArrowLeft, DollarSign, Droplets, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.poolId as string;
  const { pool, isLoading } = usePoolDetails(poolId);

  // Generate chart data when pool data is available
  const chartData = useMemo(() => {
    if (!pool) return null;

    const currentPrice = pool.price.toNumber();
    const priceHistory = generatePriceHistory(currentPrice, 30);
    const tvlHistory = generateTVLHistory(pool.liquidity.toString(), 30);
    const volumeHistory = generateVolumeHistory(30);
    const liquidityDistribution = generateLiquidityDistribution(
      currentPrice,
      pool.tickSpacing,
      0 // tickCurrentIndex not available from API
    );

    // Combine TVL and volume data
    const tvlVolumeData = tvlHistory.map((tvl, index) => ({
      time: tvl.time,
      tvl: tvl.tvl,
      volume: volumeHistory[index]?.volume || 0,
    }));

    return {
      priceHistory,
      tvlVolumeData,
      liquidityDistribution,
    };
  }, [pool]);

  const stats = useMemo(() => {
    if (!pool) return null;
    
    return {
      price: pool.price.toFixed(6),
      tvl: pool.tvl,
      volume24h: pool.volume24h || 0,
      fees24h: pool.fees24h || 0,
      apr: pool.apr || 0,
      liquidity: pool.liquidity,
      feeRate: pool.feeRate / 10000,
    };
  }, [pool]);


  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/explore">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-16" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    );
  }

  if (!pool) {
    return (
      <Container className="py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Pool not found</p>
              <Button asChild className="mt-4">
                <Link href="/explore">Back to Explorer</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const tokenASymbol = pool.tokenA?.symbol || "Token A";
  const tokenBSymbol = pool.tokenB?.symbol || "Token B";
  const feePercent = (pool.feeRate / 10000).toFixed(2);

  // Use real data from API
  const tvl = pool.tvl || 0;
  const volume24h = pool.volume24h || 0;
  const apr = pool.apr || 0;
  const fees24h = pool.fees24h || 0;

  return (
    <Container className="py-8">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/explore">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tokenASymbol}/{tokenBSymbol}</h1>
            <p className="text-muted-foreground">{feePercent}% Fee Tier</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">TVL</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(tvl)}
              </div>
              <p className="text-xs text-muted-foreground">Total value locked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume 24h</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(volume24h)}
              </div>
              <p className="text-xs text-muted-foreground">Trading volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">APR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {apr.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">Estimated APR</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liquidity</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(parseFloat(pool.liquidity) / 1e15)}Q
              </div>
              <p className="text-xs text-muted-foreground">Active liquidity</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pool Analytics</CardTitle>
            <CardDescription>Historical data and liquidity distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="price" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="price">Price</TabsTrigger>
                <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
                <TabsTrigger value="tvl">TVL</TabsTrigger>
                <TabsTrigger value="volume">Volume</TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Current: {pool.price.toFixed(4)} {tokenBSymbol} per {tokenASymbol}
                  </div>
                  {chartData ? (
                    <PriceChart 
                      data={chartData.priceHistory} 
                      tokenSymbol={tokenASymbol}
                    />
                  ) : (
                    <Skeleton className="h-64 w-full" />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="liquidity" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Active liquidity distribution across price ranges
                  </div>
                  {chartData ? (
                    <LiquidityDistribution
                      data={chartData.liquidityDistribution}
                      currentPrice={pool.price.toNumber()}
                    />
                  ) : (
                    <Skeleton className="h-64 w-full" />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tvl" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Total value locked over time
                  </div>
                  {chartData ? (
                    <TVLVolumeChart 
                      data={chartData.tvlVolumeData} 
                      showVolume={false}
                    />
                  ) : (
                    <Skeleton className="h-64 w-full" />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="volume" className="mt-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    24-hour trading volume
                  </div>
                  {chartData ? (
                    <TVLVolumeChart 
                      data={chartData.tvlVolumeData} 
                      showTVL={false}
                    />
                  ) : (
                    <Skeleton className="h-64 w-full" />
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Pool Information</CardTitle>
                <CardDescription>Detailed pool statistics and parameters</CardDescription>
              </div>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/explore/${poolId}/add-liquidity`}>
                  Add Liquidity
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground text-sm">Pool Address</span>
                  <span className="font-mono text-xs truncate max-w-[150px]" title={poolId}>
                    {poolId.slice(0, 8)}...{poolId.slice(-8)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Token A</span>
                  <span className="text-sm">{tokenASymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Token B</span>
                  <span className="text-sm">{tokenBSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fee Rate</span>
                  <span>{feePercent}%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tick Spacing</span>
                  <span>{pool.tickSpacing}</span>
                </div>
                {/* Current tick not available from API */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span>{pool.price.toFixed(4)} {tokenBSymbol} per {tokenASymbol}</span>
                </div>
                {/* sqrt Price not available from API */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
} 