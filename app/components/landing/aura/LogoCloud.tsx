'use client';

import { motion } from 'framer-motion';

const companies = [
  'Google',
  'Meta',
  'Stripe',
  'Netflix',
  'Airbnb',
  'Notion',
  'Figma',
  'Amazon',
];

export function LogoCloud() {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
      <p className="text-center text-xs uppercase tracking-widest text-white/40">
        Trusted by job seekers hired at
      </p>
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
        {companies.map((company, i) => (
          <motion.span
            key={company}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
            className="text-center text-sm font-semibold tracking-tight text-white/50 hover:text-white"
          >
            {company}
          </motion.span>
        ))}
      </div>
    </section>
  );
}
