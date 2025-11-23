'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

interface StatBoxProps {
  label: string;
  value: number;
  delay?: number;
}

function StatBox({ label, value, delay = 0 }: StatBoxProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <Card delay={delay}>
      <div className="p-6">
        <motion.div
          className="text-4xl md:text-5xl font-heading text-accent mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {displayValue.toLocaleString()}
        </motion.div>
        <div className="text-sm font-body text-neutral-600 dark:text-neutral-400 tracking-wide uppercase">
          {label}
        </div>
        <motion.div
          className="mt-4 h-1 bg-accent origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: delay + 0.5, duration: 0.5 }}
        />
      </div>
    </Card>
  );
}

export default function StatsPanel() {
  const stats = [
    { label: 'Tips Sent', value: 1247 },
    { label: 'Messages Played', value: 8932 },
    { label: 'Media Sent', value: 3421 },
    { label: 'Games Played', value: 567 },
    { label: 'SOL Paid Out', value: 1234 },
    { label: 'Active Holders', value: 892 },
  ];

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-7xl mx-auto">
        <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center text-5xl md:text-6xl font-heading text-neutral-900 dark:text-neutral-50"
      >
        Platform Stats
      </motion.h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <StatBox
            key={stat.label}
            label={stat.label}
            value={stat.value}
            delay={index * 0.1}
          />
        ))}
      </div>
      </div>
    </section>
  );
}
