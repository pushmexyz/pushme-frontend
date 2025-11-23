'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import Card from './Card';

interface LeaderboardEntry {
  username: string;
  totalEarned: number;
  rank: number;
}

export default function Leaderboard() {
  const entries: LeaderboardEntry[] = [
    { username: 'crypto_king', totalEarned: 125.5, rank: 1 },
    { username: 'solana_master', totalEarned: 98.2, rank: 2 },
    { username: 'button_presser', totalEarned: 76.8, rank: 3 },
    { username: 'stream_champ', totalEarned: 54.3, rank: 4 },
    { username: 'press_me_pro', totalEarned: 42.1, rank: 5 },
  ];

  return (
    <section className="w-full max-w-4xl px-4 py-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center text-5xl md:text-6xl font-heading font-black text-neutral-900 dark:text-neutral-50"
      >
        Leaderboard
      </motion.h2>
      <Card hover={false}>
        <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between px-6 py-4 transition-all hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                    entry.rank === 1
                      ? 'bg-accent/10 text-accent shadow-lg shadow-accent/30'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  {entry.rank === 1 ? (
                    <Trophy className="h-6 w-6" />
                  ) : (
                    <span className="text-sm font-heading font-bold">#{entry.rank}</span>
                  )}
                </div>
                <div>
                  <div className="font-heading font-bold text-neutral-900 dark:text-neutral-50">
                    {entry.username}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`font-heading font-bold text-lg ${
                    entry.rank === 1 ? 'text-accent' : 'text-neutral-900 dark:text-neutral-50'
                  }`}
                >
                  {entry.totalEarned} SOL
                </div>
                <div className="text-xs font-body text-neutral-500 dark:text-neutral-400 tracking-wide">
                  SOL Earned
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </section>
  );
}
