'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function UserPill() {
  const { user, walletPublicKey, logout } = useAuth();
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
    console.log('[USER PILL] Disconnecting...');
    await logout();
    setShowDropdown(false);
  }, [logout]);

  if (!user || !walletPublicKey) {
    return null;
  }

  const shortWallet =
    walletPublicKey.length > 8
      ? `${walletPublicKey.slice(0, 4)}...${walletPublicKey.slice(-4)}`
      : walletPublicKey;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-4 py-2 bg-black text-white rounded-full font-dm-sans font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2"
      >
        {/* Profile picture placeholder */}
        <div className="w-6 h-6 rounded-full bg-[#FF2B2B] flex items-center justify-center text-white text-xs font-bold">
          {user.username ? user.username.charAt(0).toUpperCase() : shortWallet.charAt(0).toUpperCase()}
        </div>
        <span>{user.username || shortWallet}</span>
        {shortWallet && user.username && (
          <span className="text-xs opacity-70">{shortWallet}</span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <p className="text-xs font-dm-sans text-gray-500 mb-1">Wallet</p>
            <p className="text-sm font-dm-sans font-mono text-black break-all">
              {walletPublicKey}
            </p>
            {user.username && (
              <>
                <p className="text-xs font-dm-sans text-gray-500 mb-1 mt-2">Username</p>
                <p className="text-sm font-dm-sans text-black">{user.username}</p>
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

