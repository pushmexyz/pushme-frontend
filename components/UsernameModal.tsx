'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X } from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onClose?: () => void; // Made optional since we don't allow closing
  onComplete: () => void;
  onUsernameSet?: () => void; // Callback after username is successfully set
}

export default function UsernameModal({
  isOpen,
  onClose,
  onComplete,
  onUsernameSet,
}: UsernameModalProps) {
  const { setUsername, user } = useAuth();
  const [username, setUsernameValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError('Username can only contain letters, numbers, and underscores');
      return;
    }

    try {
      setLoading(true);
      console.log('[USERNAME] Setting username:', username);
      await setUsername(username);
      // Username is set successfully - username will be available in useAuth
      // Call callback if provided (e.g., to continue with donation transaction)
      if (onUsernameSet) {
        onUsernameSet();
      }
      // Modal will close automatically via useEffect in page.tsx
      onComplete();
      onClose?.();
    } catch (err: any) {
      console.error('[USERNAME] Error setting username:', err);
      setError(err.message || 'Failed to set username');
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
            onClick={onClose || undefined}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bangers text-black">Choose Your Username</h2>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-black transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsernameValue(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-dm-sans focus:outline-none focus:border-[#FF2B2B] text-black"
                    disabled={loading}
                    autoFocus
                  />
                  {error && (
                    <p className="mt-2 text-sm text-red-500 font-dm-sans">{error}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600 font-dm-sans">
                    Choose a username to display with your donations. This is required to continue.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-[#FF2B2B] text-white rounded-lg font-dm-sans font-semibold hover:bg-[#FF4444] transition-colors disabled:opacity-50"
                      disabled={loading || !username.trim()}
                    >
                      {loading ? 'Setting...' : 'Set Username'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

