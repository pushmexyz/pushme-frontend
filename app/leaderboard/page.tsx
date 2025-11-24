'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import Navbar from '@/components/NavBar';
import Leaderboard from '@/components/Leaderboard';
import { motion } from 'framer-motion';

export default function LeaderboardPage() {
  const { publicKey, connected } = useWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (connected && publicKey) {
      setWalletAddress(publicKey.toBase58());
    } else {
      setWalletAddress(null);
    }
  }, [connected, publicKey, mounted]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Navbar />
      <main className="flex flex-col items-center justify-center pt-20 pb-40">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl px-4"
        >
          <h1 className="mb-4 text-center text-5xl md:text-6xl font-merry font-semibold text-black dark:text-white">
            Leaderboard
          </h1>
          <p className="mb-12 text-center text-xl font-unbounded text-gray-600 dark:text-gray-400">
            Top performers earning <span className="text-red-accent font-bold">$SOL</span> rewards
          </p>
          <Leaderboard />
        </motion.div>
      </main>
    </div>
  );
}

