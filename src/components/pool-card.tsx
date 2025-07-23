import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PoolInfo } from "@/lib/fetchWhirlpoolPools";
import { Activity, DollarSign, Percent } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PoolCardProps {
  pool: PoolInfo;
}

export function PoolCard({ pool }: PoolCardProps) {
  const tokenASymbol = pool.tokenA?.symbol || "???";
  const tokenBSymbol = pool.tokenB?.symbol || "???";
  const feePercent = (pool.feeRate / 10000).toFixed(2);
  const apr = pool.apr || 0;

  return (
    <Link href={`/explore/${pool.address.toString()}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex -space-x-2 flex-shrink-0">
                {pool.tokenA?.logoURI && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-background">
                    <Image
                      src={pool.tokenA.logoURI}
                      alt={tokenASymbol}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}
                {pool.tokenB?.logoURI && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-background">
                    <Image
                      src={pool.tokenB.logoURI}
                      alt={tokenBSymbol}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                )}
              </div>
              <CardTitle className="text-base sm:text-lg truncate">
                {tokenASymbol}/{tokenBSymbol}
              </CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs flex-shrink-0">
              {feePercent}%
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1 text-xs sm:text-sm">
            <Activity className="h-3 w-3" />
            Active Pool
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">TVL</span>
            <span className="font-medium flex items-center gap-1 text-sm sm:text-base">
              <DollarSign className="h-3 w-3" />
              {pool.tvl ? `$${(pool.tvl / 1e6).toFixed(1)}M` : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">APR</span>
            <span className="font-medium flex items-center gap-1 text-green-600 text-sm sm:text-base">
              <Percent className="h-3 w-3" />
              {apr.toFixed(2)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-muted-foreground">Liquidity</span>
            <span className="text-xs sm:text-sm font-mono">
              {pool.liquidity ? `${(parseFloat(pool.liquidity) / 1e15).toFixed(2)}Q` : "N/A"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
} 