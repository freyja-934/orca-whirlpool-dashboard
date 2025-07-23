"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePoolDetails } from "@/hooks/usePoolDetails";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useWallet } from "@/hooks/useWallet";
import { addLiquidity } from "@/lib/liquidityService";
import { getFullRangeTicks, priceRangeToTicks } from "@/lib/priceUtils";
import { AlertCircle, ArrowLeft, Info, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  tokenAAmount: string;
  tokenBAmount: string;
  priceMin: string;
  priceMax: string;
}

export default function AddLiquidityPage() {
  const params = useParams();
  const router = useRouter();
  const poolId = params.poolId as string;
  const { pool, isLoading } = usePoolDetails(poolId);
  const { isConnected, publicKey, wallet, connection } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rangeType, setRangeType] = useState<"full" | "custom">("full");
  const [txStatus, setTxStatus] = useState<"idle" | "creating" | "signing" | "confirming" | "success" | "error">("idle");
  const [txError, setTxError] = useState<string | null>(null);
  const [slippageTolerance, setSlippageTolerance] = useState(0.01); // 1% default
  const [showSlippageSettings, setShowSlippageSettings] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      tokenAAmount: "",
      tokenBAmount: "",
      priceMin: "",
      priceMax: "",
    },
  });

  const tokenAAmount = watch("tokenAAmount");
  const tokenBAmount = watch("tokenBAmount");

  // Fetch token balances
  const tokenABalance = useTokenBalance(pool?.tokenA.address);
  const tokenBBalance = useTokenBalance(pool?.tokenB.address);

  // Auto-calculate token ratios
  useEffect(() => {
    if (!pool) return;
    
    const currentPrice = pool.price.toNumber();
    
    // When token A amount changes, calculate token B
    if (tokenAAmount && !tokenBAmount) {
      const calculatedB = parseFloat(tokenAAmount) * currentPrice;
      setValue("tokenBAmount", calculatedB.toFixed(6));
    }
  }, [tokenAAmount, pool, setValue, tokenBAmount]);
  
  useEffect(() => {
    if (!pool) return;
    
    const currentPrice = pool.price.toNumber();
    
    // When token B amount changes, calculate token A
    if (tokenBAmount && !tokenAAmount) {
      const calculatedA = parseFloat(tokenBAmount) / currentPrice;
      setValue("tokenAAmount", calculatedA.toFixed(6));
    }
  }, [tokenBAmount, pool, setValue, tokenAAmount]);

  // Handle redirect on success
  useEffect(() => {
    if (txStatus === "success") {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 2000); // Redirect after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [txStatus, router]);

  const onSubmit = async (data: FormData) => {
    if (!isConnected || !publicKey || !pool) return;

    setIsSubmitting(true);
    setTxStatus("creating");
    setTxError(null);
    try {
      // Calculate tick indices based on range type
      const ticks = rangeType === "full"
        ? getFullRangeTicks(pool.tickSpacing)
        : priceRangeToTicks(
            parseFloat(data.priceMin),
            parseFloat(data.priceMax),
            pool.tokenA.decimals,
            pool.tokenB.decimals,
            pool.tickSpacing
          );

      // Call the liquidity service
      const result = await addLiquidity(connection, wallet as any, {
        poolAddress: poolId,
        tokenAAmount: data.tokenAAmount,
        tokenBAmount: data.tokenBAmount,
        tickLower: ticks.tickLower,
        tickUpper: ticks.tickUpper,
        slippageTolerance: slippageTolerance, // Use slippageTolerance state
      });

      // For now, show success message
      // In production, sign and send the transaction
      console.log("Transaction created:", result);
      setTxStatus("success");
      alert("Add liquidity transaction created! (Not sent - implementation pending)");
      
      // TODO: Sign and send transaction
      // setTxStatus("signing");
      // const signature = await wallet.sendTransaction(result.transaction, connection);
      // setTxStatus("confirming");
      // await connection.confirmTransaction(signature);
      // setTxStatus("success");
      // router.push("/dashboard");
    } catch (error) {
      console.error("Error adding liquidity:", error);
      setTxStatus("error");
      setTxError(error instanceof Error ? error.message : "Failed to add liquidity");
      alert(`Failed to add liquidity: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
      // Reset status after 5 seconds
      setTimeout(() => {
        if (txStatus === "success" || txStatus === "error") {
          setTxStatus("idle");
          setTxError(null);
        }
      }, 5000);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </Container>
    );
  }

  if (!pool) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Pool not found</h1>
          <Link href="/explore">
            <Button>Back to Pools</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const tokenASymbol = pool.tokenA.symbol;
  const tokenBSymbol = pool.tokenB.symbol;
  const currentPrice = pool.price.toNumber();

  return (
    <Container className="py-8 max-w-2xl">
      <div className="mb-6">
        <Link href={`/explore/${poolId}`}>
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pool
          </Button>
        </Link>
        
        <div className="flex items-center gap-4 mb-2">
          <div className="flex items-center gap-2">
            {pool.tokenA.logoURI && (
              <Image
                src={pool.tokenA.logoURI}
                alt={tokenASymbol}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            {pool.tokenB.logoURI && (
              <Image
                src={pool.tokenB.logoURI}
                alt={tokenBSymbol}
                width={32}
                height={32}
                className="rounded-full -ml-2"
              />
            )}
          </div>
          <h1 className="text-2xl font-bold">
            Add Liquidity to {tokenASymbol}/{tokenBSymbol}
          </h1>
          <Badge variant="outline">{(pool.feeRate / 10000).toFixed(2)}%</Badge>
        </div>
        <p className="text-muted-foreground">
          Current Price: 1 {tokenASymbol} = {currentPrice.toFixed(4)} {tokenBSymbol}
        </p>
      </div>

      {!isConnected && (
        <Card className="mb-6 border-yellow-600/20 bg-yellow-600/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Please connect your wallet to add liquidity</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Status Banner */}
      {txStatus !== "idle" && (
        <Card className={`mb-6 ${
          txStatus === "success" ? "border-green-600/20 bg-green-600/5" :
          txStatus === "error" ? "border-red-600/20 bg-red-600/5" :
          "border-blue-600/20 bg-blue-600/5"
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {txStatus === "creating" && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-blue-600">Creating transaction...</p>
                </>
              )}
              {txStatus === "signing" && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-blue-600">Please sign the transaction in your wallet...</p>
                </>
              )}
              {txStatus === "confirming" && (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
                  <p className="text-sm text-blue-600">Confirming transaction...</p>
                </>
              )}
              {txStatus === "success" && (
                <>
                  <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Position created successfully!</p>
                    <p className="text-xs text-green-600/70">Redirecting to dashboard...</p>
                  </div>
                </>
              )}
              {txStatus === "error" && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-600">{txError || "Transaction failed"}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Deposit Amounts */}
        <Card>
          <CardHeader>
            <CardTitle>Deposit Amounts</CardTitle>
            <CardDescription>
              Enter the amount of tokens you want to deposit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                {tokenASymbol} Amount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  {...register("tokenAAmount", {
                    required: "Amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                    validate: (value) => {
                      const amount = parseFloat(value);
                      if (tokenABalance.data !== undefined && amount > tokenABalance.data) {
                        return "Insufficient balance";
                      }
                      return true;
                    },
                  })}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {tokenASymbol}
                </span>
              </div>
              {tokenABalance.data !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {tokenABalance.data.toFixed(6)} {tokenASymbol}
                </p>
              )}
              {errors.tokenAAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.tokenAAmount.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {tokenBSymbol} Amount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.000001"
                  placeholder="0.00"
                  {...register("tokenBAmount", {
                    required: "Amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                    validate: (value) => {
                      const amount = parseFloat(value);
                      if (tokenBBalance.data !== undefined && amount > tokenBBalance.data) {
                        return "Insufficient balance";
                      }
                      return true;
                    },
                  })}
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {tokenBSymbol}
                </span>
              </div>
              {tokenBBalance.data !== undefined && (
                <p className="text-xs text-muted-foreground mt-1">
                  Balance: {tokenBBalance.data.toFixed(6)} {tokenBSymbol}
                </p>
              )}
              {errors.tokenBAmount && (
                <p className="text-sm text-red-500 mt-1">{errors.tokenBAmount.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle>Set Price Range</CardTitle>
            <CardDescription>
              Select the price range for your liquidity position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={rangeType === "full" ? "default" : "outline"}
                onClick={() => setRangeType("full")}
                className="flex-1"
              >
                Full Range
              </Button>
              <Button
                type="button"
                variant={rangeType === "custom" ? "default" : "outline"}
                onClick={() => setRangeType("custom")}
                className="flex-1"
              >
                Custom Range
              </Button>
            </div>

            {rangeType === "custom" && (
              <>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Min Price ({tokenBSymbol} per {tokenASymbol})
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder={`${(currentPrice * 0.5).toFixed(4)}`}
                    {...register("priceMin", {
                      required: rangeType === "custom" ? "Min price is required" : false,
                      min: { value: 0, message: "Price must be positive" },
                    })}
                  />
                  {errors.priceMin && (
                    <p className="text-sm text-red-500 mt-1">{errors.priceMin.message}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Max Price ({tokenBSymbol} per {tokenASymbol})
                  </label>
                  <Input
                    type="number"
                    step="0.000001"
                    placeholder={`${(currentPrice * 1.5).toFixed(4)}`}
                    {...register("priceMax", {
                      required: rangeType === "custom" ? "Max price is required" : false,
                      min: { value: 0, message: "Price must be positive" },
                      validate: (value) => {
                        const min = watch("priceMin");
                        return !min || parseFloat(value) > parseFloat(min) || "Max price must be greater than min price";
                      },
                    })}
                  />
                  {errors.priceMax && (
                    <p className="text-sm text-red-500 mt-1">{errors.priceMax.message}</p>
                  )}
                </div>
              </>
            )}

            {rangeType === "full" && (
              <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  Full range positions provide liquidity across all possible prices. 
                  This means your liquidity will always be active but may earn lower fees 
                  compared to concentrated positions.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slippage Settings */}
        <Card>
          <CardHeader 
            className="cursor-pointer"
            onClick={() => setShowSlippageSettings(!showSlippageSettings)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transaction Settings</CardTitle>
              <span className="text-sm text-muted-foreground">
                Slippage: {(slippageTolerance * 100).toFixed(1)}%
              </span>
            </div>
          </CardHeader>
          {showSlippageSettings && (
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Slippage Tolerance
                  </label>
                  <div className="flex gap-2">
                    {[0.001, 0.005, 0.01, 0.03].map((value) => (
                      <Button
                        key={value}
                        type="button"
                        size="sm"
                        variant={slippageTolerance === value ? "default" : "outline"}
                        onClick={() => setSlippageTolerance(value)}
                      >
                        {(value * 100).toFixed(1)}%
                      </Button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="50"
                      value={(slippageTolerance * 100).toFixed(1)}
                      onChange={(e) => setSlippageTolerance(parseFloat(e.target.value) / 100)}
                      className="w-24"
                    />
                    <span className="ml-2 text-sm text-muted-foreground">%</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your transaction will revert if the price changes unfavorably by more than this percentage.
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Position Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Position Type</span>
                <span className="font-medium">
                  {rangeType === "full" ? "Full Range" : "Custom Range"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Tier</span>
                <span className="font-medium">{(pool.feeRate / 10000).toFixed(2)}%</span>
              </div>
              {tokenAAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tokenASymbol} Deposit</span>
                  <span className="font-medium">{tokenAAmount} {tokenASymbol}</span>
                </div>
              )}
              {tokenBAmount && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{tokenBSymbol} Deposit</span>
                  <span className="font-medium">{tokenBAmount} {tokenBSymbol}</span>
                </div>
              )}
              
              {/* Show tick range preview */}
              {(rangeType === "full" || (watch("priceMin") && watch("priceMax"))) && (
                <>
                  <div className="border-t pt-2 mt-2" />
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Position Range Preview
                  </div>
                  {(() => {
                    const ticks = rangeType === "full" 
                      ? getFullRangeTicks(pool.tickSpacing)
                      : priceRangeToTicks(
                          parseFloat(watch("priceMin") || "0"),
                          parseFloat(watch("priceMax") || "0"),
                          pool.tokenA.decimals,
                          pool.tokenB.decimals,
                          pool.tickSpacing
                        );
                    
                    return (
                      <>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Tick Range</span>
                          <span className="font-mono">
                            {ticks.tickLower} ↔ {ticks.tickUpper}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Price Range</span>
                          <span className="font-mono">
                            {rangeType === "full" 
                              ? "0 ↔ ∞"
                              : `${watch("priceMin") || "?"} ↔ ${watch("priceMax") || "?"}`
                            }
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={!isConnected || isSubmitting}
        >
          {isSubmitting ? (
            "Adding Liquidity..."
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Add Liquidity
            </>
          )}
        </Button>
      </form>
    </Container>
  );
} 