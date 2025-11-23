import { useCallback } from 'react';
import { useDonationStore } from '@/store/donationStore';
import { DONATION_PRICES } from '@/lib/donations';
import { useAuth } from './useAuth';
import { supabase } from '@/lib/supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

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

      if (!supabase) {
        throw new Error('Database not configured');
      }

      try {
        console.log('[DONATIONS] Submitting donation:', { type, username, txHash });
        
        const price = DONATION_PRICES[type];
        
        // Prepare donation data
        const donationData = {
          wallet,
          username,
          type,
          media_url: type !== 'text' ? content : null,
          text: type === 'text' ? content : null,
          price,
          tx_hash: txHash,
          metadata: metadata || {},
        };

        // Save to Supabase
        const { data, error } = await supabase
          .from('donations')
          .insert(donationData)
          .select()
          .single();

        if (error) {
          console.error('[DONATIONS] Supabase error:', error);
          throw new Error('Failed to save donation to database');
        }

        console.log('[DONATIONS] Saved to Supabase:', data);

        // Add to local store
        addDonation(data);

        // Notify backend for overlay update
        try {
          console.log('[DONATIONS] Notifying backend server...', {
            endpoint: `${API_BASE_URL}/donate`,
            donationType: type,
            username,
            wallet,
            txHash,
            price,
          });

          const backendResponse = await fetch(`${API_BASE_URL}/donate`, {
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
              metadata: {
                ...metadata,
                confirmed: true,
                timestamp: new Date().toISOString(),
              },
            }),
          });

          if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.warn('[DONATIONS] Backend notification failed:', {
              status: backendResponse.status,
              statusText: backendResponse.statusText,
              error: errorText,
            });
          } else {
            const responseData = await backendResponse.json();
            console.log('[DONATIONS] Backend notified successfully:', responseData);
          }
        } catch (backendError: any) {
          console.warn('[DONATIONS] Failed to notify backend:', {
            error: backendError.message,
            stack: backendError.stack,
          });
          // Don't throw - donation is already saved to Supabase
        }

        return {
          success: true,
          donation: data,
        };
      } catch (error) {
        console.error('[DONATIONS] Error submitting donation:', error);
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

