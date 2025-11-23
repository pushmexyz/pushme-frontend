'use client';

import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface WalletConnectButtonProps {
  className?: string;
}

export default function WalletConnectButton({ className }: WalletConnectButtonProps = {}) {
  const { connectWalletAndSignIn, loading } = useAuth();

  const handleConnect = useCallback(async () => {
    try {
      await connectWalletAndSignIn();
    } catch (error: any) {
      console.error('[WALLET] Connection error:', error);
    }
  }, [connectWalletAndSignIn]);

  return (
    <button
      onClick={handleConnect}
      disabled={loading}
      className={`px-6 py-2 bg-black text-white rounded-full font-dm-sans font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className || ''}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Connecting...
        </>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
}
