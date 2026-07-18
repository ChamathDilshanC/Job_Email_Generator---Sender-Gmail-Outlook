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
      <CTABand onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
      <Footer />
    </div>
  );
}
