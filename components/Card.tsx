'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export default function Card({ children, className = '', hover = true, delay = 0 }: CardProps) {
  return (
    <motion.div
      className={`
        rounded-[20px] border border-neutral-200 dark:border-neutral-800
        bg-white dark:bg-neutral-900
        shadow-cardLight dark:shadow-cardDark
        transition-all duration-300
        ${hover ? 'hover:shadow-lg hover:-translate-y-1 hover:border-accent' : ''}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02 } : {}}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

