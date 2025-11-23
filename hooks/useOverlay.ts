import { useEffect, useCallback, useRef } from 'react';
import { startPolling } from '@/lib/polling';
import { useOverlayStore } from '@/store/overlayStore';
import { Donation } from '@/store/donationStore';

export function useOverlay() {
  const {
    currentDonation,
    lastDonationId,
    isAnimating,
    setCurrentDonation,
    setLastDonationId,
    setIsAnimating,
  } = useOverlayStore();

  // Use ref to track last donation ID to avoid dependency issues
  const lastDonationIdRef = useRef<string | null>(lastDonationId);
  
  useEffect(() => {
    lastDonationIdRef.current = lastDonationId;
  }, [lastDonationId]);

  const handleNewDonation = useCallback(
    (donation: Donation) => {
      console.log('[OVERLAY] New donation received:', donation);
      
      // Only trigger if it's a new donation
      if (donation.id !== lastDonationIdRef.current) {
        lastDonationIdRef.current = donation.id;
        setLastDonationId(donation.id);
        setCurrentDonation(donation);
        setIsAnimating(true);
        
        // Auto-clear after 6 seconds
        setTimeout(() => {
          setIsAnimating(false);
          setTimeout(() => {
            setCurrentDonation(null);
          }, 1000); // Fade out time
        }, 6000);
      }
    },
    [setCurrentDonation, setLastDonationId, setIsAnimating]
  );

  useEffect(() => {
    // Only start polling when component mounts (on overlay page)
    console.log('[OVERLAY] Starting overlay polling');
    const stopPolling = startPolling(1000, handleNewDonation);
    
    return () => {
      console.log('[OVERLAY] Stopping overlay polling');
      stopPolling();
    };
    // Only depend on handleNewDonation, which is stable now
  }, [handleNewDonation]);

  return {
    currentDonation,
    isAnimating,
  };
}

