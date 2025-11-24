'use client';

import { useEffect } from 'react';
import { useOverlayStore } from '@/lib/overlayStore';
import RedButton from './RedButton';
import DonationDisplay from './DonationDisplay';
import { AnimatePresence } from 'framer-motion';

export default function DonationQueueManager() {
  const {
    currentDonation,
    state,
    buttonPressed,
    explosionActive,
    setState,
    setButtonPressed,
    setExplosionActive,
    clearCurrent,
  } = useOverlayStore();

  // Handle state machine transitions
  useEffect(() => {
    if (state === 'animating_button' && currentDonation) {
      // Start button press animation
      setButtonPressed(true);
    } else if (state === 'idle') {
      // Reset button state when idle
      setButtonPressed(false);
      setExplosionActive(false);
    }
  }, [state, currentDonation, setButtonPressed, setExplosionActive]);

  const handlePressComplete = () => {
    // Button press done, trigger explosion
    setExplosionActive(true);
  };

  const handleExplosionComplete = () => {
    // Explosion done, show content
    setState('showing_content');
    setButtonPressed(false);
    setExplosionActive(false);
  };

  const handleContentComplete = () => {
    // Content display done, clear and move to next
    setState('clearing');
    setTimeout(() => {
      clearCurrent();
      setState('idle');
    }, 500); // Fade out time
  };

  return (
    <>
      {/* Red Button - always visible */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <RedButton
          isPressed={buttonPressed}
          explosionActive={explosionActive}
          onPressComplete={handlePressComplete}
          onExplosionComplete={handleExplosionComplete}
        />
      </div>

      {/* Donation Display - shown when state is showing_content */}
      <AnimatePresence>
        {currentDonation && state === 'showing_content' && (
          <DonationDisplay
            donation={currentDonation}
            onComplete={handleContentComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

