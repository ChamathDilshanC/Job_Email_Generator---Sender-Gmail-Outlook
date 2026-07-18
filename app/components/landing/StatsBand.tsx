'use client';

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from './motion';

const stats = [
  { value: '12+', label: 'Ready-to-send email templates' },
  { value: '2', label: 'Providers — Gmail & Outlook' },
  { value: '100%', label: 'Personalized from your resume' },
  { value: '<2 min', label: 'Average time to send' },
];

export function StatsBand() {
  return (
    <section
      id="stats"
      className="scroll-mt-20 border-t border-border px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            How it works
          </p>
          <h2 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Fill in your resume once. Apply everywhere.
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="border-l-2 border-primary/40 pl-5"
            >
              <p className="font-heading text-4xl font-semibold text-foreground">
                {stat.value}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
