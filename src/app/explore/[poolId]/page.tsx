"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoolDetails } from "@/hooks/usePoolDetails";
import { Activity, ArrowLeft, DollarSign, Droplets, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PoolDetailPage() {
  const params = useParams();
  const poolId = params.poolId as string;
  const { pool, isLoading } = usePoolDetails(poolId);

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
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">Total value locked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume 24h</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">Trading volume</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">APR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">0.00%</div>
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
                ${(parseInt(pool.liquidity.toString()) / 1e9).toFixed(2)}B
              </div>
              <p className="text-xs text-muted-foreground">Active liquidity</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Price Chart</CardTitle>
              <CardDescription>Current price: {pool.price.toFixed(4)} {tokenBSymbol} per {tokenASymbol}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Price chart will be displayed here
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liquidity Distribution</CardTitle>
              <CardDescription>Active liquidity ranges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Liquidity distribution chart will be displayed here
              </div>
            </CardContent>
          </Card>
        </div>

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