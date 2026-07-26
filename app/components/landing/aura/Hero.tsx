'use client';

import { motion } from 'framer-motion';
import { gradientStyle, PrimaryButton } from './primitives';

interface HeroProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

export function Hero({ onGetStarted, isSigningIn }: HeroProps) {
  return (
    <section className="relative z-10 pt-16 md:pt-28 pb-20 text-center flex flex-col items-center px-6">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="text-4xl md:text-7xl font-semibold tracking-tight leading-[0.9]"
      >
        <span className="text-white">Your job search.</span>
        <br />
        <span className="animate-shiny" style={gradientStyle}>
          Revitalized
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 text-white/60 max-w-md text-base leading-[1.5]"
      >
        JobMail is the premier outreach platform for job seekers in the
        current era. It leverages powerful AI to turn your resume into
        polished, personalized application emails — then sends them straight
        from Gmail or Outlook.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <PrimaryButton onClick={onGetStarted} loading={isSigningIn} />
        <span className="text-xs text-white/40">
          Free to start · No credit card required
        </span>
      </motion.div>
    </section>
  );
}
