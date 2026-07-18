'use client';

import { ThemeToggle } from '@/components/theme-toggle';
import { motion } from 'framer-motion';
import NextImage from 'next/image';

interface NavbarProps {
  onGetStarted: () => void;
  isSigningIn: boolean;
}

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Templates', href: '#templates' },
  { label: 'How it works', href: '#stats' },
];

export function Navbar({ onGetStarted, isSigningIn }: NavbarProps) {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2.5">
          <NextImage
            src="/logo.png"
            alt="JobMail"
            width={30}
            height={30}
            className="rounded-md"
          />
          <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
            JobMail
          </span>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map(link => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onGetStarted}
            disabled={isSigningIn}
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {isSigningIn ? 'Signing in…' : 'Get Started'}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
}
