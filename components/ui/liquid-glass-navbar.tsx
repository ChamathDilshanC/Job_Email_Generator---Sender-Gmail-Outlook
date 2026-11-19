'use client';

import { cn } from '@/lib/utils';
import type { KeyboardEvent, ReactNode } from 'react';

export interface LiquidNavbarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  complete?: boolean;
  disabled?: boolean;
}

interface LiquidNavbarProps {
  items: LiquidNavbarItem[];
  active: string;
  onChange: (id: string) => void;
  tone?: 'light' | 'dark';
  className?: string;
}

export function LiquidNavbar({
  items,
  active,
  onChange,
  tone = 'light',
  className,
}: LiquidNavbarProps) {
  const activeIndex = Math.max(
    0,
    items.findIndex(item => item.id === active)
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    const direction =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : 0;
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? items.length - 1
          : (activeIndex + direction + items.length) % items.length;
    const nextItem = items[nextIndex];
    if (nextItem && !nextItem.disabled) onChange(nextItem.id);
  };

  return (
    <div
      role="tablist"
      aria-label="Resume builder sections"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border p-1.5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400/40',
        tone === 'light'
          ? 'border-slate-200/80 bg-white/80'
          : 'border-white/10 bg-slate-950/70',
        className
      )}
    >
      {items.map(item => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`resume-section-${item.id}`}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              'group relative flex min-w-max flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm',
              isActive
                ? tone === 'light'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'bg-white/15 text-white'
                : tone === 'light'
                  ? 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  : 'text-white/55 hover:bg-white/10 hover:text-white',
              item.disabled && 'cursor-not-allowed opacity-45'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.complete && (
              <span
                aria-label="Complete"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
            )}
            {isActive && (
              <span
                aria-hidden
                className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-indigo-500/80"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
