'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import TextDonation from './TextDonation';
import ImageDonation from './ImageDonation';
import GifDonation from './GifDonation';
import AudioDonation from './AudioDonation';
import VideoDonation from './VideoDonation';
import Toast, { ToastType } from './Toast';

type DonationType = 'text' | 'gif' | 'image' | 'audio' | 'video';

interface DonationPanelProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onAuthRequired?: () => void;
}

export default function DonationPanel({ onSuccess, onError, onAuthRequired }: DonationPanelProps = {}) {
  const { isAuthenticated } = useAuth();
  const [selectedType, setSelectedType] = useState<DonationType>('text');
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const donationTypes: Array<{ type: DonationType; label: string; price: string }> = [
    { type: 'text', label: 'Text', price: '0.01 SOL' },
    { type: 'gif', label: 'GIF', price: '0.02 SOL' },
    { type: 'image', label: 'Image', price: '0.03 SOL' },
    { type: 'audio', label: 'Audio', price: '0.05 SOL' },
    { type: 'video', label: 'Video', price: '0.10 SOL' },
  ];

  const handleSuccess = () => {
    setToast({ message: 'Donation sent successfully!', type: 'success' });
    // Call parent callback if provided
    if (onSuccess) {
      onSuccess();
    }
    // Clear toast after 2 seconds
    setTimeout(() => setToast(null), 2000);
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
    // Call parent callback if provided
    if (onError) {
      onError(error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-3xl font-bangers text-black mb-6">Send Donation</h2>

      {/* Type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {donationTypes.map(({ type, label, price }) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg font-dm-sans font-semibold transition-colors ${
              selectedType === type
                ? 'bg-[#FF2B2B] text-white'
                : 'bg-gray-100 text-black hover:bg-gray-200'
            }`}
          >
            {label} ({price})
          </button>
        ))}
      </div>

      {/* Donation form - allow unauthenticated users to fill form */}
      <div className="border-t border-gray-200 pt-6">
        {!isAuthenticated && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-dm-sans text-yellow-800">
              You'll be asked to connect your wallet when you click "Send Donation"
            </p>
          </div>
        )}
        {selectedType === 'text' && (
          <TextDonation onSuccess={handleSuccess} onError={handleError} onAuthRequired={onAuthRequired} />
        )}
        {selectedType === 'gif' && (
          <GifDonation onSuccess={handleSuccess} onError={handleError} onAuthRequired={onAuthRequired} />
        )}
        {selectedType === 'image' && (
          <ImageDonation onSuccess={handleSuccess} onError={handleError} onAuthRequired={onAuthRequired} />
        )}
        {selectedType === 'audio' && (
          <AudioDonation onSuccess={handleSuccess} onError={handleError} onAuthRequired={onAuthRequired} />
        )}
        {selectedType === 'video' && (
          <VideoDonation onSuccess={handleSuccess} onError={handleError} onAuthRequired={onAuthRequired} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

