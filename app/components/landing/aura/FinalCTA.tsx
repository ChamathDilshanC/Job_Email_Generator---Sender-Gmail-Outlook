'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { PrimaryButton } from './primitives';

interface FinalCTAProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

export function FinalCTA({ onGetStarted, isSigningIn }: FinalCTAProps) {
  const scrollToInbox = () => {
    document
      .querySelector('#workflow')
      ?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7 }}
        className="liquid-glass relative overflow-hidden rounded-3xl px-8 py-16 md:py-24 text-center"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'radial-gradient(600px circle at 50% 0%, rgba(255,255,255,0.15), transparent 70%)',
          }}
        />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
            Close the tabs.
            <br />
            Open the offer.
          </h2>
          <p className="mt-6 text-white/60 max-w-md mx-auto text-sm leading-[1.6]">
            Join thousands of job seekers who treat their search like a
            system — not a scramble.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <PrimaryButton onClick={onGetStarted} loading={isSigningIn} />
            <button
              type="button"
              onClick={scrollToInbox}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 text-white text-sm font-medium px-5 py-3 hover:bg-white/5"
            >
              See it in action
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
