import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Donation {
  id: string;
  wallet: string;
  username: string | null;
  type: 'text' | 'gif' | 'image' | 'audio' | 'video';
  media_url: string | null;
  text: string | null;
  price: number;
  tx_hash: string;
  created_at: string;
}

interface DonationStore {
  donations: Donation[];
  addDonation: (donation: Donation) => void;
  setDonations: (donations: Donation[]) => void;
  clearDonations: () => void;
}

export const useDonationStore = create<DonationStore>()(
  persist(
    (set) => ({
      donations: [],
      addDonation: (donation) =>
        set((state) => ({
          donations: [donation, ...state.donations].slice(0, 100), // Keep last 100
        })),
      setDonations: (donations) => set({ donations }),
      clearDonations: () => set({ donations: [] }),
    }),
    {
      name: 'pressme-donation-storage',
    }
  )
);

