'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface RedButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function RedButton({
  onClick,
  disabled = false,
  size = 'lg',
  className = '',
}: RedButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const sizeClasses = {
    sm: 'w-32 h-32 text-xl',
    md: 'w-48 h-48 text-2xl',
    lg: 'w-64 h-64 text-4xl',
    xl: 'w-80 h-80 text-5xl',
  };

  return (
    <motion.button
      className={`${sizeClasses[size]} ${className} rounded-full bg-[#FF2B2B] text-white font-bangers font-bold shadow-2xl relative overflow-hidden`}
      style={{
        boxShadow: '0 0 60px rgba(255, 43, 43, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
      }}
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={isPressed ? { scale: 0.9, y: 5 } : { scale: 1, y: 0 }}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full pointer-events-none" />
      
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
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

      {/* Button text */}
      <span className="relative z-10 drop-shadow-lg">PRESS ME</span>

      {/* Ripple effect on click */}
      {isPressed && (
        <motion.div
          className="absolute inset-0 rounded-full bg-white/30"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}

