'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RedButton from '@/components/RedButton';
import WalletConnectButton from '@/components/WalletConnectButton';
import UsernameModal from '@/components/UsernameModal';
import DonationModal from '@/components/DonationModal';
import Toast from '@/components/Toast';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [hasError, setHasError] = useState(false);
  
  // Use hooks unconditionally - useAuth now handles WalletProvider not being available
  const { isAuthenticated, hasUsername, user, wallet, connected, setUsername } = useAuth();
  
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Show username modal ONLY when authenticated and username is missing
  useEffect(() => {
    if (isAuthenticated && !hasUsername) {
      setShowUsernameModal(true);
    } else {
      setShowUsernameModal(false);
    }
  }, [isAuthenticated, hasUsername]);

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('[HOME] Global error:', event.error);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error state if something went wrong
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center px-4">
          <h2 className="text-2xl font-bold text-black mb-4">Something went wrong</h2>
          <button
            onClick={() => {
              setHasError(false);
              window.location.reload();
            }}
            className="px-6 py-2 bg-[#FF2B2B] text-white rounded-full font-dm-sans font-semibold hover:bg-[#FF4444] transition-colors mt-4"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Render immediately - don't wait for mount to show content
  // The page will hydrate properly with React

  const handleButtonPress = () => {
    // Check if wallet is connected first
    if (!connected || !wallet) {
      setToast({
        message: 'Please connect your wallet to send donations',
        type: 'info',
      });
      return;
    }
    
    // If wallet connected but not authenticated, show message
    if (!isAuthenticated) {
      setToast({
        message: 'Please sign in to continue',
        type: 'info',
      });
      return;
    }
    
    // If authenticated, open donation modal
    setShowDonationModal(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl md:text-8xl font-bangers text-black mb-6">
            PRESS THE BUTTON
          </h1>
          <p className="text-xl md:text-2xl font-dm-sans text-gray-700 mb-8">
            Make the internet react.
          </p>
        </motion.div>

        {/* Giant Red Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <RedButton size="xl" onClick={handleButtonPress} />
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          {!isAuthenticated ? (
            <WalletConnectButton />
          ) : (
            <button
              onClick={() => setShowDonationModal(true)}
              className="inline-block px-8 py-4 bg-[#FF2B2B] text-white rounded-full font-dm-sans font-bold text-lg hover:bg-[#FF4444] transition-colors shadow-lg"
            >
              Send Donation
            </button>
          )}
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bangers text-black text-center mb-12">
            How PressMe Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Connect Wallet',
                desc: 'Connect your Phantom wallet to get started',
              },
              {
                step: '2',
                title: 'Choose Username',
                desc: 'Set your username or stay anonymous',
              },
              {
                step: '3',
                title: 'Press & Donate',
                desc: 'Send text, images, GIFs, audio, or video',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg"
              >
                <div className="text-4xl font-bangers text-[#FF2B2B] mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-dm-sans font-bold text-black mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 font-dm-sans">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You Can Send */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bangers text-black text-center mb-12">
            What You Can Send
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { type: 'Text', price: '0.01 SOL', desc: 'Send a message' },
              { type: 'GIF', price: '0.02 SOL', desc: 'Animated GIFs' },
              { type: 'Image', price: '0.03 SOL', desc: 'Photos & images' },
              { type: 'Audio', price: '0.05 SOL', desc: 'Sound clips' },
              { type: 'Video', price: '0.10 SOL', desc: 'Video clips' },
            ].map((item, index) => (
              <motion.div
                key={item.type}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center hover:border-[#FF2B2B] transition-colors"
              >
                <h3 className="text-2xl font-bangers text-[#FF2B2B] mb-2">
                  {item.type}
                </h3>
                <p className="text-lg font-dm-sans font-bold text-black mb-1">
                  {item.price}
                </p>
                <p className="text-sm text-gray-600 font-dm-sans">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-[#FF2B2B]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bangers text-white mb-6">
            Join the 24/7 Livestream
          </h2>
          <p className="text-xl font-dm-sans text-white/90 mb-8">
            Press the button. Make the stream react. Win real rewards.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://pump.fun/coin/8Dvn4hkhKG8Vn2NUEsFmofXJYrVrAkNTLwZyvMJNpump"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-[#FF2B2B] rounded-full font-dm-sans font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Watch Livestream
            </a>
            <button
              onClick={() => setShowDonationModal(true)}
              className="px-8 py-4 bg-black text-white rounded-full font-dm-sans font-bold text-lg hover:bg-gray-800 transition-colors"
            >
              Send Donation
            </button>
          </div>
        </div>
      </section>

      <Footer />

      <UsernameModal
        isOpen={showUsernameModal}
        onComplete={() => {
          // Modal will close automatically when hasUsername becomes true
          setShowUsernameModal(false);
        }}
      />

      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
      />

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

