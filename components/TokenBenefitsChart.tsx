'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Card from './Card';

const benefits = [
  {
    id: 'premium',
    title: 'Premium Features',
    description: 'Access exclusive interactive features',
  },
  {
    id: 'priority',
    title: 'Priority Access',
    description: 'Faster payouts & game priority',
  },
  {
    id: 'bigger',
    title: 'Bigger Actions',
    description: 'Send larger, louder stream actions',
  },
  {
    id: 'exclusive',
    title: 'Exclusive Events',
    description: 'Unlock chaos events & competitions',
  },
  {
    id: 'earnings',
    title: 'Higher Earnings',
    description: 'Earn more from daily competitions',
  },
  {
    id: 'recognition',
    title: 'Leaderboard',
    description: 'Recognition on top leaderboards',
  },
  {
    id: 'voting',
    title: 'Voting Power',
    description: 'Vote on new games & features',
  },
  {
    id: 'games',
    title: 'More Games',
    description: 'Access to exclusive holder-only games',
  },
];

export default function TokenBenefitsChart() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-4 text-center text-5xl md:text-6xl font-heading text-neutral-900 dark:text-neutral-50"
      >
        Why Hold The Token
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12 text-center text-xl font-subheading text-neutral-900 dark:text-neutral-50"
      >
        Holders get the <span className="text-accent">full power</span> of the button
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {benefits.map((benefit, index) => (
          <Card key={benefit.id} delay={index * 0.1}>
            <div className="p-6 flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <Check className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-subheading text-neutral-900 dark:text-neutral-50 mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm font-body text-neutral-600 dark:text-neutral-400">
                  {benefit.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="text-center"
      >
        <p className="text-lg font-subheading text-neutral-900 dark:text-neutral-50 mb-4">
          Holding <span className="text-accent font-bold">$PRESSME</span> is your ticket to the{' '}
          <span className="text-accent font-bold">front row</span> of the internet's wildest stream.
        </p>
        <p className="text-base font-body text-neutral-600 dark:text-neutral-400">
          Join the <span className="text-accent font-semibold">best community</span> on X •{' '}
          <span className="text-accent font-semibold">Higher payouts</span> •{' '}
          <span className="text-accent font-semibold">More games</span>
        </p>
      </motion.div>
      </div>
    </section>
  );
}
