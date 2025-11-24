'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@solana/wallet-adapter-react';
import { uploadMedia } from '@/lib/api';
import { DONATION_PRICES } from '@/lib/donations';
import { sendDonation } from '@/lib/sendDonation';
import { parseDonationError, getToastMessage } from '@/lib/errorHandling';
import MediaUploader from './MediaUploader';

interface ImageDonationProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  onAuthRequired?: () => void;
}

export default function ImageDonation({ onSuccess, onError, onAuthRequired }: ImageDonationProps) {
  const { user, wallet, isAuthenticated } = useAuth();
  const { publicKey } = useWallet();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onError('Please select an image');
      return;
    }
    
    // Check authentication first
    if (!isAuthenticated || !user) {
      if (onAuthRequired) {
        onAuthRequired();
        return;
      }
      onError('Please connect wallet and select an image');
      return;
    }

    // Use session wallet if available, otherwise use connected wallet
    const walletAddress = publicKey ? publicKey.toBase58() : wallet;
    if (!walletAddress) {
      onError('Please connect your wallet');
      return;
    }

    try {
      setLoading(true);
      console.log('[IMAGE DONATION] Starting image donation');

      // Upload media first
      const mediaData = await uploadMedia(file, 'image');
      console.log('[IMAGE DONATION] Media uploaded');

      // Use backend flow: POST /donation/start → sign → POST /donation/confirm
      const result = await sendDonation({
        wallet: walletAddress,
        type: 'image',
        amount: DONATION_PRICES.image,
        mediaUrl: mediaData,
      });

      console.log('[IMAGE DONATION] Donation completed successfully:', result.txSignature);
      onSuccess();
      setFile(null);
    } catch (err: any) {
      console.error('[IMAGE DONATION] Error:', err);
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

