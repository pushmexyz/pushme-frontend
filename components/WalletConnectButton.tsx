'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface WalletConnectButtonProps {
  className?: string;
  showDetection?: boolean; // Only show detection status when true (for big button area)
}

export default function WalletConnectButton({ 
  className, 
  showDetection = false 
}: WalletConnectButtonProps = {}) {
  const { connectWalletAndSignIn, loading } = useAuth();
  const [phantomDetected, setPhantomDetected] = useState(false);

  // Check for Phantom on mount (for UI display only)
  useEffect(() => {
    const checkPhantom = () => {
      const detected = typeof window !== 'undefined' && window.solana?.isPhantom;
      setPhantomDetected(!!detected);
      if (detected) {
        console.log('[WALLET] Phantom detected');
      }
    };

    checkPhantom();
    
    // Check periodically in case Phantom is installed after page load
    const interval = setInterval(checkPhantom, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Simplified handler: just call connectWalletAndSignIn
  // All logic (selection, connection, error handling) is in AuthContext
  const handleConnect = () => {
    console.log('[WALLET] Connect button clicked - calling connectWalletAndSignIn()');
    connectWalletAndSignIn();
    // No error handling here - AuthContext handles everything gracefully
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleConnect}
        disabled={loading || !phantomDetected}
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
      
      {/* Phantom Detection Status - Only show when showDetection is true */}
      {showDetection && (
        <div className="flex items-center gap-1.5 text-xs font-dm-sans text-green-600">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Phantom Detected</span>
        </div>
      )}
    </div>
  );
}
