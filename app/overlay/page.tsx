'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useOverlayStore, OverlayDonation } from '@/lib/overlayStore';
import { useOverlay } from '@/hooks/useOverlay';
import DonationQueueManager from '@/components/overlay/DonationQueueManager';
import MusicPlayer from '@/components/overlay/MusicPlayer';

export default function OverlayPage() {
  const { enqueueDonation } = useOverlayStore();
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const boomSoundRef = useRef<HTMLAudioElement | null>(null);

  // Load sound effects
  useEffect(() => {
    popSoundRef.current = new Audio('/sounds/pop.wav');
    boomSoundRef.current = new Audio('/sounds/boom.wav');
    popSoundRef.current.volume = 0.5;
    boomSoundRef.current.volume = 0.7;
  }, []);

  // Handle donation ready from queue
  const handleDonationReady = useCallback((donation: OverlayDonation) => {
    console.log('[OVERLAY PAGE] Donation ready to display:', donation);
    
    // Play pop sound when donation appears
    if (popSoundRef.current) {
      popSoundRef.current.currentTime = 0;
      popSoundRef.current.play().catch(console.error);
    }

    // Enqueue to store (triggers animations)
    enqueueDonation(donation);
  }, [enqueueDonation]);

  // Set up WebSocket listener using new hook
  useOverlay(handleDonationReady);

  // Listen for explosion animation to play boom sound
  const { explosionActive } = useOverlayStore();
  useEffect(() => {
    if (explosionActive && boomSoundRef.current) {
      boomSoundRef.current.currentTime = 0;
      boomSoundRef.current.play().catch(console.error);
    }
  }, [explosionActive]);

  return (
    <div className="fixed inset-0 bg-white overflow-hidden pointer-events-none">
      {/* Main overlay content */}
      <DonationQueueManager />

      {/* Music Player Widget */}
      <MusicPlayer />
    </div>
  );
}
