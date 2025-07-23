import {
  fetchPositionsForOwner,
  setWhirlpoolsConfig,
} from "@orca-so/whirlpools";
import { address, createSolanaRpc } from "@solana/kit";
import { TokenInfo } from "@solana/spl-token-registry";
import { Connection, PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { getWhirlpoolClient } from "./orcaClient";

export interface PoolInfo {
  address: PublicKey;
  tokenA: TokenInfo;
  tokenB: TokenInfo;
  price: Decimal;
  tvl: number;
  feeRate: number;
  tickSpacing: number;
  liquidity: string;
  volume24h?: number;
  fees24h?: number;
  apr?: number;
}

export interface PositionInfo {
  mint: PublicKey;
  bundleIndex?: number;
  data: {
    liquidity: string | number;
    tickLowerIndex: number;
    tickUpperIndex: number;
    feeGrowthInsideA: Uint8Array;
    feeGrowthInsideB: Uint8Array;
    feeOwedA: number;
    feeOwedB: number;
    rewardInfos: Array<{ growthInsideCheckpoint: string; amountOwed: string }>;
    whirlpool: PublicKey;
    positionMint: PublicKey;
    pool: unknown;
    tokenA: TokenInfo;
    tokenB: TokenInfo;
    positionValueUSD?: number;
  };
}

interface OrcaPoolData {
  address: string;
  tokenA: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    imageUrl?: string;
  };
  tokenB: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    imageUrl?: string;
  };
  price: string;
  tvlUsdc: string;
  feeRate: number;
  tickSpacing: number;
  liquidity: string;
  stats?: {
    "24h": {
      volume: string;
      fees: string;
      yieldOverTvl: string;
    };
  };
}

export async function fetchPoolsWithDetails(connection: Connection, limit: number = 50): Promise<PoolInfo[]> {
  try {
    const response = await fetch(`https://api.orca.so/v2/solana/pools?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pools: ${response.statusText}`);
    }
    
    const data = await response.json();
    const pools: OrcaPoolData[] = data.data;
    
    return pools.map((pool) => {
      const tokenA: TokenInfo = {
        chainId: 101,
        address: pool.tokenA.address,
        symbol: pool.tokenA.symbol,
        name: pool.tokenA.name,
        decimals: pool.tokenA.decimals,
        logoURI: pool.tokenA.imageUrl || "",
        tags: [],
      };
      
      const tokenB: TokenInfo = {
        chainId: 101,
        address: pool.tokenB.address,
        symbol: pool.tokenB.symbol,
        name: pool.tokenB.name,
        decimals: pool.tokenB.decimals,
        logoURI: pool.tokenB.imageUrl || "",
        tags: [],
      };
      
      const tvl = parseFloat(pool.tvlUsdc);
      const volume24h = pool.stats?.["24h"]?.volume ? parseFloat(pool.stats["24h"].volume) : undefined;
      const fees24h = pool.stats?.["24h"]?.fees ? parseFloat(pool.stats["24h"].fees) : undefined;
      const apr = pool.stats?.["24h"]?.yieldOverTvl ? parseFloat(pool.stats["24h"].yieldOverTvl) * 365 * 100 : undefined;
      
      return {
        address: new PublicKey(pool.address),
        tokenA,
        tokenB,
        price: new Decimal(pool.price),
        tvl,
        feeRate: pool.feeRate,
        tickSpacing: pool.tickSpacing,
        liquidity: pool.liquidity,
        volume24h,
        fees24h,
        apr,
      };
    });
  } catch (error) {
    console.error("Error fetching pools from Orca API:", error);
    return [];
  }
}

