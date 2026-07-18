'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Paperclip, Send, Sparkles } from 'lucide-react';
import { EASE, fadeInUp, staggerContainer } from './motion';

interface HeroProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

export function Hero({ onGetStarted, isSigningIn }: HeroProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-20 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(var(--primary)/0.14),transparent)]"
      />

      <motion.div
        variants={staggerContainer(0.15)}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-3xl flex-col items-center text-center"
      >
        <motion.div
          variants={fadeInUp}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Resume-aware, AI-personalized outreach
        </motion.div>

        <motion.h1
          variants={fadeInUp}
          className="mt-7 font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-7xl"
        >
          Job emails that
          <br />
          get real replies.
        </motion.h1>

        <motion.p
          variants={fadeInUp}
          className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground"
        >
          JobMail turns your resume into a dozen polished, ready-to-send
          application emails — then sends them straight from Gmail or
          Outlook in one click.
        </motion.p>

        <motion.div
          variants={fadeInUp}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            disabled={isSigningIn}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-md transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSigningIn ? 'Signing in…' : 'Get Started Free'}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() =>
              document
                .querySelector('#templates')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="inline-flex h-12 items-center rounded-full border border-border bg-background px-7 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            Browse Templates
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Layered app-mockup stack */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
        className="relative mx-auto mt-20 max-w-3xl"
      >
        <div
          aria-hidden
          className="absolute inset-x-6 -top-4 h-full rotate-[-2deg] rounded-2xl border border-border bg-card/60 shadow-lg"
        />
        <div
          aria-hidden
          className="absolute inset-x-3 -top-2 h-full rotate-[1.2deg] rounded-2xl border border-border bg-card/80 shadow-lg"
        />

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="flex items-center gap-1.5 border-b border-border px-5 py-3.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
            <span className="ml-3 text-xs font-medium text-muted-foreground">
              New Application &middot; Comprehensive Profile
            </span>
          </div>

          <div className="space-y-3 px-6 py-6 text-left">
            <div className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 font-medium text-muted-foreground">
                To
              </span>
              <span className="rounded-md bg-accent px-2.5 py-1 text-foreground">
                hiring@vertex.com
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="w-16 shrink-0 font-medium text-muted-foreground">
                Subject
              </span>
              <span className="text-foreground">
                Application for Senior Frontend Engineer — Alex Rivera
              </span>
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4">
              <div className="h-2.5 w-full rounded-full bg-muted" />
              <div className="h-2.5 w-11/12 rounded-full bg-muted" />
              <div className="h-2.5 w-4/5 rounded-full bg-muted" />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {['React', 'TypeScript', 'Next.js'].map(tag => (
                <span
                  key={tag}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                Resume.pdf attached
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                <Send className="h-3.5 w-3.5" />
                Send via Gmail
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
