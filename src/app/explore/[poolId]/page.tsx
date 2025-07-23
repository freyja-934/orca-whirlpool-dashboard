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
      pool.tickCurrentIndex
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

  // Calculate liquidity value (simplified - in production would need actual token prices)
  const liquidityNum = parseFloat(pool.liquidity.toString());
  const liquidityUSD = liquidityNum / 1e6; // Simplified conversion

  // Calculate TVL from liquidity (rough estimate)
  const tvl = liquidityUSD * pool.price.toNumber() * 0.5; // Simplified calculation

  // Get latest volume from chart data
  const latestVolume = chartData?.tvlVolumeData[chartData.tvlVolumeData.length - 1]?.volume || 0;

  // Calculate APR based on fees and volume (simplified)
  const dailyFees = latestVolume * (pool.feeRate / 1000000); // fee in basis points
  const annualizedFees = dailyFees * 365;
  const apr = tvl > 0 ? (annualizedFees / tvl) * 100 : 0;

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
                {formatNumber(latestVolume)}
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
                {formatNumber(liquidityUSD)}
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pool Information</CardTitle>
                <CardDescription>Detailed pool statistics and parameters</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/explore/${poolId}/add-liquidity`}>
                  Add Liquidity
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool Address</span>
                  <span className="font-mono text-sm">{poolId.slice(0, 8)}...{poolId.slice(-8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token A</span>
                  <span>{tokenASymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token B</span>
                  <span>{tokenBSymbol}</span>
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
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Tick</span>
                  <span>{pool.tickCurrentIndex.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price</span>
                  <span>{pool.price.toFixed(4)} {tokenBSymbol} per {tokenASymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">sqrt Price X64</span>
                  <span className="font-mono text-xs">{pool.sqrtPrice.toString().slice(0, 12)}...</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
} 