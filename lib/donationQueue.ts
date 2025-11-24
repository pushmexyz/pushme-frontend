/**
 * Donation Queue System
 * FIFO processing, only show each donation once
 */

import { OverlayDonation } from '@/lib/overlayStore';

export interface OverlayDonationEvent {
  type: 'donation_event';
  username: string;
  amount: number;
  donationType: 'text' | 'image' | 'gif' | 'audio' | 'video';
  text?: string;
  media_url?: string;
  created_at: string;
}

class DonationQueue {
  private queue: OverlayDonation[] = [];
  private processedIds: Set<string> = new Set();
  private isPlaying: boolean = false;
  private playbackCallback: ((donation: OverlayDonation) => void) | null = null;

  /**
   * Add donation to queue - only if not already processed
   */
  push(event: OverlayDonationEvent): void {
    const donation: OverlayDonation = {
      id: `donation-${event.created_at}-${Date.now()}-${Math.random()}`,
      username: event.username || 'Anonymous',
      amount: event.amount || 0,
      type: event.donationType || 'text',
      text: event.text,
      media_url: event.media_url,
      created_at: event.created_at || new Date().toISOString(),
    };

    // Only add if we haven't seen this donation before
    const uniqueKey = `${donation.username}-${donation.amount}-${donation.created_at}`;
    if (!this.processedIds.has(uniqueKey)) {
      this.processedIds.add(uniqueKey);
      this.queue.push(donation);
      console.log('[QUEUE] Added donation to queue:', donation);
      this.triggerPlayback();
    } else {
      console.log('[QUEUE] Skipping duplicate donation:', uniqueKey);
    }
  }

  /**
   * Set callback for when donation should play
   */
  onPlayback(callback: (donation: OverlayDonation) => void): void {
    this.playbackCallback = callback;
  }

  /**
   * Trigger playback of next donation if not currently playing
   */
  triggerPlayback(): void {
    if (this.isPlaying || this.queue.length === 0) {
      return;
    }

    const next = this.queue.shift();
    if (!next || !this.playbackCallback) {
      return;
    }

    this.isPlaying = true;
    console.log('[QUEUE] Playing donation:', next);
    this.playbackCallback(next);

    // Mark as done after 5 seconds + fade out
    setTimeout(() => {
      this.isPlaying = false;
      // Process next in queue
      this.triggerPlayback();
    }, 5500); // 5s display + 0.5s fade
  }

  /**
   * Clear queue and processed IDs
   */
  clear(): void {
    this.queue = [];
    this.processedIds.clear();
    this.isPlaying = false;
  }
}

// Singleton instance
export const donationQueue = new DonationQueue();

