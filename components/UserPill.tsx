'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function UserPill() {
  const { username, wallet, walletPublicKey, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleDisconnect = useCallback(async () => {
    await logout();
    setShowDropdown(false);
  }, [logout]);

  // Use wallet from session (persisted) or walletPublicKey (connected wallet)
  const displayWallet = wallet || walletPublicKey;

  if (!isAuthenticated || !username || !displayWallet) {
    return null;
  }

  const shortWallet =
    displayWallet.length > 8
      ? `${displayWallet.slice(0, 4)}...${displayWallet.slice(-4)}`
      : displayWallet;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-black text-white rounded-full font-dm-sans font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        {/* Profile picture placeholder */}
        <span className="inline-flex w-6 h-6 rounded-full bg-[#FF2B2B] items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {username ? username.charAt(0).toUpperCase() : shortWallet.charAt(0).toUpperCase()}
        </span>
        <span>{username || shortWallet}</span>
        {shortWallet && username && (
          <span className="text-xs opacity-70">{shortWallet}</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <p className="text-xs font-dm-sans text-gray-500 mb-1">Wallet</p>
            <p className="text-sm font-dm-sans font-mono text-black break-all">
              {displayWallet}
            </p>
            {username && (
              <>
                <p className="text-xs font-dm-sans text-gray-500 mb-1 mt-2">Username</p>
                <p className="text-sm font-dm-sans text-black">{username}</p>
              </>
            )}
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full px-4 py-2 text-left text-sm font-dm-sans text-red-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
}

