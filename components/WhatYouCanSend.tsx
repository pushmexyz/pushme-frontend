'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, Image, Music, AlertCircle, Gamepad2, Megaphone, Sparkles, Zap } from 'lucide-react';
import Card from './Card';

interface SendItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const sendItems: SendItem[] = [
  {
    id: 'text',
    title: 'Text Messages',
    description: 'Send messages that appear instantly on stream',
    icon: <MessageSquare className="h-6 w-6" />,
  },
  {
    id: 'memes',
    title: 'Memes',
    description: 'Your favorite memes displayed live',
    icon: <Image className="h-6 w-6" />,
  },
  {
    id: 'gifs',
    title: 'GIFs',
    description: 'Animated GIFs for maximum chaos',
    icon: <Sparkles className="h-6 w-6" />,
  },
  {
    id: 'images',
    title: 'Images',
    description: 'Upload any image to the stream',
    icon: <Image className="h-6 w-6" />,
  },
  {
    id: 'sounds',
    title: 'Sounds',
    description: 'Play sound effects and audio clips',
    icon: <Music className="h-6 w-6" />,
  },
  {
    id: 'ads',
    title: 'Ads',
    description: 'Promote your project or message',
    icon: <Megaphone className="h-6 w-6" />,
  },
  {
    id: 'chaos',
    title: 'Chaos Animations',
    description: 'Special effects and animations',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    id: 'games',
    title: 'Games',
    description: 'Trigger mini-games on stream',
    icon: <Gamepad2 className="h-6 w-6" />,
  },
  {
    id: 'alerts',
    title: 'Alerts',
    description: 'Important notifications and announcements',
    icon: <AlertCircle className="h-6 w-6" />,
  },
];

export default function WhatYouCanSend() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
        What You Can Send to the Stream
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12 text-center text-lg font-subheading text-neutral-600 dark:text-neutral-400"
      >
        Everything appears <span className="text-accent font-semibold">LIVE</span> on the stream
      </motion.p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sendItems.map((item, index) => (
          <div
            key={item.id}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Card delay={index * 0.1} className="cursor-pointer">
              <div className="p-6">
                <motion.div
                  className="mb-4 text-accent"
                  animate={{
                    scale: hoveredId === item.id ? 1.2 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {item.icon}
                </motion.div>
                <h3 className="text-xl font-subheading text-neutral-900 dark:text-neutral-50 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-body text-neutral-600 dark:text-neutral-400">
                  {item.description}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
