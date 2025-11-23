'use client';

import { motion } from 'framer-motion';
import PressButton from './PressButton';

interface HeroProps {
  wallet: string | null;
  username: string | null | undefined;
  hasCompletedSetup: boolean;
  onPressNeedsAuth: () => void;
}

export default function Hero({ wallet, username, hasCompletedSetup, onPressNeedsAuth }: HeroProps) {
  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-neutral-50 via-transparent to-transparent dark:from-neutral-900/50 pointer-events-none" />
      
      {/* Floating shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-accent/10 rounded-full blur-3xl"
        animate={{
          y: [0, -20, 0],
          x: [0, 10, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
        animate={{
          y: [0, 20, 0],
          x: [0, -10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-heading font-black tracking-tight text-center mb-6 text-neutral-900 dark:text-neutral-50"
        >
          THE INTERNET'S
          <br />
          <span className="text-accent">BUTTON</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl font-body opacity-80 text-center mb-12 text-neutral-700 dark:text-neutral-300 max-w-2xl"
        >
          Press the button. Trigger the livestream. Win real $SOL.
        </motion.p>
        
        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <motion.a
            href="https://pump.fun/coin/8Dvn4hkhKG8Vn2NUEsFmofXJYrVrAkNTLwZyvMJNpump"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full bg-accent text-white font-body font-semibold text-lg shadow-glow hover:shadow-lg transition-all"
          >
            Watch Livestream
          </motion.a>
          <motion.a
            href="https://x.com/pushmexyz"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 rounded-full border-2 border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-body font-semibold text-lg hover:border-accent transition-all"
          >
            Follow X
          </motion.a>
        </motion.div>
        
        {/* Press Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <PressButton
            wallet={wallet}
            username={username}
            hasCompletedSetup={hasCompletedSetup}
            onPressNeedsAuth={onPressNeedsAuth}
          />
        </motion.div>
      </div>
    </section>
  );
}

