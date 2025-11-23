'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useEffect, useState } from 'react';

interface WalletConnectProps {
  onWalletChange: (wallet: string | null) => void;
}

export default function WalletConnect({ onWalletChange }: WalletConnectProps) {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      onWalletChange(publicKey.toBase58());
    } else {
      onWalletChange(null);
    }
  }, [connected, publicKey, onWalletChange]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <WalletMultiButton className="!rounded-full !bg-black !text-white hover:!bg-gray-800" />
    </div>
  );
}

