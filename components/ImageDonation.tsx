'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { uploadMedia } from '@/lib/api';
import { DONATION_PRICES } from '@/lib/donations';
import { sendDonation } from '@/lib/sendDonation';
import MediaUploader from './MediaUploader';

interface ImageDonationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onAuthRequired?: () => void;
}

export default function ImageDonation({ onSuccess, onError, onAuthRequired }: ImageDonationProps) {
  const { user } = useAuth();
  const { publicKey } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Please select an image');
      return;
    }
    if (!publicKey || !user) {
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
      onError('Please connect wallet and select an image');
      return;
    }

    try {
      setLoading(true);
      console.log('[IMAGE DONATION] Starting image donation');

      // Upload media first
      const mediaData = await uploadMedia(file, 'image');
      console.log('[IMAGE DONATION] Media uploaded');

      // Use backend flow: request transaction, sign with Phantom, send back to backend
      const result = await sendDonation({
        wallet: publicKey.toBase58(),
        type: 'image',
        amount: DONATION_PRICES.image,
        content: mediaData,
      });

      console.log('[IMAGE DONATION] Donation completed successfully:', result.signature);
      onSuccess();
      setFile(null);
    } catch (err: any) {
      console.error('[IMAGE DONATION] Error:', err);
      if (err.message?.includes('cancelled') || err.message?.includes('rejected')) {
        onError('Transaction was cancelled. Please try again.');
      } else {
        onError(err.message || 'Failed to send donation');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-dm-sans font-semibold text-black mb-2">
          Upload Image
        </label>
        <MediaUploader
          type="image"
          onFileSelect={(f) => setFile(f)}
          onRemove={() => setFile(null)}
          maxSizeMB={10}
        />
        <p className="mt-2 text-sm text-gray-500 font-dm-sans">
          Cost: {DONATION_PRICES.image} SOL
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full px-6 py-3 bg-[#FF2B2B] text-white rounded-lg font-dm-sans font-bold hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Sending...' : `Send ${DONATION_PRICES.image} SOL`}
      </button>
    </form>
  );
}

