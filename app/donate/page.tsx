'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import DonationPanel from '@/components/DonationPanel';
import WalletConnectButton from '@/components/WalletConnectButton';
import UsernameModal from '@/components/UsernameModal';
import Navbar from '@/components/Navbar';

export default function DonatePage() {
  const { isAuthenticated, hasUsername } = useAuth();
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !hasUsername) {
      setShowUsernameModal(true);
    } else {
      setShowUsernameModal(false);
    }
  }, [isAuthenticated, hasUsername]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bangers text-black mb-4">
            Send a Donation
          </h1>
          <p className="text-lg font-dm-sans text-gray-600">
            Support the stream and get your message displayed live
          </p>
        </div>

        <DonationPanel />

        {!isAuthenticated && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 font-dm-sans mb-4">
              Connect your wallet to get started
            </p>
            <WalletConnectButton />
          </div>
        )}
      </main>

      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onComplete={() => setShowUsernameModal(false)}
      />
    </div>
  );
}

