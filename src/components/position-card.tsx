import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenInfo } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { Decimal } from "decimal.js";
import { ArrowUpRight, DollarSign } from "lucide-react";

interface PositionData {
  mint: PublicKey;
  data: {
    liquidity: BN;
    tickLowerIndex: number;
    tickUpperIndex: number;
    feeGrowthCheckpointA: BN;
    feeGrowthCheckpointB: BN;
    feeOwedA: BN;
    feeOwedB: BN;
    pool: {
      tickCurrentIndex: number;
      tokenMintA: PublicKey;
      tokenMintB: PublicKey;
      feeRate: number;
    };
  };
}

interface PositionCardProps {
  position: PositionData;
  tokenA?: TokenInfo;
  tokenB?: TokenInfo;
  price?: Decimal;
}

export function PositionCard({ position, tokenA, tokenB, price }: PositionCardProps) {
  const lowerTick = position.data.tickLowerIndex;
  const upperTick = position.data.tickUpperIndex;
  const currentTick = position.data.pool.tickCurrentIndex;
  const isInRange = currentTick >= lowerTick && currentTick <= upperTick;

  const tokenASymbol = tokenA?.symbol || "Token A";
  const tokenBSymbol = tokenB?.symbol || "Token B";
  const feeRate = position.data.pool.feeRate / 10000;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              {tokenASymbol}/{tokenBSymbol}
            </CardTitle>
            <CardDescription>
              {feeRate}% Fee Tier
            </CardDescription>
          </div>
          <Badge variant={isInRange ? "default" : "secondary"}>
            {isInRange ? "In Range" : "Out of Range"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Value</p>
            <p className="text-lg font-semibold">$0.00</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unclaimed Fees</p>
            <p className="text-lg font-semibold">$0.00</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min Price</span>
            <span className="font-medium">-</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current Price</span>
            <span className="font-medium">
              {price ? price.toFixed(4) : "-"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Max Price</span>
            <span className="font-medium">-</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <DollarSign className="mr-2 h-4 w-4" />
            Collect Fees
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Manage
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 