'use client';

import { motion } from 'framer-motion';

interface RadioBoxProps {
  song?: string;
  artist?: string;
  img?: string;
}

export default function RadioBox({
  song = 'Midnight City',
  artist = 'M83',
  img = '/placeholder.jpg',
}: RadioBoxProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.div
        className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border-2 border-[#FF2B2B]/20 p-4 flex items-center gap-4 min-w-[280px]"
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
        {/* Album cover */}
        <motion.div
          className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0"
          style={{ borderRadius: '8px' }}
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          <img
            src={img}
            alt={`${song} by ${artist}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to a placeholder if image fails
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRkYyQjJCIi8+CjxwYXRoIGQ9Ik0zMiAyMEMzNS4zMTM3IDIwIDM4IDIyLjY4NjMgMzggMjZWMzguMDAwMUw0MiAyNkw0OCAzMkwzOCA0MlYzOEMzOCA0MS4zMTM3IDM1LjMxMzcgNDQgMzIgNDRDMjguNjg2MyA0NCAyNiA0MS4zMTM3IDI2IDM4VjI2QzI2IDIyLjY4NjMgMjguNjg2MyAyMCAzMiAyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
            }}
          />
        </motion.div>

        {/* Track info */}
        <div className="flex-1 min-w-0">
          <motion.p
            className="font-bangers text-[#FF2B2B] text-lg truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {song}
          </motion.p>
          <motion.p
            className="font-dm-sans text-gray-600 text-sm truncate"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {artist}
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
      </motion.div>
    </motion.div>
  );
}

