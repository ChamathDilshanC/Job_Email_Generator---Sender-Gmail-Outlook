'use client';

import { motion } from 'framer-motion';
import NextImage from 'next/image';
import { fadeIn, viewportOnce } from './motion';

const columns = [
  {
    heading: 'Product',
    links: [
      { label: 'Send Email', href: '#' },
      { label: 'Templates', href: '#templates' },
      { label: 'Features', href: '#features' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Portfolio', href: 'https://chamathdilshan.com' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-6 text-neutral-400 sm:px-10 lg:px-16">
      <motion.div
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="w-full border-t border-neutral-800 pt-12"
      >
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <NextImage
                src="/logo.png"
                alt="JobMail"
                width={26}
                height={26}
                className="rounded-md"
              />
              <span className="font-heading text-base font-semibold text-white">
                JobMail
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Resume-aware job application emails, generated and sent in
              minutes.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            {columns.map(col => (
              <div key={col.heading}>
                <p className="text-sm font-semibold text-white">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={
                          link.href.startsWith('http')
                            ? 'noopener noreferrer'
                            : undefined
                        }
                        className="text-sm text-neutral-400 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-800 pt-6 text-xs text-neutral-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} JobMail. All rights reserved.</p>
          <p>
            Built with ❤️ by{' '}
            <a
              href="https://chamathdilshan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white"
            >
              Chamath Dilshan
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}
