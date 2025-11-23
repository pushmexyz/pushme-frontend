'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OverlayAnimationsProps {
  isAnimating: boolean;
  donationType?: string;
}

export default function OverlayAnimations({
  isAnimating,
  donationType,
}: OverlayAnimationsProps) {
  const [effect, setEffect] = useState<string | null>(null);

  useEffect(() => {
    if (isAnimating) {
      const effects = ['crack', 'flash', 'shockwave', 'shake'];
      const randomEffect = effects[Math.floor(Math.random() * effects.length)];
      setEffect(randomEffect);

      // Clear effect after animation
      setTimeout(() => {
        setEffect(null);
      }, 2000);
    }
  }, [isAnimating]);

  return (
    <AnimatePresence>
      {effect === 'crack' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-40"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAwIDUwTDUwIDEwME0wIDUwTDUwIDBNNTAgMEw1MCAxMDAiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] opacity-20" />
        </motion.div>
      )}

      {effect === 'flash' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-white pointer-events-none z-40"
        />
      )}

      {effect === 'shockwave' && (
        <motion.div
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 10, opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-40"
        >
          <div className="w-32 h-32 rounded-full border-8 border-[#FF2B2B]" />
        </motion.div>
      )}

      {effect === 'shake' && (
        <motion.div
          animate={{
            x: [0, -10, 10, -10, 10, 0],
            y: [0, -10, 10, -10, 10, 0],
          }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 pointer-events-none z-40"
        />
      )}
    </AnimatePresence>
  );
}

