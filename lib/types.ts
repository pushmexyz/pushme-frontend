export interface User {
  id: string;
  wallet: string;
  username: string | null;
  created_at: string;
}

export interface Event {
  id: string;
  wallet: string;
  username: string | null;
  type: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface PressEventData {
  wallet: string;
  username: string | null;
  anonymous?: boolean;
}

