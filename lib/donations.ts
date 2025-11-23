import { authFetch } from './api';
import { Donation } from '@/store/donationStore';

export interface DonateRequest {
  type: 'text' | 'gif' | 'image' | 'audio' | 'video';
  content: string;
  username: string;
  wallet: string;
  txHash: string;
  metadata?: Record<string, any>;
}

export interface DonateResponse {
  success: boolean;
  donation: {
    type: string;
    text: string | null;
    mediaUrl: string | null;
    username: string;
    price: number;
  };
}

export interface RecentDonationsResponse {
  donations: Donation[];
}

export const DONATION_PRICES = {
  text: 0.01,
  gif: 0.02,
  image: 0.03,
  audio: 0.05,
  video: 0.1,
};

export async function submitDonation(
  token: string,
  data: DonateRequest
): Promise<DonateResponse> {
  console.log('[DONATIONS] Submitting donation:', data.type, data.username);
  return authFetch<DonateResponse>('/donate', token, data);
}

export async function getRecentDonations(
  limit: number = 10
): Promise<RecentDonationsResponse> {
  console.log('[DONATIONS] Fetching recent donations from Supabase, limit:', limit);
  
  const { supabase } = await import('./supabaseClient');
  
  if (!supabase) {
    console.warn('[DONATIONS] Supabase not configured, returning empty donations');
    return { donations: [] };
  }

  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[DONATIONS] Error fetching donations:', error);
      return { donations: [] };
    }

    console.log('[DONATIONS] Fetched donations:', data?.length || 0);
    return { donations: data || [] };
  } catch (error) {
    console.error('[DONATIONS] Error fetching donations:', error);
    return { donations: [] };
  }
}

