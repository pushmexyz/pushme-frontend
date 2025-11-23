import { getRecentDonations } from './donations';
import { Donation } from '@/store/donationStore';
import { useOverlayStore } from '@/store/overlayStore';

export function startPolling(
  intervalMs: number = 1000,
  onNewDonation: (donation: Donation) => void
): () => void {
  console.log('[POLLING] Starting donation polling, interval:', intervalMs);
  let lastDonationId: string | null = null;
  let intervalId: NodeJS.Timeout;

  const poll = async () => {
    try {
      const { donations } = await getRecentDonations(1);
      
      if (donations && donations.length > 0) {
        const latest = donations[0];
        
        if (latest.id !== lastDonationId) {
          console.log('[POLLING] New donation detected:', latest.id);
          lastDonationId = latest.id;
          onNewDonation(latest);
        }
      }
    } catch (error) {
      console.error('[POLLING] Error polling donations:', error);
    }
  };

  // Initial poll
  poll();
  
  // Set up interval
  intervalId = setInterval(poll, intervalMs);

  // Return cleanup function
  return () => {
    console.log('[POLLING] Stopping donation polling');
    clearInterval(intervalId);
  };
}

