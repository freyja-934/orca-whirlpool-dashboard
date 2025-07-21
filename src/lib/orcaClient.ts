import { Wallet } from "@coral-xyz/anchor";
import { ORCA_WHIRLPOOL_PROGRAM_ID, WhirlpoolContext } from "@orca-so/whirlpools-sdk";
import { Connection, PublicKey } from "@solana/web3.js";

let whirlpoolClient: WhirlpoolContext | null = null;

export function getWhirlpoolClient(
  connection: Connection,
  wallet?: Wallet
): WhirlpoolContext {
  if (!whirlpoolClient) {
    whirlpoolClient = WhirlpoolContext.from(
      connection,
      wallet || {} as Wallet,
      ORCA_WHIRLPOOL_PROGRAM_ID
    );
  }
  return whirlpoolClient;
}

export function getWhirlpoolClientWithWallet(
  connection: Connection,
  wallet: Wallet
): WhirlpoolContext {
  return WhirlpoolContext.from(
    connection,
    wallet,
    ORCA_WHIRLPOOL_PROGRAM_ID
  );
}

export async function fetchWhirlpoolsList(
  client: WhirlpoolContext,
  programId: PublicKey = ORCA_WHIRLPOOL_PROGRAM_ID
) {
  try {
    const whirlpools = await client.program.account.whirlpool.all();
    return whirlpools;
  } catch (error) {
    console.error("Error fetching whirlpools:", error);
    return [];
  }
}

export async function fetchWhirlpoolData(
  client: WhirlpoolContext,
  poolAddress: PublicKey
) {
  try {
    const pool = await client.fetcher.getPool(poolAddress);
    return pool;
  } catch (error) {
    console.error("Error fetching whirlpool data:", error);
    return null;
  }
}

export async function fetchPositionData(
  client: WhirlpoolContext,
  positionAddress: PublicKey
) {
  try {
    const position = await client.fetcher.getPosition(positionAddress);
    return position;
  } catch (error) {
    console.error("Error fetching position data:", error);
    return null;
  }
} 