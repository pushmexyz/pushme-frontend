'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { OverlayDonation } from '@/lib/overlayStore';

interface DonationDisplayProps {
  donation: OverlayDonation;
  onComplete: () => void;
}

export default function DonationDisplay({ donation, onComplete }: DonationDisplayProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-complete after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Auto-play audio if type is audio
  useEffect(() => {
    if (donation.type === 'audio' && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [donation.type]);

  const renderContent = () => {
    switch (donation.type) {
      case 'text':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-4 border-[#FF2B2B] p-8 max-w-2xl mx-auto"
              style={{
                boxShadow: '0 0 40px rgba(255, 43, 43, 0.4), 0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-4xl font-bangers text-[#FF2B2B] mb-4 drop-shadow-lg">
                {donation.username}
              </h2>
              <div className="inline-block bg-[#FF2B2B] text-white px-4 py-2 rounded-full text-xl font-bangers mb-6">
                {donation.amount} SOL
              </div>
              <p className="text-3xl font-bold text-black font-dm-sans whitespace-pre-wrap">
                {donation.text}
              </p>
            </motion.div>
          </div>
        );

      case 'image':
      case 'gif':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-4 border-[#FF2B2B] p-6 max-w-4xl mx-auto"
              style={{
                boxShadow: '0 0 40px rgba(255, 43, 43, 0.4), 0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-3xl font-bangers text-[#FF2B2B] mb-2 drop-shadow-lg">
                {donation.username}
              </h2>
              <div className="inline-block bg-[#FF2B2B] text-white px-4 py-2 rounded-full text-lg font-bangers mb-4">
                {donation.amount} SOL
              </div>
              <img
                src={donation.media_url}
                alt="Donation"
                className="max-w-[60%] max-h-[60vh] rounded-lg mx-auto shadow-lg"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                }}
              />
              {donation.text && (
                <p className="text-xl font-dm-sans text-black mt-4">{donation.text}</p>
              )}
            </motion.div>
          </div>
        );

      case 'video':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-black rounded-xl shadow-2xl border-4 border-[#FF2B2B] p-6 max-w-4xl mx-auto"
              style={{
                boxShadow: '0 0 40px rgba(255, 43, 43, 0.4), 0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-3xl font-bangers text-[#FF2B2B] mb-2 drop-shadow-lg">
                {donation.username}
              </h2>
              <div className="inline-block bg-[#FF2B2B] text-white px-4 py-2 rounded-full text-lg font-bangers mb-4">
                {donation.amount} SOL
              </div>
              <video
                src={donation.media_url}
                autoPlay
                muted
                loop={false}
                className="max-w-[60%] max-h-[60vh] rounded-lg mx-auto shadow-lg"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))',
                }}
              />
              {donation.text && (
                <p className="text-xl font-dm-sans text-white mt-4">{donation.text}</p>
              )}
            </motion.div>
          </div>
        );

      case 'audio':
        return (
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-4 border-[#FF2B2B] p-8 max-w-2xl mx-auto"
              style={{
                boxShadow: '0 0 40px rgba(255, 43, 43, 0.4), 0 8px 32px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2 className="text-3xl font-bangers text-[#FF2B2B] mb-2 drop-shadow-lg">
                {donation.username}
              </h2>
              <div className="inline-block bg-[#FF2B2B] text-white px-4 py-2 rounded-full text-lg font-bangers mb-6">
                {donation.amount} SOL
              </div>
              
              {/* Waveform visualizer - fake animated bars */}
              <div className="flex items-end justify-center gap-1 h-32 mb-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="bg-[#FF2B2B] rounded-t"
                    style={{ width: '8px' }}
                    animate={{
                      height: [
                        `${Math.random() * 40 + 20}px`,
                        `${Math.random() * 80 + 40}px`,
                        `${Math.random() * 40 + 20}px`,
                      ],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05,
                      ease: 'easeInOut',
                    }}
                  />
                ))}
              </div>

              <audio ref={audioRef} src={donation.media_url} />
              {donation.text && (
                <p className="text-lg font-dm-sans text-black mt-4">{donation.text}</p>
              )}
            </motion.div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: 50 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute inset-0 flex items-center justify-center z-40"
    >
      {/* Floating animation */}
      <motion.div
        animate={{
          y: [-8, 8, -8],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {renderContent()}
      </motion.div>
    </motion.div>
  );
}

