'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { parseDonationError, getToastMessage } from '@/lib/errorHandling';
import Toast, { ToastType } from './Toast';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddSongModal({ isOpen, onClose }: AddSongModalProps) {
  const { isAuthenticated, wallet } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !wallet) {
      setToast({ message: 'Please connect your wallet first', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    if (!youtubeUrl.trim()) {
      setToast({ message: 'Please enter a YouTube URL', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      setToast({ message: 'Please enter a valid YouTube URL', type: 'error' });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      setLoading(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';
      
      const response = await fetch(`${API_BASE_URL}/music/queue/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet,
          youtubeUrl: youtubeUrl.trim(),
        }),
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          const errorText = await response.text();
          errorData = { error: errorText };
        }
        throw errorData;
      }

      const result = await response.json();

      if (result.success) {
        setToast({ message: 'Song added to queue successfully!', type: 'success' });
        setYoutubeUrl('');
        setTimeout(() => {
          setToast(null);
          onClose();
        }, 2000);
      } else {
        throw result;
      }
    } catch (err: any) {
      console.error('[ADD SONG] Error:', err);
      const donationError = parseDonationError(err);
      const errorMessage = getToastMessage(donationError);
      setToast({ message: errorMessage, type: 'error' });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <h2 className="text-2xl font-bangers text-[#FF2B2B] mb-4">Add Song to Queue</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-dm-sans font-semibold text-black mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-dm-sans focus:outline-none focus:border-[#FF2B2B] text-black"
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !youtubeUrl.trim() || !isAuthenticated}
                  className="w-full px-6 py-3 bg-[#FF2B2B] text-white rounded-lg font-dm-sans font-bold hover:bg-[#FF4444] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Song'}
                </button>
              </form>

              {toast && (
                <Toast
                  message={toast.message}
                  type={toast.type}
                  isVisible={true}
                  onClose={() => setToast(null)}
                />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

