import { PriceMath } from "@orca-so/whirlpools-sdk";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { Connection, PublicKey } from "@solana/web3.js";
import { Decimal } from "decimal.js";
import { getWhirlpoolClient } from "./orcaClient";

export interface PoolInfo {
  address: PublicKey;
  tokenA: TokenInfo | undefined;
  tokenB: TokenInfo | undefined;
  price: Decimal;
  tvl: number;
  feeRate: number;
  tickSpacing: number;
  liquidity: string;
}

let tokenList: TokenInfo[] | null = null;

async function getTokenList(): Promise<TokenInfo[]> {
  if (!tokenList) {
    const provider = new TokenListProvider();
    const tokens = await provider.resolve();
    tokenList = tokens.filterByClusterSlug("mainnet-beta").getList();
  }
  return tokenList || [];
}

export async function fetchUserPositions(
  connection: Connection,
  walletAddress: PublicKey
) {
  try {
    const client = getWhirlpoolClient(connection);
    const accounts = await connection.getParsedTokenAccountsByOwner(
      walletAddress,
      {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      }
    );

    const positionMintAddresses = accounts.value
      .filter((account) => {
        const mintInfo = account.account.data.parsed.info;
        return mintInfo.tokenAmount.decimals === 0 && mintInfo.tokenAmount.uiAmount === 1;
      })
      .map((account) => new PublicKey(account.account.data.parsed.info.mint));

    const positions = [];
    for (const mintAddress of positionMintAddresses) {
      try {
        const position = await client.fetcher.getPosition(mintAddress);
        if (position) {
          const whirlpool = await client.fetcher.getPool(position.whirlpool);
          if (whirlpool) {
            positions.push({
              mint: mintAddress,
              data: {
                ...position,
                pool: whirlpool,
              },
            });
          }
        }
      } catch (error) {
        continue;
      }
    }

    return positions;
  } catch (error) {
    console.error("Error fetching user positions:", error);
    return [];
  }
}

export async function fetchPoolsWithDetails(
  connection: Connection,
  limit: number = 50
): Promise<PoolInfo[]> {
  try {
    const client = getWhirlpoolClient(connection);
    const whirlpools = await client.program.account.whirlpool.all();
    const tokens = await getTokenList();

    const poolsWithDetails = await Promise.all(
      whirlpools.slice(0, limit).map(async (pool) => {
        try {
          const poolData = pool.account;
          const tokenA = tokens.find(
            (t) => t.address === poolData.tokenMintA.toString()
          );
          const tokenB = tokens.find(
            (t) => t.address === poolData.tokenMintB.toString()
          );

          const price = PriceMath.sqrtPriceX64ToPrice(
            poolData.sqrtPrice,
            tokenA?.decimals || 6,
            tokenB?.decimals || 6
          );

          return {
            address: pool.publicKey,
            tokenA,
            tokenB,
            price,
            tvl: 0,
            feeRate: poolData.feeRate,
            tickSpacing: poolData.tickSpacing,
            liquidity: poolData.liquidity.toString(),
          };
        } catch (error) {
          return null;
        }
      })
    );

    return poolsWithDetails.filter((pool): pool is PoolInfo => pool !== null);
  } catch (error) {
    console.error("Error fetching pools with details:", error);
    return [];
  }
}

export async function fetchPoolDetails(
  connection: Connection,
  poolAddress: PublicKey
) {
  try {
    const client = getWhirlpoolClient(connection);
    const pool = await client.fetcher.getPool(poolAddress);
    
    if (!pool) {
      return null;
    }

    const tokens = await getTokenList();
    const tokenA = tokens.find(
      (t) => t.address === pool.tokenMintA.toString()
    );
    const tokenB = tokens.find(
      (t) => t.address === pool.tokenMintB.toString()
    );

    const price = PriceMath.sqrtPriceX64ToPrice(
      pool.sqrtPrice,
      tokenA?.decimals || 6,
      tokenB?.decimals || 6
    );

    return {
      ...pool,
      tokenA,
      tokenB,
      price,
    };
  } catch (error) {
    console.error("Error fetching pool details:", error);
    return null;
  }
} 