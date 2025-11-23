'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import DonationPanel from './DonationPanel';
import UsernameModal from './UsernameModal';
import Toast, { ToastType } from './Toast';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { isAuthenticated, hasUsername, connectWalletAndSignIn } = useAuth();
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [pendingDonation, setPendingDonation] = useState<boolean>(false);

  // Handle auth flow when donation is attempted
  const handleDonationAttempt = async () => {
    if (!isAuthenticated) {
      // Step 1: Connect wallet
      setPendingDonation(true);
      try {
        await connectWalletAndSignIn();
        // Auth will happen automatically via useAuth hook
        // We'll check for username next
      } catch (error) {
        console.error('[DONATION MODAL] Wallet connect failed:', error);
        setToast({ message: 'Failed to connect wallet', type: 'error' });
        setPendingDonation(false);
      }
      return;
    }

    if (!hasUsername) {
      // Step 2: Show username modal
      setPendingDonation(true);
      setShowUsernameModal(true);
      return;
    }

    // Step 3: If we get here, auth and username are set, donation can proceed
    // The donation component will handle the actual transaction
  };

  // Monitor auth state changes to continue donation flow
  useEffect(() => {
    if (pendingDonation && isAuthenticated && hasUsername) {
      // Auth and username are now set, donation can proceed
      // The donation components will handle the transaction automatically
      // when the user clicks send again (or we can trigger it programmatically)
      setPendingDonation(false);
      setShowUsernameModal(false);
    }
  }, [pendingDonation, isAuthenticated, hasUsername]);

  // Show username modal when authenticated but no username
  useEffect(() => {
    if (isOpen && isAuthenticated && !hasUsername && !pendingDonation) {
      // Only show automatically if modal just opened and user is authenticated
      // Don't show if we're in the middle of a donation flow
      setShowUsernameModal(true);
    } else if (isAuthenticated && hasUsername) {
      setShowUsernameModal(false);
    }
  }, [isOpen, isAuthenticated, hasUsername, pendingDonation]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSuccess = () => {
    setToast({ message: 'Donation sent successfully!', type: 'success' });
    setPendingDonation(false);
    // Close modal after a short delay to show success message
    setTimeout(() => {
      onClose();
      setToast(null);
    }, 2000);
  };

  const handleError = (error: string) => {
    setToast({ message: error, type: 'error' });
    setPendingDonation(false);
  };

  const handleUsernameSet = () => {
    // After username is set, if there was a pending donation, it can now proceed
    // The user will need to click send again, or we can auto-trigger
    setPendingDonation(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                  aria-label="Close modal"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>

                {/* Content */}
                <div className="p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-4xl md:text-5xl font-bangers text-black mb-2">
                      Send a Donation
                    </h2>
                    <p className="text-lg font-dm-sans text-gray-600">
                      Support the stream and get your message displayed live
                    </p>
                  </div>

                  {/* Always show donation panel - it will handle auth requirements */}
                  <DonationPanel
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onAuthRequired={handleDonationAttempt}
                  />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Username Modal */}
      <UsernameModal
        isOpen={showUsernameModal}
        onComplete={() => setShowUsernameModal(false)}
        onUsernameSet={handleUsernameSet}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
