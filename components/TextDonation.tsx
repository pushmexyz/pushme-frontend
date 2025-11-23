'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { DONATION_PRICES } from '@/lib/donations';
import { sendDonation } from '@/lib/sendDonation';

interface TextDonationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onAuthRequired?: () => void;
}

export default function TextDonation({ onSuccess, onError, onAuthRequired }: TextDonationProps) {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      onError('Please enter a message');
      return;
    }
    if (!publicKey || !user) {
      // If onAuthRequired callback is provided, use it instead of showing error
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
      onError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      console.log('[TEXT DONATION] Starting text donation', {
        text: text.trim(),
        publicKey: publicKey.toBase58(),
        user: user.username,
        amount: DONATION_PRICES.text,
      });

      // Use backend flow: request transaction, sign with Phantom, send back to backend
      const result = await sendDonation({
        wallet: publicKey.toBase58(),
        type: 'text',
        amount: DONATION_PRICES.text,
        content: text.trim(),
      });

      console.log('[TEXT DONATION] Donation completed successfully:', result.signature);
      onSuccess();
      setText('');
    } catch (err: any) {
      console.error('[TEXT DONATION] Error:', err);
      if (err.message?.includes('cancelled') || err.message?.includes('rejected')) {
        onError('Transaction was cancelled. Please try again.');
      } else {
        onError(err.message || 'Failed to send donation. Please try again.');
      }
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

