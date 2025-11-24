/**
 * Error handling utilities for donations
 */

import { DonationError } from './sendDonation';

export function parseDonationError(error: any): DonationError {
  // If already a DonationError, return it
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    return error as DonationError;
  }

  // Parse from error message
  const message = error?.message || error?.toString() || 'Unknown error';
  
  if (message.includes('INSUFFICIENT_FUNDS') || message.toLowerCase().includes('insufficient')) {
    return {
      code: 'INSUFFICIENT_FUNDS',
      message: 'Not enough SOL to complete this donation.',
    };
  }
  
  if (message.includes('TRANSACTION_FAILED') || message.toLowerCase().includes('transaction failed')) {
    return {
      code: 'TRANSACTION_FAILED',
      message: 'Transaction failed — try again.',
    };
  }
  
  if (message.includes('cancelled') || message.includes('rejected') || message.includes('User rejected')) {
    return {
      code: 'USER_REJECTED',
      message: 'Transaction was cancelled.',
    };
  }
  
  return {
    code: 'UNKNOWN',
    message: message.length > 100 ? 'An error occurred. Please try again.' : message,
  };
}

export function getToastMessage(error: DonationError): string {
  switch (error.code) {
    case 'INSUFFICIENT_FUNDS':
      return 'Not enough SOL to complete this donation.';
    case 'TRANSACTION_FAILED':
      return 'Transaction failed — try again.';
    case 'USER_REJECTED':
      return 'Transaction was cancelled.';
    default:
      return error.message || 'An error occurred. Please try again.';
  }
}

