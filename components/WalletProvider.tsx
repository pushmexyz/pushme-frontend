'use client';

import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Use a reliable public RPC endpoint
  // For production, consider using Helius, QuickNode, or other RPC providers
  // Free alternatives: https://rpc.ankr.com/solana or https://solana-api.projectserum.com
  const endpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  // Removed WalletModalProvider - we handle wallet connection directly
  // Disable autoConnect to prevent automatic connection attempts that can cause errors
  // User must explicitly click "Connect Wallet" button
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

