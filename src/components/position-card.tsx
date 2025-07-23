import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PriceMath } from "@orca-so/whirlpools-sdk";
import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Droplets, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PositionData {
  mint: PublicKey;
  bundleIndex?: number; // For position bundles
  data: {
    liquidity: BN | string;
    tickLowerIndex: number;
    tickUpperIndex: number;
    feeGrowthInsideA: Uint8Array;
    feeGrowthInsideB: Uint8Array;
    feeOwedA: BN | number;
    feeOwedB: BN | number;
    whirlpool: PublicKey;
    pool: {
      tickCurrentIndex: number;
      sqrtPrice: BN | string;
      tokenMintA: PublicKey;
      tokenMintB: PublicKey;
      feeRate: number;
      liquidity: BN | string;
      address: PublicKey; // Added for pool address
    };
    tokenA?: TokenInfo;
    tokenB?: TokenInfo;
    positionValueUSD?: number; // Added for position value
  };
}

interface PositionCardProps {
  position: PositionData;
}

export function PositionCard({ position }: PositionCardProps) {
  const lowerTick = position.data.tickLowerIndex;
  const upperTick = position.data.tickUpperIndex;
  const currentTick = position.data.pool.tickCurrentIndex;
  const isInRange = currentTick >= lowerTick && currentTick <= upperTick;

  const tokenASymbol = position.data.tokenA?.symbol || "Token A";
  const tokenBSymbol = position.data.tokenB?.symbol || "Token B";
  const tokenADecimals = position.data.tokenA?.decimals || 9;
  const tokenBDecimals = position.data.tokenB?.decimals || 6;
  const feeRate = position.data.pool.feeRate / 10000;

  // Calculate prices from ticks
  const lowerPrice = PriceMath.tickIndexToPrice(lowerTick, tokenADecimals, tokenBDecimals);
  const upperPrice = PriceMath.tickIndexToPrice(upperTick, tokenADecimals, tokenBDecimals);
  const currentPrice = PriceMath.tickIndexToPrice(currentTick, tokenADecimals, tokenBDecimals);

  // Liquidity display
  const liquidityBN = typeof position.data.liquidity === 'string' 
    ? new BN(position.data.liquidity) 
    : position.data.liquidity;
  
  const liquidityNum = parseFloat(liquidityBN.toString()) / 1e6;
  
  // Use positionValueUSD if available, otherwise use the old calculation
  const positionValue = position.data.positionValueUSD || liquidityNum;

  // Calculate pool share percentage if we have pool liquidity
  let poolSharePercentage: number | undefined;
  if (position.data.pool.liquidity) {
    const poolLiquidityBN = typeof position.data.pool.liquidity === 'string'
      ? new BN(position.data.pool.liquidity)
      : position.data.pool.liquidity;
    const poolLiquidityNum = parseFloat(poolLiquidityBN.toString());
    const positionLiquidityNum = parseFloat(liquidityBN.toString());
    
    if (poolLiquidityNum > 0) {
      poolSharePercentage = (positionLiquidityNum / poolLiquidityNum) * 100;
    }
  }

  // Calculate unclaimed fees
  const feeOwedA = typeof position.data.feeOwedA === 'number' 
    ? position.data.feeOwedA 
    : parseInt(position.data.feeOwedA.toString());
  const feeOwedB = typeof position.data.feeOwedB === 'number'
    ? position.data.feeOwedB
    : parseInt(position.data.feeOwedB.toString());
  
  const feeValueA = feeOwedA / Math.pow(10, tokenADecimals);
  const feeValueB = feeOwedB / Math.pow(10, tokenBDecimals);
  
  // Get the pool address for the link
  const poolAddress = position.data.pool.tokenMintA ? 
    `${position.data.pool.tokenMintA.toString().slice(0, 8)}...` : '';

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
              <span className="truncate">{tokenASymbol}/{tokenBSymbol}</span>
              <Badge variant="outline" className="text-xs">
                {feeRate}%
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1 text-xs sm:text-sm">
              <Droplets className="h-3 w-3 flex-shrink-0" />
              Liquidity: {liquidityNum.toFixed(2)}
            </CardDescription>
          </div>
          <Badge 
            variant={isInRange ? "default" : "secondary"}
            className={cn("text-xs sm:text-sm flex-shrink-0", isInRange ? "bg-green-600" : "")}
          >
            {isInRange ? "In Range" : "Out of Range"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Pool Share</p>
            <div>
              {poolSharePercentage !== undefined ? (
                <p className="text-base sm:text-lg font-semibold">
                  {poolSharePercentage < 0.0001 
                    ? "<0.0001%" 
                    : `${poolSharePercentage.toFixed(4)}%`}
                </p>
              ) : (
                <p className="text-base sm:text-lg font-semibold">
                  {liquidityNum.toFixed(2)}
                  <span className="text-xs text-muted-foreground ml-1">liquidity</span>
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-muted-foreground">Unclaimed Fees</p>
            <p className="text-sm sm:text-base font-medium">
              {feeValueA > 0.0001 && (
                <span className="block">{feeValueA.toFixed(4)} {tokenASymbol}</span>
              )}
              {feeValueB > 0.0001 && (
                <span className="block">{feeValueB.toFixed(4)} {tokenBSymbol}</span>
              )}
              {feeValueA <= 0.0001 && feeValueB <= 0.0001 && (
                <span className="text-muted-foreground">None</span>
              )}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Price Range</span>
            <span className="font-mono text-xs">
              {lowerPrice.toFixed(6)} - {upperPrice.toFixed(6)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className={cn(
              "font-mono text-xs",
              isInRange ? "text-green-600" : "text-muted-foreground"
            )}>
              {currentPrice.toFixed(6)}
            </span>
          </div>
        </div>

        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Pool</span>
            <span className="font-mono truncate max-w-[150px]">{poolAddress}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tick Range</span>
            <span className="font-mono">{lowerTick} ↔ {upperTick}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {feeValueA > 0.001 || feeValueB > 0.001 ? (
            <Button size="sm" className="w-full sm:w-auto">
              <TrendingUp className="h-4 w-4 mr-2" />
              Collect Fees
            </Button>
          ) : null}
          <Link href={`/explore/${position.data.whirlpool.toString()}`} className="w-full sm:w-auto">
            <Button variant="outline" size="sm" className="w-full">
              View Pool
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 