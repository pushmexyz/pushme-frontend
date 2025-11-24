import { useCallback } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { DONATION_PRICES } from '@/lib/donations';
import { useAuth } from './useAuth';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';

export function useDonations() {
  const { user, wallet } = useAuth();
  const { addDonation } = useDonationStore();

  const submitDonationWithTx = useCallback(
    async (
      type: 'text' | 'gif' | 'image' | 'audio' | 'video',
      content: string,
      username: string,
      txHash: string,
      metadata?: Record<string, any>
    ) => {
      if (!user || !wallet) {
        throw new Error('Not authenticated');
      }

      try {
        const price = DONATION_PRICES[type];
        
        // Send donation confirmation to backend
        // Backend will save to Supabase and broadcast to overlay
        const response = await fetch(`${BACKEND_URL}/donation/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            content,
            username,
            wallet,
            txHash,
            price,
            metadata: metadata || {},
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to confirm donation');
        }

        const result = await response.json();
        
        // Add to local store if donation data returned
        if (result.donation) {
          addDonation(result.donation);
        }

        console.log('[DONATIONS] Donation confirmed');
        return {
          success: true,
          donation: result.donation,
        };
      } catch (error: any) {
        console.error('[DONATIONS] Error submitting donation:', error.message);
        throw error;
      }
    },
    [user, wallet, addDonation]
  );

  return {
    submitDonationWithTx,
    prices: DONATION_PRICES,
  };
}
