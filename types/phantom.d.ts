// Type declarations for Phantom Wallet
interface PhantomProvider {
  isPhantom?: boolean;
  isConnected: boolean;
  publicKey?: {
    toBase58(): string;
  };
  connect(): Promise<{ publicKey: { toBase58(): string } }>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAllTransactions(transactions: any[]): Promise<any[]>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
}

interface Window {
  solana?: PhantomProvider;
  phantom?: {
    solana?: PhantomProvider;
  };
}

