'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'JobMail took my resume and turned it into a dozen emails that actually sound like me. I had three interviews booked in the first week.',
    name: 'Maya Torres',
    role: 'Software Engineer',
    company: 'STRIPE',
  },
  {
    quote:
      'The AI drafts are shockingly good — no more staring at a blank compose window at midnight.',
    name: 'Daniel Osei',
    role: 'Product Designer',
    company: 'NOTION',
  },
  {
    quote:
      'I sent forty applications in a weekend without losing the personal touch. Worth it for the tracking alone.',
    name: 'Priya Nair',
    role: 'Data Analyst',
    company: 'FIGMA',
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="scroll-mt-20 relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 border-t border-white/10"
    >
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: i * 0.08 }}
            className="liquid-glass rounded-2xl p-6"
          >
            <blockquote className="text-sm text-white/80 leading-[1.6]">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-white/10">
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-white/50">{t.role}</p>
              <p className="text-xs text-white font-semibold tracking-wide uppercase">
                {t.company}
              </p>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
