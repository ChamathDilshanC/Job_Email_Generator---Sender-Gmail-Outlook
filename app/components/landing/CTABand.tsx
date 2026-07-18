'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { fadeInUp, staggerContainer, viewportOnce } from './motion';

interface CTABandProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

export function CTABand({ onGetStarted, isSigningIn }: CTABandProps) {
  return (
    <section className="bg-neutral-950 px-6 pb-20 pt-24 text-center">
      <motion.div
        variants={staggerContainer(0.12)}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto max-w-2xl"
      >
        <motion.h2
          variants={fadeInUp}
          className="font-heading text-4xl font-semibold tracking-tight text-white md:text-5xl"
        >
          Send your next application in minutes.
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-4 text-neutral-400">
          Sign in with Google to connect Gmail and start generating
          personalized job emails — free, no credit card required.
        </motion.p>
        <motion.div variants={fadeInUp} className="mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            disabled={isSigningIn}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-7 text-sm font-semibold text-neutral-950 shadow-lg transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSigningIn ? 'Signing in…' : 'Start Building for Free'}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
