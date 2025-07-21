import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoolInfo } from "@/lib/fetchWhirlpoolPools";
import { Activity, DollarSign, Droplets, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PoolCardProps {
  pool: PoolInfo;
}

export function PoolCard({ pool }: PoolCardProps) {
  const tokenASymbol = pool.tokenA?.symbol || "???";
  const tokenBSymbol = pool.tokenB?.symbol || "???";
  const feePercent = (pool.feeRate / 10000).toFixed(2);
  const apr = Math.random() * 50;

  return (
    <Link href={`/explore/${pool.address.toString()}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {tokenASymbol}/{tokenBSymbol}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {feePercent}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Active Pool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                TVL
              </p>
              <p className="text-lg font-semibold">
                ${pool.tvl.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                APR
              </p>
              <p className="text-lg font-semibold text-green-600">
                {apr.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                Liquidity
              </p>
              <p className="text-sm font-medium">
                ${(parseInt(pool.liquidity) / 1e9).toFixed(2)}B
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-sm font-medium">
                {pool.price.toFixed(4)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 