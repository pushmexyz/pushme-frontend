'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import WalletConnectButton from './WalletConnectButton';
import UserPill from './UserPill';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const auth = useAuth();
  const { isAuthenticated, username } = auth;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bangers text-[#FF2B2B]">
              PressMe.xyz
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-dm-sans font-semibold text-black hover:text-[#FF2B2B] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/overlay"
              className="font-dm-sans font-semibold text-black hover:text-[#FF2B2B] transition-colors"
            >
              Overlay
            </Link>
            {isAuthenticated && username ? (
              <UserPill key="user-pill" />
            ) : (
              <WalletConnectButton key="connect-button" />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
