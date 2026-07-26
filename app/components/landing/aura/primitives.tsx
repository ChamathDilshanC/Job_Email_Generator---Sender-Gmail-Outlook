'use client';

import { ChevronRight, Sparkles } from 'lucide-react';
import NextImage from 'next/image';
import type { CSSProperties } from 'react';

/** Inline style for the shiny gradient headline word. Paired with the
 * `.animate-shiny` keyframes and the `#c3-noise-root` filter in globals.css. */
export const gradientStyle: CSSProperties = {
  backgroundImage:
    'linear-gradient(to right, #091020 0%, #0B2551 12.5%, #A4F4FD 32.5%, #00d2ff 50%, #0B2551 67.5%, #091020 87.5%, #091020 100%)',
  backgroundSize: '200% auto',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
  WebkitTextFillColor: 'transparent',
  filter: 'url(#c3-noise-root)',
};

export function BrandMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <NextImage
      src="/logo.png"
      alt="JobMail"
      width={32}
      height={32}
      className={`${className} rounded-lg object-cover`}
    />
  );
}

interface PrimaryButtonProps {
  label?: string;
  loadingLabel?: string;
  loading?: boolean;
  onClick?: () => void;
  full?: boolean;
}

export function PrimaryButton({
  label = 'Get Started Free',
  loadingLabel = 'Signing in…',
  loading = false,
  onClick,
  full = false,
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`group inline-flex items-center justify-center gap-2 rounded-full bg-white text-black font-medium text-sm px-5 py-3 transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-60 ${full ? 'w-full' : ''}`}
    >
      <Sparkles className="w-4 h-4" />
      {loading ? loadingLabel : label}
      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-[1px]" />
    </button>
  );
}

interface SectionEyebrowProps {
  label: string;
  tag?: string;
}

export function SectionEyebrow({ label, tag }: SectionEyebrowProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-white/70">
        <span className="w-1.5 h-1.5 rounded-full bg-white" />
        {label}
      </span>
      {tag && (
        <span className="px-2 py-0.5 rounded-full border border-white/10 text-white/50 text-xs">
          {tag}
        </span>
      )}
    </div>
  );
}
