/**
 * Overlay Store - Manages donation queue and animation state
 * Handles sequential playback of donations with queue management
 */

import { create } from 'zustand';

export interface OverlayDonation {
  id: string;
  username: string;
  amount: number;
  type: 'text' | 'gif' | 'image' | 'audio' | 'video';
  text?: string;
  media_url?: string;
  created_at: string;
}

interface OverlayState {
  // Queue management
  pendingDonations: OverlayDonation[];
  currentDonation: OverlayDonation | null;
  
  // Animation state machine: idle | animating_button | showing_content | clearing
  state: 'idle' | 'animating_button' | 'showing_content' | 'clearing';
  
  // Button animation state
  buttonPressed: boolean;
  explosionActive: boolean;
  
  // Actions
  enqueueDonation: (donation: OverlayDonation) => void;
  dequeueDonation: () => OverlayDonation | null;
  setCurrentDonation: (donation: OverlayDonation | null) => void;
  setState: (state: OverlayState['state']) => void;
  setButtonPressed: (pressed: boolean) => void;
  setExplosionActive: (active: boolean) => void;
  clearCurrent: () => void;
}

export const useOverlayStore = create<OverlayState>((set, get) => ({
  pendingDonations: [],
  currentDonation: null,
  state: 'idle',
  buttonPressed: false,
  explosionActive: false,

  enqueueDonation: (donation) => {
    console.log('[OVERLAY STORE] Enqueueing donation:', donation);
    const { pendingDonations, state } = get();
    
    // Add to queue
    const newQueue = [...pendingDonations, donation];
    set({ pendingDonations: newQueue });
    
    // If idle, start processing immediately
    if (state === 'idle') {
      setTimeout(() => {
        const { pendingDonations: currentQueue } = get();
        if (currentQueue.length > 0) {
          get().dequeueDonation();
        }
      }, 50);
    }
  },

  dequeueDonation: () => {
    const { pendingDonations } = get();
    if (pendingDonations.length === 0) {
      return null;
    }
    
    const [next, ...rest] = pendingDonations;
    set({ 
      pendingDonations: rest,
      currentDonation: next,
      state: 'animating_button',
    });
    
    console.log('[OVERLAY STORE] Dequeued donation:', next);
    return next;
  },

  setCurrentDonation: (donation) => {
    set({ currentDonation: donation });
  },

  setState: (state) => {
    console.log('[OVERLAY STORE] State change:', state);
    set({ state });
    
    // Auto-process next donation when clearing
    if (state === 'idle') {
      const { pendingDonations } = get();
      if (pendingDonations.length > 0) {
        setTimeout(() => {
          get().dequeueDonation();
        }, 100);
      }
    }
  },

  setButtonPressed: (pressed) => {
    set({ buttonPressed: pressed });
  },

  setExplosionActive: (active) => {
    set({ explosionActive: active });
  },

  clearCurrent: () => {
    set({ 
      currentDonation: null,
      buttonPressed: false,
      explosionActive: false,
      state: 'idle',
    });
  },
}));

