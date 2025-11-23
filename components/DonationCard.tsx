'use client';

import { motion } from 'framer-motion';
import { Donation } from '@/store/donationStore';
import { formatDistanceToNow } from 'date-fns';

interface DonationCardProps {
  donation: Donation;
  onComplete?: () => void;
}

export default function DonationCard({ donation, onComplete }: DonationCardProps) {
  const getMediaElement = () => {
    if (donation.type === 'text' && donation.text) {
      return (
        <div className="bg-white/90 rounded-lg p-4 border-2 border-[#FF2B2B]">
          <p className="font-dm-sans text-black text-lg">{donation.text}</p>
        </div>
      );
    }

    if (donation.media_url) {
      if (donation.type === 'image' || donation.type === 'gif') {
        return (
          <img
            src={donation.media_url}
            alt="Donation"
            className="max-w-full max-h-64 rounded-lg border-2 border-[#FF2B2B]"
          />
        );
      }

      if (donation.type === 'video') {
        return (
          <video
            src={donation.media_url}
            autoPlay
            loop
            muted
            className="max-w-full max-h-64 rounded-lg border-2 border-[#FF2B2B]"
          />
        );
      }

      if (donation.type === 'audio') {
        return (
          <audio
            src={donation.media_url}
            autoPlay
            controls
            className="w-full"
          />
        );
      }
    }

    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-4 border-[#FF2B2B] p-6 max-w-md mx-auto"
      style={{
        boxShadow: '0 0 40px rgba(255, 43, 43, 0.4)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bangers text-[#FF2B2B]">
            {donation.username || 'Anonymous'}
          </h3>
          <p className="text-sm font-dm-sans text-gray-600">
            {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bangers text-black">{donation.price} SOL</p>
          <p className="text-xs font-dm-sans text-gray-500 uppercase">{donation.type}</p>
        </div>
      </div>

      {/* Media */}
      {getMediaElement() && (
        <div className="mt-4 flex justify-center">{getMediaElement()}</div>
      )}
    </motion.div>
  );
}

