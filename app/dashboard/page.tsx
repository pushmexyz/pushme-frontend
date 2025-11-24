'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDonationStore, Donation } from '@/store/donationStore';
import { getRecentDonations } from '@/lib/donations';
import Navbar from '@/components/NavBar';
import WalletConnectButton from '@/components/WalletConnectButton';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuth();
  const { donations, setDonations } = useDonationStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserDonations();
    }
  }, [isAuthenticated, user]);

  const loadUserDonations = async () => {
    try {
      setLoading(true);
      console.log('[DASHBOARD] Loading donations for user:', user?.wallet);
      const { donations: recentDonations } = await getRecentDonations(50);
      
      // Filter to user's donations
      const userDonations = recentDonations.filter(
        (d) => d.wallet === user?.wallet
      );
      
      setDonations(userDonations);
      console.log('[DASHBOARD] Loaded', userDonations.length, 'donations');
    } catch (error) {
      console.error('[DASHBOARD] Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-5xl font-bangers text-black mb-4">Your Dashboard</h1>
          <p className="text-lg font-dm-sans text-gray-600 mb-8">
            Connect your wallet to view your donation history
          </p>
          <WalletConnectButton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-5xl font-bangers text-black mb-2">Your Dashboard</h1>
          <p className="text-lg font-dm-sans text-gray-600">
            Welcome back, {user?.username || 'Anonymous'}!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="font-dm-sans text-gray-600">Loading donations...</p>
          </div>
        ) : donations.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="font-dm-sans text-gray-600 mb-4">
              You haven't made any donations yet
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block px-6 py-3 bg-[#FF2B2B] text-white rounded-lg font-dm-sans font-semibold hover:bg-[#FF4444] transition-colors"
            >
              Send Your First Donation
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {donations.map((donation) => (
                <DonationCard donation={donation} key={donation.id} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function DonationCard({ donation }: { donation: Donation }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#FF2B2B] transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-bangers text-xl text-[#FF2B2B]">
            {donation.type.toUpperCase()}
          </p>
          <p className="font-dm-sans text-sm text-gray-600">
            {donation.created_at && !isNaN(new Date(donation.created_at).getTime())
              ? formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })
              : 'Just now'}
          </p>
        </div>
        <p className="font-bangers text-lg text-black">{donation.price} SOL</p>
      </div>
      
      {donation.text && (
        <p className="font-dm-sans text-gray-800 mt-2">{donation.text}</p>
      )}
      
      {donation.media_url && (
        <div className="mt-2">
          {donation.type === 'image' || donation.type === 'gif' ? (
            <img
              src={donation.media_url}
              alt="Donation"
              className="w-full h-32 object-cover rounded"
            />
          ) : donation.type === 'video' ? (
            <video
              src={donation.media_url}
              className="w-full h-32 object-cover rounded"
              controls
            />
          ) : null}
        </div>
      )}
      
      <p className="mt-2 text-xs font-dm-sans text-gray-400 font-mono">
        {donation.tx_hash.slice(0, 8)}...{donation.tx_hash.slice(-8)}
      </p>
    </div>
  );
}

