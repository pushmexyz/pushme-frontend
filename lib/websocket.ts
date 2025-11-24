/**
 * WebSocket utility for overlay real-time updates
 * Connects to backend WebSocket server for instant donation notifications
 */

const WS_URL = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:5001/overlay';

export interface DonationEvent {
  event: 'donation';
  payload: {
    amount: number;
    mediaUrl?: string;
    wallet: string;
    username?: string;
    timestamp: string;
    type: 'text' | 'image' | 'gif' | 'audio' | 'video';
    content?: string;
  };
}

export interface AuthEvent {
  type: 'auth';
  user: {
    username: string;
    wallet: string;
  };
}

type EventHandler = (event: DonationEvent) => void;
type AuthEventHandler = (event: AuthEvent) => void;

class OverlayWebSocket {
  private ws: WebSocket | null = null;
  private handlers: Set<EventHandler> = new Set();
  private authHandlers: Set<AuthEventHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[WS] Connected to overlay server');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle auth messages
          if (data.type === 'auth') {
            this.authHandlers.forEach((handler) => handler(data as AuthEvent));
            return;
          }
          
          // Handle donation events - support both 'donation' event and 'donation_event'
          // Backend sends: io.emit("donation_event", { username, amount, type, text, media_url, created_at })
          // So the message is: { type: 'donation_event', username, amount, type: 'text'|'image'|..., text, media_url, created_at }
          if (data.event === 'donation' || data.type === 'donation_event') {
            console.log('[WS] Received donation event:', data);
            
            // Extract donation type - if data.type is 'donation_event', the actual type is in the payload
            // Otherwise, use data.type or data.payload.type
            let donationType: 'text' | 'image' | 'gif' | 'audio' | 'video' = 'text';
            
            if (data.type === 'donation_event') {
              // Backend format: the actual donation type might be in a nested structure
              // Try to find it in common locations
              donationType = (data.donationType || 
                             (data.payload && typeof data.payload === 'object' && 'type' in data.payload ? data.payload.type : null) ||
                             'text') as 'text' | 'image' | 'gif' | 'audio' | 'video';
            } else if (data.event === 'donation') {
              donationType = (data.payload?.type || 'text') as 'text' | 'image' | 'gif' | 'audio' | 'video';
            }
            
            // Normalize to DonationEvent format
            const donationEvent: DonationEvent = {
              event: 'donation',
              payload: {
                amount: data.amount || data.payload?.amount || 0,
                mediaUrl: data.media_url || data.payload?.mediaUrl || data.payload?.media_url,
                wallet: data.wallet || data.payload?.wallet || '',
                username: data.username || data.payload?.username || undefined,
                timestamp: data.created_at || data.payload?.timestamp || data.payload?.created_at || new Date().toISOString(),
                type: donationType,
                content: data.text || data.payload?.text || data.payload?.content,
              },
            };
            
            console.log('[WS] Normalized donation event:', donationEvent);
            this.handlers.forEach((handler) => handler(donationEvent));
            return;
          }
        } catch (error) {
          console.error('[WS] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
        console.error('[WS] WebSocket error:', error);
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        this.ws = null;

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => {
            this.connect();
          }, this.reconnectDelay * this.reconnectAttempts);
        } else {
          console.warn('[WS] Max reconnection attempts reached');
        }
      };
    } catch (error) {
      this.isConnecting = false;
      console.error('[WS] Failed to create WebSocket:', error);
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
    this.authHandlers.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  onDonation(handler: EventHandler): () => void {
    this.handlers.add(handler);
    this.connect(); // Auto-connect when handler is added

    // Return unsubscribe function
    return () => {
      this.handlers.delete(handler);
      if (this.handlers.size === 0) {
        this.disconnect();
      }
    };
  }

  onAuth(handler: AuthEventHandler): () => void {
    this.authHandlers.add(handler);
    this.connect(); // Auto-connect when handler is added

    // Return unsubscribe function
    return () => {
      this.authHandlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const overlayWS = new OverlayWebSocket();

