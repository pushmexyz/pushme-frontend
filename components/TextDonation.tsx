'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { DONATION_PRICES } from '@/lib/donations';
import { sendDonation } from '@/lib/sendDonation';
import { parseDonationError, getToastMessage } from '@/lib/errorHandling';

interface TextDonationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onAuthRequired?: () => void;
}

export default function TextDonation({ onSuccess, onError, onAuthRequired }: TextDonationProps) {
  const { user, wallet, isAuthenticated, connectWalletAndSignIn } = useAuth();
  const { publicKey } = useWallet();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      onError('Please enter a message');
      return;
    }
    
    // Check authentication first
    if (!isAuthenticated || !user) {
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
      onError('Please connect your wallet');
      return;
    }

    // Use session wallet if available, otherwise use connected wallet
    // If wallet not connected but user is authenticated, connect it
    let walletAddress = publicKey ? publicKey.toBase58() : wallet;
    
    // If wallet not connected but user is authenticated, try to connect
    if (!publicKey && wallet) {
      try {
        console.log('[TEXT DONATION] Wallet not connected, connecting...');
        await connectWalletAndSignIn();
        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Re-check publicKey after connection attempt
        // Note: We'll use the session wallet address if connection fails
        walletAddress = wallet; // Use session wallet as fallback
      } catch (err) {
        console.warn('[TEXT DONATION] Connection failed, using session wallet:', err);
        // Use session wallet address even if connection fails
        walletAddress = wallet;
      }
    }

    if (!walletAddress) {
      onError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      console.log('[TEXT DONATION] Starting text donation', {
        text: text.trim(),
        wallet: walletAddress,
        user: user.username,
        amount: DONATION_PRICES.text,
      });

      // Use backend flow: POST /donation/start → sign → POST /donation/confirm
      const result = await sendDonation({
        wallet: walletAddress,
        type: 'text',
        amount: DONATION_PRICES.text,
        message: text.trim(),
      });

      console.log('[TEXT DONATION] Donation completed successfully:', result.txSignature);
      onSuccess();
      setText('');
    } catch (err: any) {
      console.error('[TEXT DONATION] Error:', err);
      // Use error handling utility to parse and get user-friendly message
      const donationError = parseDonationError(err);
      const errorMessage = getToastMessage(donationError);
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-dm-sans font-semibold text-black mb-2">
          Your Message
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type your message here..."
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-dm-sans focus:outline-none focus:border-[#FF2B2B] text-black resize-none"
          rows={4}
          maxLength={500}
          disabled={loading}
          required
        />
        <p className="mt-1 text-sm text-gray-500 font-dm-sans">
          {text.length}/500 characters • Cost: {DONATION_PRICES.text} SOL
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="w-full px-6 py-3 bg-[#FF2B2B] text-white rounded-lg font-dm-sans font-bold hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : `Send ${DONATION_PRICES.text} SOL`}
      </button>
    </form>
  );
}

