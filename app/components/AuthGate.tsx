'use client';

import { LandingPage } from '@/app/components/landing/LandingPage';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import NextImage from 'next/image';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <NextImage
          src="/logo.png"
          alt="JobMail"
          width={44}
          height={44}
          className="rounded-lg"
        />
      </motion.div>
      <p className="text-sm text-muted-foreground">Loading JobMail…</p>
    </div>
  );
}

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * Gates the main app behind Google sign-in. Unauthenticated visitors see the
 * marketing landing page instead of the dashboard/generator.
 */
export function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <>{children}</>;
}
