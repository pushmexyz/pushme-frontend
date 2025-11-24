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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';

export async function getRecentDonations(
  limit: number = 10
): Promise<RecentDonationsResponse> {
  try {
    const response = await fetch(`${BACKEND_URL}/donation/recent?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[DONATIONS] Failed to fetch recent donations');
      return { donations: [] };
    }

    const data = await response.json();
    return { donations: data.donations || [] };
  } catch (error) {
    console.error('[DONATIONS] Error fetching donations:', error);
    return { donations: [] };
  }
}
