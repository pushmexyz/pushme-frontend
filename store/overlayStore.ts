import { create } from 'zustand';
import { Donation } from './donationStore';

interface OverlayStore {
  currentDonation: Donation | null;
  lastDonationId: string | null;
  isAnimating: boolean;
  setCurrentDonation: (donation: Donation | null) => void;
  setLastDonationId: (id: string | null) => void;
  setIsAnimating: (isAnimating: boolean) => void;
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  currentDonation: null,
  lastDonationId: null,
  isAnimating: false,
  setCurrentDonation: (donation) => set({ currentDonation: donation }),
  setLastDonationId: (id) => set({ lastDonationId: id }),
  setIsAnimating: (isAnimating) => set({ isAnimating }),
}));

