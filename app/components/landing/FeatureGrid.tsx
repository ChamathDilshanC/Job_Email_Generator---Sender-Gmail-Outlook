'use client';

import { motion } from 'framer-motion';
import {
  Clock,
  FileStack,
  MailCheck,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { fadeInUp, staggerContainer, viewportOnce } from './motion';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: FileStack,
    title: '12 tailored templates',
    description:
      'Cold outreach, referrals, thank-yous, check-ins, networking, and offer responses — each with its own tone and layout.',
  },
  {
    icon: Sparkles,
    title: 'Resume-aware generation',
    description:
      'Your work history, projects, and skills are woven into every email automatically — no copy-pasting required.',
  },
  {
    icon: MailCheck,
    title: 'One-click sending',
    description:
      'Send straight from Gmail with attachments, or hand off to Outlook — all without leaving JobMail.',
  },
  {
    icon: Clock,
    title: 'Application history',
    description:
      'Every email you send is logged and searchable, so you always know who you contacted and when.',
  },
];

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-t border-border px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-semibold uppercase tracking-wider text-primary"
          >
            Everything included
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="mt-3 font-serif text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            Built to get you the interview
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-base leading-relaxed text-muted-foreground"
          >
            From the first cold email to the offer letter, JobMail has a
            template — and the data to fill it in — for every stage of the
            search.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map(feature => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
