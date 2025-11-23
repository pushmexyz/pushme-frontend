/**
 * Phantom Wallet Provider Utilities
 * Uses Phantom's direct API for transactions (recommended method)
 * See: https://docs.phantom.com/solana/sending-a-transaction
 */

export function getPhantomProvider() {
  if (typeof window === 'undefined') return null;
  
  const provider = (window as any).phantom?.solana;
  if (!provider || !provider.isPhantom) {
    return null;
  }
  
  return provider;
}

export async function signAndSendTransaction(
  transaction: any,
  options?: { skipPreflight?: boolean; maxRetries?: number }
): Promise<string> {
  const provider = getPhantomProvider();
  
  if (!provider) {
    throw new Error('Phantom wallet not found. Please install Phantom extension.');
  }

  if (!provider.isConnected) {
    throw new Error('Phantom wallet not connected. Please connect your wallet.');
  }

  try {
    // Use Phantom's signAndSendTransaction - it handles RPC submission automatically
    // This is the recommended method per Phantom docs
    const { signature } = await provider.signAndSendTransaction(transaction, options);
    
    if (!signature) {
      throw new Error('Transaction signature not received');
    }

    return signature;
  } catch (error: any) {
    // Handle user rejection
    if (error.code === 4001 || error.message?.includes('User rejected') || error.message?.includes('rejected')) {
      throw new Error('Transaction was cancelled by user');
    }
    
    // Re-throw other errors
    throw error;
  }
}

export async function waitForTransactionConfirmation(
  signature: string,
  connection: any,
  timeout: number = 30000
): Promise<{ confirmed: boolean; status: any }> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const status = await connection.getSignatureStatus(signature);
      
      if (status?.value) {
        if (status.value.err) {
          throw new Error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
        }
        
        if (status.value.confirmationStatus === 'confirmed' || status.value.confirmationStatus === 'finalized') {
          return {
            confirmed: true,
            status: status.value,
          };
        }
      }
      
      // Wait a bit before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error: any) {
      // If it's a network error, keep retrying
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Transaction confirmation timeout');
}

