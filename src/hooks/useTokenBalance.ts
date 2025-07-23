import { queryKeys } from "@/lib/query-client";
import { getAccount, getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "./useWallet";

export function useTokenBalance(tokenMint: string | undefined) {
  const { publicKey, connection } = useWallet();

  return useQuery({
    queryKey: [...queryKeys.wallet.balance(publicKey?.toString() || ""), tokenMint],
    queryFn: async () => {
      if (!publicKey || !connection || !tokenMint) {
        return 0;
      }

      try {
        const mint = new PublicKey(tokenMint);
        
        // SOL has a special mint address
        const SOL_MINT = "So11111111111111111111111111111111111111112";
        
        if (mint.toString() === SOL_MINT) {
          // For SOL, get the native balance
          const balance = await connection.getBalance(publicKey);
          return balance / 1e9; // Convert lamports to SOL
        } else {
          // For other tokens, get the associated token account balance
          const associatedTokenAddress = await getAssociatedTokenAddress(
            mint,
            publicKey
          );
          
          try {
            const tokenAccount = await getAccount(connection, associatedTokenAddress);
            const decimals = 6; // Default to 6, should be fetched from mint
            return Number(tokenAccount.amount) / Math.pow(10, decimals);
          } catch (error) {
            // Token account doesn't exist, balance is 0
            return 0;
          }
        }
      } catch (error) {
        console.error("Error fetching token balance:", error);
        return 0;
      }
    },
    enabled: !!publicKey && !!connection && !!tokenMint,
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000,
  });
} 