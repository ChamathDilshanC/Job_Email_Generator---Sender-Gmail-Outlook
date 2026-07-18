'use client';

import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { fadeInUp, viewportOnce } from './motion';

export function Testimonial() {
  return (
    <section className="border-t border-border px-6 py-24">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="font-heading text-2xl font-medium italic leading-snug text-foreground md:text-3xl">
          &ldquo;I built JobMail after sending the same tired template for
          the hundredth time. Now each email is tailored to the role in
          seconds — and it sounds just like me.&rdquo;
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <NextImage
            src="/logo.png"
            alt="Chamath Dilshan"
            width={36}
            height={36}
            className="rounded-full border border-border"
          />
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              Chamath Dilshan
            </p>
            <p className="text-xs text-muted-foreground">
              Creator of JobMail
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
