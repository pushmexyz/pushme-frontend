'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface RedButtonProps {
  isPressed: boolean;
  explosionActive: boolean;
  onPressComplete: () => void;
  onExplosionComplete: () => void;
}

export default function RedButton({
  isPressed,
  explosionActive,
  onPressComplete,
  onExplosionComplete,
}: RedButtonProps) {
  // Idle pulse animation
  const pulseAnimation = {
    scale: [0.95, 1.05, 0.95],
    opacity: [0.9, 1, 0.9],
  };

  const pulseTransition = {
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  };

  // Press-in animation - scale to 0.85 as specified
  const pressAnimation = isPressed
    ? {
        scale: 0.85,
        y: 10,
      }
    : {
        scale: 1,
        y: 0,
      };

  const pressTransition = {
    duration: 0.4,
    ease: 'easeInOut',
  };

  // Trigger press complete callback
  useEffect(() => {
    if (isPressed) {
      const timer = setTimeout(() => {
        onPressComplete();
      }, 400); // After press animation completes (0.4s)
      return () => clearTimeout(timer);
    }
  }, [isPressed, onPressComplete]);

  return (
    <div className="relative">
      {/* Explosion effect - radial gradient expanding with neon red-tinted glow */}
      {explosionActive && (
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255, 43, 43, 0.9) 0%, rgba(255, 43, 43, 0.6) 30%, rgba(255, 43, 43, 0.3) 60%, transparent 100%)',
            transform: 'translate(-50%, -50%)',
            left: '50%',
            top: '50%',
            filter: 'blur(20px)',
            boxShadow: '0 0 100px rgba(255, 43, 43, 0.8), 0 0 200px rgba(255, 43, 43, 0.5)',
          }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          onAnimationComplete={onExplosionComplete}
        />
      )}

      {/* Main button */}
      <motion.button
        className="w-80 h-80 rounded-full bg-[#FF2B2B] text-white font-bangers font-bold shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 0 60px rgba(255, 43, 43, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
        }}
        animate={isPressed ? pressAnimation : pulseAnimation}
        transition={isPressed ? pressTransition : pulseTransition}
        disabled
      >
        {/* Glossy overlay */}
        <span className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full pointer-events-none" />
        
        {/* Glow effect - only when not pressed */}
        {!isPressed && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 40px rgba(255, 43, 43, 0.6)',
                '0 0 80px rgba(255, 43, 43, 0.8)',
                '0 0 40px rgba(255, 43, 43, 0.6)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Button text */}
        <span className="relative z-10 drop-shadow-lg text-5xl">PRESS ME</span>
      </motion.button>
    </div>
  );
}

