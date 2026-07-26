'use client';

import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { BrandMark, PrimaryButton } from './primitives';

interface NavbarProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Testimonials', href: '#testimonials' },
];

export function Navbar({ onGetStarted, isSigningIn }: NavbarProps) {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-20 max-w-6xl mx-auto px-6 flex items-center justify-between h-20"
    >
      <BrandMark />

      <div className="hidden md:flex gap-8">
        {links.map((link, i) => (
          <motion.button
            key={link.href}
            type="button"
            onClick={() => scrollTo(link.href)}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
            className="text-white/70 text-sm font-medium hover:text-white"
          >
            {link.label}
          </motion.button>
        ))}
      </div>

      <div className="hidden md:flex">
        <PrimaryButton onClick={onGetStarted} loading={isSigningIn} />
      </div>

      <button
        type="button"
        aria-label="Open menu"
        className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center"
      >
        <Menu className="w-4 h-4" />
      </button>
    </motion.nav>
  );
}
