'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/lib/hooks';

interface PressButtonProps {
  wallet: string | null;
  username: string | null | undefined;
  hasCompletedSetup: boolean;
  onPressNeedsAuth: () => void;
}

export default function PressButton({
  wallet,
  username,
  hasCompletedSetup,
  onPressNeedsAuth,
}: PressButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const { width, height } = useWindowSize();

  const handlePress = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!wallet) {
      onPressNeedsAuth();
      return;
    }

    if (!hasCompletedSetup) {
      onPressNeedsAuth();
      return;
    }

    // Create ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    setIsPressed(true);
    setIsLoading(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';
      const response = await fetch(`${BACKEND_URL}/events/press`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet,
          username,
          anonymous: username === null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record press');
      }

      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    } catch (error) {
      console.error('Error pressing button:', error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsPressed(false), 200);
    }
  };

  return (
    <>
      {showConfetti && width && height && typeof window !== 'undefined' && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />
      )}
      <div className="relative flex flex-col items-center justify-center">
        <motion.button
          onClick={handlePress}
          disabled={isLoading}
          className="relative flex h-64 w-64 md:h-80 md:w-80 items-center justify-center rounded-full bg-accent font-pressme text-4xl md:text-5xl font-normal tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 glow-pulse"
          style={{
            filter: 'drop-shadow(0 0 40px rgba(255, 34, 34, 0.45))',
          }}
          whileHover={{
            scale: 1.05,
            filter: 'drop-shadow(0 0 50px rgba(255, 34, 34, 0.65))',
          }}
          whileTap={{
            scale: 0.95,
            y: 4,
          }}
          animate={
            isPressed
              ? { y: 4 }
              : {
                  y: 0,
                  scale: [1, 1.02, 1],
                }
          }
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 20,
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          {isLoading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="inline-block h-8 w-8 border-4 border-white border-t-transparent rounded-full"
            />
          ) : (
            <span>PRESS ME</span>
          )}
          
          {/* Ripple effects */}
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full border-2 border-white pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: 0,
                height: 0,
              }}
              animate={{
                width: 300,
                height: 300,
                x: -150,
                y: -150,
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
              }}
            />
          ))}
          
          {/* Continuous pulse ring */}
          {!isPressed && (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
              animate={{
                scale: [1, 1.5, 2],
                opacity: [0.5, 0, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          )}
        </motion.button>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xl font-body font-medium text-neutral-600 dark:text-neutral-400 hover:text-accent transition-colors"
        >
          Go ahead, press the button.
        </motion.p>
      </div>
    </>
  );
}
