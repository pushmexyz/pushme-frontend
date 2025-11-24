/**
 * Backend-based donation flow using new endpoints:
 * POST /donation/start → get unsigned transaction
 * POST /donation/confirm → send signed transaction
 */

import { Transaction } from '@solana/web3.js';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_REST_URL || 'http://localhost:5001';

export interface SendDonationParams {
  wallet: string;
  type: 'text' | 'gif' | 'image' | 'audio' | 'video';
  amount: number;
  message?: string;
  mediaUrl?: string | null;
}

export interface SendDonationResponse {
  success: boolean;
  txSignature: string;
}

export interface DonationError {
  code: 'INSUFFICIENT_FUNDS' | 'TRANSACTION_FAILED' | 'WALLET_NOT_CONNECTED' | 'USER_REJECTED' | 'UNKNOWN';
  message: string;
}

function getPhantomProvider() {
  if (typeof window === 'undefined') return null;
  
  const provider = (window as any).phantom?.solana;
  if (!provider || !provider.isPhantom) {
    return null;
  }
  
  return provider;
}

/**
 * Sends a donation using the new backend flow:
 * 1. POST /donation/start → get unsigned transaction
 * 2. Sign with Phantom
 * 3. POST /donation/confirm → send signed transaction
 * 4. Backend handles broadcast, confirmation, database, and overlay
 */
export async function sendDonation(
  params: SendDonationParams
): Promise<SendDonationResponse> {
  const { wallet, type, amount, message, mediaUrl } = params;

  // Step 1: Request unsigned transaction from backend
  console.log('[DONATION] Starting donation flow:', { wallet, type, amount, message, mediaUrl });
  
  const startResponse = await fetch(`${API_BASE_URL}/donation/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet,
      amount,
      message: message || null,
      mediaUrl: mediaUrl || null,
    }),
  });

  if (!startResponse.ok) {
    let errorCode: DonationError['code'] = 'UNKNOWN';
    let errorMessage = 'Failed to start donation';
    
    try {
      const errorData = await startResponse.json();
      if (errorData.error) {
        errorMessage = errorData.error;
        if (errorData.error.includes('INSUFFICIENT_FUNDS') || errorData.error.includes('insufficient')) {
          errorCode = 'INSUFFICIENT_FUNDS';
        } else if (errorData.error.includes('TRANSACTION_FAILED') || errorData.error.includes('transaction failed')) {
          errorCode = 'TRANSACTION_FAILED';
        }
      }
    } catch {
      const errorText = await startResponse.text();
      errorMessage = errorText || errorMessage;
    }
    
    const error: DonationError = {
      code: errorCode,
      message: errorMessage,
    };
    console.error('[DONATION] Failed to start donation:', error);
    throw error;
  }

  const startData = await startResponse.json();

  if (!startData.success || !startData.unsignedTx) {
    // Check for error in response
    if (startData.error) {
      let errorCode: DonationError['code'] = 'UNKNOWN';
      if (startData.error.includes('INSUFFICIENT_FUNDS') || startData.error.includes('insufficient')) {
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (startData.error.includes('TRANSACTION_FAILED')) {
        errorCode = 'TRANSACTION_FAILED';
      }
      
      const error: DonationError = {
        code: errorCode,
        message: startData.error,
      };
      throw error;
    }
    throw new Error('Backend did not return unsigned transaction');
  }

  console.log('[DONATION] Received unsigned transaction from backend');

  // Step 2: Deserialize unsigned transaction
  const transactionBuffer = Buffer.from(startData.unsignedTx, 'base64');
  const transaction = Transaction.from(transactionBuffer);

  // Step 3: Get Phantom provider and ensure connected
  const provider = getPhantomProvider();
  if (!provider) {
    throw new Error('Phantom wallet not found. Please install Phantom extension.');
  }

  // Connect Phantom if not connected (but wallet address matches)
  if (!provider.isConnected) {
    try {
      console.log('[DONATION] Phantom not connected, connecting...');
      const response = await provider.connect();
      console.log('[DONATION] Phantom connected:', response.publicKey.toBase58());
      
      // Verify the connected wallet matches the expected wallet
      if (response.publicKey.toBase58() !== wallet) {
        throw new Error('Connected wallet does not match authenticated wallet');
      }
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        throw new Error('Wallet connection was rejected');
      }
      throw new Error(`Failed to connect wallet: ${error.message || 'Unknown error'}`);
    }
  } else {
    // Verify connected wallet matches
    const connectedPubkey = provider.publicKey?.toBase58();
    if (connectedPubkey && connectedPubkey !== wallet) {
      throw new Error('Connected wallet does not match authenticated wallet');
    }
  }

  // Step 4: Sign transaction with Phantom
  console.log('[DONATION] Requesting signature from Phantom...');
  let signedTransaction: Transaction;
  
  try {
    signedTransaction = await provider.signTransaction(transaction);
    console.log('[DONATION] Transaction signed successfully');
  } catch (error: any) {
    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('rejected')) {
      throw new Error('Transaction was cancelled by user');
    }
    throw error;
  }

  // Step 5: Serialize signed transaction
  const signedBuffer = signedTransaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  const signedBase64 = Buffer.from(signedBuffer).toString('base64');

  // Step 6: Send signed transaction to backend for confirmation
  console.log('[DONATION] Sending signed transaction to backend...');
  
  const confirmResponse = await fetch(`${API_BASE_URL}/donation/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet,
      signedTx: signedBase64,
      amount,
      message: message || null,
      mediaUrl: mediaUrl || null,
    }),
  });

  if (!confirmResponse.ok) {
    let errorCode: DonationError['code'] = 'UNKNOWN';
    let errorMessage = 'Failed to confirm donation';
    
    try {
      const errorData = await confirmResponse.json();
      if (errorData.error) {
        errorMessage = errorData.error;
        if (errorData.error.includes('INSUFFICIENT_FUNDS') || errorData.error.includes('insufficient')) {
          errorCode = 'INSUFFICIENT_FUNDS';
        } else if (errorData.error.includes('TRANSACTION_FAILED') || errorData.error.includes('transaction failed')) {
          errorCode = 'TRANSACTION_FAILED';
        }
      }
    } catch {
      const errorText = await confirmResponse.text();
      errorMessage = errorText || errorMessage;
    }
    
    const error: DonationError = {
      code: errorCode,
      message: errorMessage,
    };
    console.error('[DONATION] Failed to confirm donation:', error);
    throw error;
  }

  const confirmData = await confirmResponse.json();

  if (!confirmData.success) {
    // Check for error in response
    if (confirmData.error) {
      let errorCode: DonationError['code'] = 'UNKNOWN';
      if (confirmData.error.includes('INSUFFICIENT_FUNDS') || confirmData.error.includes('insufficient')) {
        errorCode = 'INSUFFICIENT_FUNDS';
      } else if (confirmData.error.includes('TRANSACTION_FAILED')) {
        errorCode = 'TRANSACTION_FAILED';
      }
      
      const error: DonationError = {
        code: errorCode,
        message: confirmData.error,
      };
      throw error;
    }
    
    if (!confirmData.txSignature) {
      throw new Error('Backend did not return transaction signature');
    }
  }

  console.log('[DONATION] Donation confirmed:', confirmData.txSignature);

  return {
    success: true,
    txSignature: confirmData.txSignature,
  };
}
