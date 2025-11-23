'use client';

import { motion } from 'framer-motion';

const tickerItems = [
  'LIVE 24/7',
  'WIN REAL SOL',
  'MEMES ON STREAM',
  'PLAY TO EARN',
  'CHAOS EVENTS',
  'INSTANT REWARDS',
  'COMMUNITY CONTROLLED',
];

export default function ScrollingTicker() {
  return (
    <div className="relative w-full overflow-hidden border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 py-3">
      <motion.div
        className="flex gap-8"
        animate={{
          x: [0, -50 * tickerItems.length * 2],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        }}
      >
        {[...tickerItems, ...tickerItems, ...tickerItems].map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-8 whitespace-nowrap"
          >
            <span className="text-sm font-heading font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              {item}
            </span>
            <span className="text-accent text-lg">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

