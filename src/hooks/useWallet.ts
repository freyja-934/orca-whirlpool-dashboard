import { SendTransactionOptions } from "@solana/wallet-adapter-base";
import { useConnection, useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { Transaction, TransactionSignature } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";

export function useWallet() {
  const wallet = useSolanaWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!wallet.publicKey || !connection) {
      setBalance(null);
      return;
    }

    setIsLoading(true);
    try {
      const balance = await connection.getBalance(wallet.publicKey);
      setBalance(balance / 1e9);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setBalance(null);
    } finally {
      setIsLoading(false);
    }
  }, [wallet.publicKey, connection]);

  useEffect(() => {
    fetchBalance();

    if (wallet.publicKey) {
      const subscriptionId = connection.onAccountChange(
        wallet.publicKey,
        (accountInfo) => {
          setBalance(accountInfo.lamports / 1e9);
        }
      );

      return () => {
        connection.removeAccountChangeListener(subscriptionId);
      };
    }
  }, [wallet.publicKey, connection, fetchBalance]);

  const sendTransaction = useCallback(
    async (transaction: Transaction, options?: SendTransactionOptions): Promise<TransactionSignature> => {
      if (!wallet.sendTransaction) {
        throw new Error("Wallet does not support sending transactions");
      }
      return wallet.sendTransaction(transaction, connection, options);
    },
    [wallet, connection]
  );

  return {
    ...wallet,
    balance,
    isLoading,
    connection,
    sendTransaction,
    isConnected: wallet.connected,
    address: wallet.publicKey?.toBase58(),
  };
} 