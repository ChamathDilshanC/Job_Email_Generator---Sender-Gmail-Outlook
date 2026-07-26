'use client';

import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BrandMark } from './primitives';

const menuItems = ['File', 'Edit', 'View', 'Go', 'Window', 'Help'];

const clockFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Colombo',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

function formatSriLankaTime(date: Date) {
  const parts = clockFormatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(p => p.type === type)?.value ?? '';
  return `${get('weekday')} ${get('month')} ${get('day')} ${get('hour')}:${get('minute')} ${get('dayPeriod')}`;
}

export function MenuBarStrip() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(formatSriLankaTime(new Date()));
    const id = setInterval(() => {
      setTime(formatSriLankaTime(new Date()));
    }, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      className="relative z-10 h-10 bg-black/40 backdrop-blur-md border-t border-b border-white/10"
    >
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <BrandMark className="w-3.5 h-3.5" />
            <span className="font-bold text-white">JobMail</span>
          </div>
          {menuItems.map((item, i) => (
            <span
              key={item}
              className={`text-white/60 ${i > 2 ? 'hidden sm:inline' : ''} ${i > 3 ? 'hidden md:inline' : ''}`}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-white/60">
          <Search className="w-3.5 h-3.5" />
          <span>{time ?? ' '}</span>
        </div>
      </div>
    </motion.div>
  );
}
