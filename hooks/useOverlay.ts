/**
 * Overlay WebSocket Hook
 * Direct WebSocket connection with event logging
 */

import { useEffect, useRef } from 'react';
import { donationQueue, OverlayDonationEvent } from '@/lib/donationQueue';
import { OverlayDonation } from '@/lib/overlayStore';

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:5001/overlay';

export function useOverlay(onDonationReady: (donation: OverlayDonation) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    // Set up playback callback
    donationQueue.onPlayback(onDonationReady);

    // Connect WebSocket
    const connect = () => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        console.log('[OVERLAY] Connecting to WebSocket:', WS_URL);
        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
          console.log('[OVERLAY] Connected');
          reconnectAttemptsRef.current = 0;
        };

        ws.onclose = () => {
          console.log('[OVERLAY] Closed');
          
          // Attempt to reconnect
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;
            const delay = Math.min(1000 * reconnectAttemptsRef.current, 5000);
            console.log(`[OVERLAY] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
            setTimeout(connect, delay);
          }
        };

        ws.onerror = (e) => {
          console.log('[OVERLAY] Error', e);
        };

        ws.onmessage = (msg) => {
          console.log('[OVERLAY] Incoming:', msg.data);
          try {
            const event = JSON.parse(msg.data);
            handleOverlayEvent(event);
          } catch (error) {
            console.error('[OVERLAY] Failed to parse message:', error);
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('[OVERLAY] Failed to create WebSocket:', error);
      }
    };

    const handleOverlayEvent = (event: any) => {
      // Handle donation events
      if (event.type === 'donation_event' || event.event === 'donation') {
        // Extract the actual donation type (not the event type)
        let donationType: 'text' | 'image' | 'gif' | 'audio' | 'video' = 'text';
        
        // Backend sends: { type: 'donation_event', username, amount, type: 'text'|'image'|..., ... }
        // If event.type is 'donation_event', check for donationType field or type in payload
        if (event.type === 'donation_event') {
          donationType = (event.donationType || 
                         (event.payload && typeof event.payload === 'object' && 'type' in event.payload ? event.payload.type : 'text')) as 'text' | 'image' | 'gif' | 'audio' | 'video';
        } else {
          donationType = (event.payload?.type || 'text') as 'text' | 'image' | 'gif' | 'audio' | 'video';
        }
        
        const donationEvent: OverlayDonationEvent = {
          type: 'donation_event',
          username: event.username || event.payload?.username || 'Anonymous',
          amount: event.amount || event.payload?.amount || 0,
          donationType: donationType,
          text: event.text || event.payload?.text || event.payload?.content,
          media_url: event.media_url || event.payload?.mediaUrl || event.payload?.media_url,
          created_at: event.created_at || event.payload?.timestamp || event.payload?.created_at || new Date().toISOString(),
        };
        
        console.log('[OVERLAY] Processing donation event:', donationEvent);
        donationQueue.push(donationEvent);
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      donationQueue.clear();
    };
  }, [onDonationReady]);
}
