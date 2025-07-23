import { PriceMath } from "@orca-so/whirlpools-sdk";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
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
}

let tokenList: TokenInfo[] | null = null;
const tokenCache: Map<string, TokenInfo> = new Map();

async function getTokenList(): Promise<TokenInfo[]> {
  if (!tokenList) {
    const provider = new TokenListProvider();
    const tokens = await provider.resolve();
    tokenList = tokens.filterByClusterSlug("mainnet-beta").getList();
  }
  return tokenList || [];
}

// Fetch token metadata directly from the blockchain
async function fetchTokenMetadata(
  connection: Connection,
  mintAddress: string
): Promise<TokenInfo> {
  // Check cache first
  if (tokenCache.has(mintAddress)) {
    return tokenCache.get(mintAddress)!;
  }

  try {
    const mintPubkey = new PublicKey(mintAddress);
    
    // First, get the mint info for decimals
    const mintInfo = await connection.getParsedAccountInfo(mintPubkey);
    let decimals = 6; // Default decimals
    
    if (mintInfo.value && "parsed" in mintInfo.value.data) {
      const parsedData = mintInfo.value.data.parsed;
      decimals = parsedData.info.decimals;
    }
    
    // Try to get Metaplex metadata
    // The metadata PDA is derived from the mint address
    const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    
    let symbol = mintAddress.slice(0, 8);
    let name = `Token ${mintAddress.slice(0, 8)}`;
    
    try {
      const metadataAccount = await connection.getAccountInfo(metadataPDA);
      if (metadataAccount) {
        // Parse metadata - this is a simplified version
        // In production, you'd use @metaplex-foundation/mpl-token-metadata
        const data = metadataAccount.data;
        
        // Skip the discriminator and other fields to get to the name
        // This is a rough parse - ideally use the Metaplex SDK
        let offset = 1 + 32 + 32; // discriminator + update auth + mint
        const nameLength = data.readUInt32LE(offset);
        offset += 4;
        const nameBytes = data.slice(offset, offset + nameLength);
        const tokenName = nameBytes.toString('utf8').replace(/\0/g, '').trim();
        
        offset += 32; // max name length
        const symbolLength = data.readUInt32LE(offset);
        offset += 4;
        const symbolBytes = data.slice(offset, offset + symbolLength);
        const tokenSymbol = symbolBytes.toString('utf8').replace(/\0/g, '').trim();
        
        if (tokenName) name = tokenName;
        if (tokenSymbol) symbol = tokenSymbol;
      }
    } catch (metadataError) {
      console.log(`Could not parse metadata for ${mintAddress}, using defaults`);
    }
    
    const tokenInfo: TokenInfo = {
      chainId: 101, // Solana mainnet
      address: mintAddress,
      symbol: symbol,
      name: name,
      decimals: decimals,
      logoURI: undefined,
      tags: [],
      extensions: {}
    };
    
    tokenCache.set(mintAddress, tokenInfo);
    return tokenInfo;
  } catch (error) {
    console.error(`Error fetching metadata for ${mintAddress}:`, error);
  }
  
  // Fallback token info
  const fallbackToken: TokenInfo = {
    chainId: 101,
    address: mintAddress,
    symbol: mintAddress.slice(0, 8),
    name: `Token ${mintAddress.slice(0, 8)}`,
    decimals: 6, // Default to 6 decimals
    logoURI: undefined,
    tags: [],
    extensions: {}
  };
  
  tokenCache.set(mintAddress, fallbackToken);
  return fallbackToken;
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
          
          // Debug logging
          const tokenMintAStr = poolData.tokenMintA.toString();
          const tokenMintBStr = poolData.tokenMintB.toString();
          
          let tokenA = tokens.find(
            (t) => t.address === tokenMintAStr
          );
          let tokenB = tokens.find(
            (t) => t.address === tokenMintBStr
          );
          
          // If tokens are not found in registry, fetch metadata from blockchain
          if (!tokenA) {
            tokenA = await fetchTokenMetadata(connection, tokenMintAStr);
          }
          if (!tokenB) {
            tokenB = await fetchTokenMetadata(connection, tokenMintBStr);
          }

          const price = PriceMath.sqrtPriceX64ToPrice(
            poolData.sqrtPrice,
            tokenA.decimals,
            tokenB.decimals
          );

          return {
            address: pool.publicKey,
            tokenA: tokenA,
            tokenB: tokenB,
            price,
            tvl: 0,
            feeRate: poolData.feeRate,
            tickSpacing: poolData.tickSpacing,
            liquidity: poolData.liquidity.toString(),
          };
        } catch (error) {
          console.error(`Error processing pool ${pool.publicKey.toString()}:`, error);
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
    const tokenMintAStr = pool.tokenMintA.toString();
    const tokenMintBStr = pool.tokenMintB.toString();
    
    let tokenA = tokens.find(
      (t) => t.address === tokenMintAStr
    );
    let tokenB = tokens.find(
      (t) => t.address === tokenMintBStr
    );
    
    // If tokens are not found in registry, fetch metadata from blockchain
    if (!tokenA) {
      tokenA = await fetchTokenMetadata(connection, tokenMintAStr);
    }
    if (!tokenB) {
      tokenB = await fetchTokenMetadata(connection, tokenMintBStr);
    }

    const price = PriceMath.sqrtPriceX64ToPrice(
      pool.sqrtPrice,
      tokenA.decimals,
      tokenB.decimals
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