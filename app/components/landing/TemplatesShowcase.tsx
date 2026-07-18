'use client';

import { TEMPLATE_METADATA } from '@/lib/templateTypes';
import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer, viewportOnce } from './motion';

export function TemplatesShowcase() {
  return (
    <section
      id="templates"
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
            Template library
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="mt-3 font-heading text-4xl font-semibold tracking-tight text-foreground md:text-5xl"
          >
            A template for every moment
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-base leading-relaxed text-muted-foreground"
          >
            {TEMPLATE_METADATA.length} professionally written templates,
            each generated from your own resume data.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {TEMPLATE_METADATA.map((template, i) => (
            <motion.div
              key={template.id}
              variants={fadeInUp}
              whileHover={{ y: -3 }}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">
                {template.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                {template.preview}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
