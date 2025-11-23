'use client';

import { useEffect, useState } from 'react';
import { useOverlay } from '@/hooks/useOverlay';
import RedButton from './RedButton';
import DonationCard from './DonationCard';
import OverlayAnimations from './OverlayAnimations';
import { motion, AnimatePresence } from 'framer-motion';

export default function OverlayDisplay() {
  const { currentDonation, isAnimating } = useOverlay();
  const [showDonation, setShowDonation] = useState(false);
  const [buttonPressed, setButtonPressed] = useState(false);

  // Handle donation animation sequence
  useEffect(() => {
    if (currentDonation && isAnimating) {
      // Step 1: Press button down
      setButtonPressed(true);
      
      // Step 2: After button animation, show donation card
      setTimeout(() => {
        setShowDonation(true);
      }, 300);
    } else {
      // Reset when donation clears
      setButtonPressed(false);
      setShowDonation(false);
    }
  }, [currentDonation, isAnimating]);

  const handleButtonPress = () => {
    console.log('[OVERLAY] Button pressed');
    // Button press animation is handled by RedButton component
  };

  return (
    <div className="fixed inset-0 bg-white overflow-hidden">
      {/* Page-level animations (crack, flash, shockwave, shake) */}
      <OverlayAnimations isAnimating={isAnimating && showDonation} donationType={currentDonation?.type} />

      {/* Main button */}
      <div className="absolute inset-0 flex items-center justify-center z-30">
        <motion.div
          animate={
            buttonPressed
              ? { scale: 0.9, y: 10 }
              : { scale: 1, y: 0 }
          }
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <RedButton
            onClick={handleButtonPress}
            size="xl"
            disabled={false}
          />
        </motion.div>
      </div>

      {/* Donation card */}
      <AnimatePresence>
        {currentDonation && showDonation && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50"
          >
            <DonationCard donation={currentDonation} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

