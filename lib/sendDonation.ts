/**
 * Backend-based donation flow
 * Frontend NEVER creates transactions, fetches blockhashes, or broadcasts
 * All blockchain operations are handled by the backend
 */

import { Transaction } from '@solana/web3.js';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export interface SendDonationParams {
  wallet: string;
  type: 'text' | 'gif' | 'image' | 'audio' | 'video';
  amount: number;
  content: string;
}

export interface SendDonationResponse {
  success: boolean;
  signature: string;
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
 * Sends a donation using the backend flow:
 * 1. Request unsigned transaction from backend
 * 2. Sign with Phantom
 * 3. Send signed transaction back to backend
 * 4. Backend handles broadcast, confirmation, database, and overlay
 */
export async function sendDonation(
  params: SendDonationParams
): Promise<SendDonationResponse> {
  const { wallet, type, amount, content } = params;

  console.log('[SEND DONATION] Starting donation flow:', { wallet, type, amount });

  // Step 1: Request transaction from backend
  console.log('[SEND DONATION] Step 1: Requesting transaction from backend...');
  const createResponse = await fetch(`${API_BASE_URL}/transaction/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      wallet,
      type,
      amount,
      content,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    console.error('[SEND DONATION] Backend create error:', errorText);
    throw new Error(`Failed to create transaction: ${errorText}`);
  }

  const createData = await createResponse.json();
  console.log('[SEND DONATION] Transaction received from backend');

  if (!createData.transaction) {
    throw new Error('Backend did not return a transaction');
  }

  // Step 2: Deserialize transaction
  const transactionBuffer = Buffer.from(createData.transaction, 'base64');
  const transaction = Transaction.from(transactionBuffer);
  console.log('[SEND DONATION] Step 2: Transaction deserialized');

  // Step 3: Sign with Phantom (ONLY sign, do NOT send)
  const provider = getPhantomProvider();
  if (!provider) {
    throw new Error('Phantom wallet not found. Please install Phantom extension.');
  }

  if (!provider.isConnected) {
    throw new Error('Phantom wallet not connected. Please connect your wallet.');
  }

  console.log('[SEND DONATION] Step 3: Requesting signature from Phantom...');
  let signedTransaction: Transaction;
  
  try {
    signedTransaction = await provider.signTransaction(transaction);
    console.log('[SEND DONATION] Transaction signed by Phantom');
  } catch (error: any) {
    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('rejected')) {
      throw new Error('Transaction was cancelled by user');
    }
    throw error;
  }

  // Step 4: Serialize signed transaction
  const signedBuffer = signedTransaction.serialize({
    requireAllSignatures: false,
    verifySignatures: false,
  });
  // Convert Buffer to base64 (Buffer is already a Uint8Array)
  const signedBase64 = Buffer.from(signedBuffer).toString('base64');
  console.log('[SEND DONATION] Step 4: Signed transaction serialized');

  // Step 5: Send signed transaction back to backend
  console.log('[SEND DONATION] Step 5: Sending signed transaction to backend...');
  const sendResponse = await fetch(`${API_BASE_URL}/transaction/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signed: signedBase64,
      wallet,
      type,
      content,
      amount,
    }),
  });

  if (!sendResponse.ok) {
    const errorText = await sendResponse.text();
    console.error('[SEND DONATION] Backend send error:', errorText);
    throw new Error(`Failed to send transaction: ${errorText}`);
  }

  const sendData = await sendResponse.json();
  console.log('[SEND DONATION] Donation completed successfully:', sendData);

  if (!sendData.success || !sendData.signature) {
    throw new Error('Backend did not return success or signature');
  }

  return {
    success: true,
    signature: sendData.signature,
  };
}

