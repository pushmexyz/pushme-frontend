'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NowPlaying {
  title: string;
  artist: string;
  albumArt?: string;
  progress?: number;
  duration?: number;
}

export default function MusicPlayer() {
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);

  useEffect(() => {
    // Listen for WebSocket music events
    const wsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || 'ws://localhost:5001/overlay';
    let ws: WebSocket | null = null;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (msg) => {
          try {
            const event = JSON.parse(msg.data);
            if (event.type === 'now_playing') {
              console.log('[MUSIC] Now playing:', event);
              setNowPlaying({
                title: event.title || 'Unknown Title',
                artist: event.artist || 'Unknown Artist',
                albumArt: event.albumArt || '/placeholder.jpg',
                progress: event.progress || 0,
                duration: event.duration || 0,
              });
            }
          } catch (error) {
            console.error('[MUSIC] Failed to parse event:', error);
          }
        };
        ws.onerror = () => {
          // Reconnect on error
          setTimeout(connect, 3000);
        };
      } catch (error) {
        console.error('[MUSIC] Failed to connect:', error);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  if (!nowPlaying) {
    // Default state with placeholder
    return (
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-[#FF2B2B]/20 p-4 flex items-center gap-4 min-w-[280px]">
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bangers text-[#FF2B2B] text-lg">No song playing</p>
            <p className="font-dm-sans text-gray-600 text-sm">Waiting for music...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const progressPercent = nowPlaying.duration 
    ? (nowPlaying.progress || 0) / nowPlaying.duration * 100 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.div
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-[#FF2B2B]/20 p-4 min-w-[320px]"
        style={{
          boxShadow: '0 0 20px rgba(255, 43, 43, 0.3)',
        }}
        animate={{
          boxShadow: [
            '0 0 20px rgba(255, 43, 43, 0.3)',
            '0 0 30px rgba(255, 43, 43, 0.5)',
            '0 0 20px rgba(255, 43, 43, 0.3)',
          ],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="flex items-center gap-4 mb-3">
          {/* Album cover */}
          <motion.div
            className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
            style={{ borderRadius: '8px' }}
            whileHover={{ scale: 1.1 }}
          >
            <img
              src={nowPlaying.albumArt || '/placeholder.jpg'}
              alt={`${nowPlaying.title} by ${nowPlaying.artist}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkYyQjJCIi8+Cjwvc3ZnPgo=';
              }}
            />
          </motion.div>

          {/* Track info */}
          <div className="flex-1 min-w-0">
            <motion.p
              className="font-bangers text-[#FF2B2B] text-lg truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {nowPlaying.title}
            </motion.p>
            <motion.p
              className="font-dm-sans text-gray-600 text-sm truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {nowPlaying.artist}
            </motion.p>
          </div>

          {/* Play indicator */}
          <motion.div
            className="w-3 h-3 rounded-full bg-[#FF2B2B] flex-shrink-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Progress bar */}
        {nowPlaying.duration && (
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FF2B2B]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

