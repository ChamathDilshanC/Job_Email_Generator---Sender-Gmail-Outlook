'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { CTABand } from './CTABand';
import { FeatureGrid } from './FeatureGrid';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { Navbar } from './Navbar';
import { StatsBand } from './StatsBand';
import { Testimonial } from './Testimonial';
import { TemplatesShowcase } from './TemplatesShowcase';

export function LandingPage() {
  const { handleSignIn } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const onGetStarted = async () => {
    setIsSigningIn(true);
    const result = await handleSignIn();
    setIsSigningIn(false);

    if (!result.success) {
      toast.error(result.error || 'Sign in failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
      <main>
        <Hero onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
        <FeatureGrid />
        <TemplatesShowcase />
        <Testimonial />
        <StatsBand />
      </main>
      <div className="relative w-full overflow-hidden bg-black">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 100%, rgba(70, 85, 110, 0.5) 0%, transparent 60%),
              radial-gradient(circle at 50% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%),
              radial-gradient(circle at 50% 100%, rgba(181, 184, 208, 0.3) 0%, transparent 80%)
            `,
          }}
        />
        <div className="relative z-10">
          <CTABand onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
          <Footer />
        </div>
      </div>
    </div>
  );
}