export async function fetchPoolDetails(
  connection: Connection,
  poolAddress: string
): Promise<PoolInfo | null> {
  try {
    const response = await fetch(`https://api.orca.so/v2/solana/pools/${poolAddress}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch pool details: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    const pool: OrcaPoolData = responseData.data;
    
    const tokenA: TokenInfo = {
      chainId: 101,
      address: pool.tokenA.address,
      symbol: pool.tokenA.symbol,
      name: pool.tokenA.name,
      decimals: pool.tokenA.decimals,
      logoURI: pool.tokenA.imageUrl || "",
      tags: [],
    };
    
    const tokenB: TokenInfo = {
      chainId: 101,
      address: pool.tokenB.address,
      symbol: pool.tokenB.symbol,
      name: pool.tokenB.name,
      decimals: pool.tokenB.decimals,
      logoURI: pool.tokenB.imageUrl || "",
      tags: [],
    };
    
    const tvl = parseFloat(pool.tvlUsdc);
    const volume24h = pool.stats?.["24h"]?.volume ? parseFloat(pool.stats["24h"].volume) : undefined;
    const fees24h = pool.stats?.["24h"]?.fees ? parseFloat(pool.stats["24h"].fees) : undefined;
    const apr = pool.stats?.["24h"]?.yieldOverTvl ? parseFloat(pool.stats["24h"].yieldOverTvl) * 365 * 100 : undefined;
    
    return {
      address: new PublicKey(pool.address),
      tokenA,
      tokenB,
      price: new Decimal(pool.price),
      tvl,
      feeRate: pool.feeRate,
      tickSpacing: pool.tickSpacing,
      liquidity: pool.liquidity,
      volume24h,
      fees24h,
      apr,
    };
  } catch (error) {
    console.error("Error fetching pool details from Orca API:", error);
    return null;
  }
}

export async function fetchUserPositions(
  connection: Connection,
  walletAddress: PublicKey
) {
  try {
    console.log("Fetching positions for wallet:", walletAddress.toString());
    
    setWhirlpoolsConfig("solanaMainnet");
    
    const rpc = createSolanaRpc(connection.rpcEndpoint);
    const ownerAddr = address(walletAddress.toString());
    const sdkPositions = await fetchPositionsForOwner(rpc, ownerAddr);
    
    console.log(`Found ${sdkPositions.length} positions`);
    
    const positions = [];
    
    for (const sdkPosition of sdkPositions) {
      try {
        if (sdkPosition.isPositionBundle) {
          console.log("Skipping position bundle (not yet supported)");
          continue;
        }
        
        const positionData = sdkPosition.data as unknown;
        const positionAddress = sdkPosition.address;
        
        const legacyClient = getWhirlpoolClient(connection);
        const whirlpoolAddress = new PublicKey((positionData as any).whirlpool);
        const pool = await legacyClient.fetcher.getPool(whirlpoolAddress);
        
        if (pool) {
          const poolDetailsResponse = await fetch(`https://api.orca.so/v2/solana/pools/${whirlpoolAddress.toString()}`);
          let tokenA: TokenInfo;
          let tokenB: TokenInfo;
          
          let poolData: OrcaPoolData | null = null;
          
          if (poolDetailsResponse.ok) {
            const response = await poolDetailsResponse.json();
            console.log('Pool data from Orca API:', response);
            poolData = response.data as OrcaPoolData;
            
            if (!poolData || !poolData.tokenA || !poolData.tokenB) {
              console.error('Invalid pool data structure:', response);
              // Fallback to basic token info
              tokenA = {
                chainId: 101,
                address: pool.tokenMintA.toString(),
                symbol: `${pool.tokenMintA.toString().slice(0, 4)}...`,
                name: "Unknown Token",
                decimals: 6,
                logoURI: "",
                tags: [],
              };
              tokenB = {
                chainId: 101,
                address: pool.tokenMintB.toString(),
                symbol: `${pool.tokenMintB.toString().slice(0, 4)}...`,
                name: "Unknown Token",
                decimals: 6,
                logoURI: "",
                tags: [],
              };
            } else {
              tokenA = {
                chainId: 101,
                address: poolData.tokenA.address,
                symbol: poolData.tokenA.symbol,
                name: poolData.tokenA.name,
                decimals: poolData.tokenA.decimals,
                logoURI: poolData.tokenA.imageUrl || "",
                tags: [],
              };
              tokenB = {
                chainId: 101,
                address: poolData.tokenB.address,
                symbol: poolData.tokenB.symbol,
                name: poolData.tokenB.name,
                decimals: poolData.tokenB.decimals,
                logoURI: poolData.tokenB.imageUrl || "",
                tags: [],
              };
            }
          } else {
            tokenA = {
              chainId: 101,
              address: pool.tokenMintA.toString(),
              symbol: `${pool.tokenMintA.toString().slice(0, 4)}...`,
              name: "Unknown Token",
              decimals: 6,
              logoURI: "",
              tags: [],
            };
            tokenB = {
              chainId: 101,
              address: pool.tokenMintB.toString(),
              symbol: `${pool.tokenMintB.toString().slice(0, 4)}...`,
              name: "Unknown Token",
              decimals: 6,
              logoURI: "",
              tags: [],
            };
          }
          
                      console.log(`Position: ${tokenA.symbol}/${tokenB.symbol}`);
          
          const positionMint = new PublicKey(positionAddress);
          
          // Calculate position value in USD
          let positionValueUSD: number | undefined;
          if (poolDetailsResponse.ok && poolData) {
            // Get position liquidity from the actual position data
            const positionLiquidityBN = (positionData as any).liquidity;
            const positionLiquidity = typeof positionLiquidityBN === 'string' 
              ? parseFloat(positionLiquidityBN) 
              : parseFloat(positionLiquidityBN.toString());
            
            // Get pool liquidity from the pool data (not from API which might be in different units)
            const poolLiquidityBN = pool.liquidity;
            const poolLiquidity = typeof poolLiquidityBN === 'string'
              ? parseFloat(poolLiquidityBN)
              : parseFloat(poolLiquidityBN.toString());
            
            // Check if position is in range
            const tickLower = (positionData as any).tickLowerIndex;
            const tickUpper = (positionData as any).tickUpperIndex;
            const currentTick = pool.tickCurrentIndex;
            const isInRange = currentTick >= tickLower && currentTick <= tickUpper;
            

            
            // For concentrated liquidity positions, we need to calculate actual token amounts
            // The simple liquidity proportion method is not accurate for concentrated liquidity
            
            const poolTVL = parseFloat(poolData.tvlUsdc || "0");
            
            // For now, use simplified calculation
            // TODO: Implement proper concentrated liquidity math to calculate actual token amounts
            if (poolLiquidity > 0) {
              positionValueUSD = (positionLiquidity / poolLiquidity) * poolTVL;
            }
          }
          
          positions.push({
            mint: positionMint,
            data: {
              liquidity: (positionData as any).liquidity,
              tickLowerIndex: (positionData as any).tickLowerIndex,
              tickUpperIndex: (positionData as any).tickUpperIndex,
              feeGrowthInsideA: (positionData as any).feeGrowthInsideCheckpointA || new Uint8Array(32),
              feeGrowthInsideB: (positionData as any).feeGrowthInsideCheckpointB || new Uint8Array(32),
              feeOwedA: (positionData as any).tokenOwedA || 0,
              feeOwedB: (positionData as any).tokenOwedB || 0,
              rewardInfos: (positionData as any).rewardInfos || [],
              whirlpool: new PublicKey((positionData as any).whirlpool),
              positionMint: positionMint,
              pool: {
                ...pool,
                address: whirlpoolAddress,
              },
              tokenA,
              tokenB,
              positionValueUSD,
            },
          });
        }
      } catch (error) {
        console.error("Error processing position:", error);
        continue;
      }
    }
    
    console.log(`Total positions processed: ${positions.length}`);
    return positions;
    
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return [];
  }
} 