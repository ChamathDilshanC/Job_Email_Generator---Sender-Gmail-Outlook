'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { toast } from 'sonner';
import { FinalCTA } from './aura/FinalCTA';
import { Hero } from './aura/Hero';
import { InboxMockup } from './aura/InboxMockup';
import { FeatureTriage } from './aura/FeatureTriage';
import { LogoCloud } from './aura/LogoCloud';
import { MenuBarStrip } from './aura/MenuBarStrip';
import { Navbar } from './aura/Navbar';
import { Pricing } from './aura/Pricing';
import { Testimonials } from './aura/Testimonials';
import { Footer } from './Footer';

const BG_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_064122_c4750c0e-7476-4b44-94a2-a85a65c63bf2.mp4';

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
    <div className="aura-landing relative min-h-screen overflow-x-hidden bg-[#0c0c0c] text-white selection:bg-white/20">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="c3-noise-root">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.35 0"
          />
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
        </filter>
      </svg>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover pointer-events-none"
          src={BG_VIDEO_URL}
        />
        <div className="absolute inset-0 bg-black/45" />
      </div>

      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 -translate-x-[calc(50%+36rem)] w-px bg-white/10 z-[5]" />
      <div className="hidden md:block pointer-events-none fixed inset-y-0 left-1/2 translate-x-[calc(-50%+36rem)] w-px bg-white/10 z-[5]" />

      <Navbar onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
      <Hero onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
      <MenuBarStrip />
      <InboxMockup />
      <FeatureTriage />
      <LogoCloud />
      <Testimonials />
      <Pricing onGetStarted={onGetStarted} />
      <FinalCTA onGetStarted={onGetStarted} isSigningIn={isSigningIn} />
      <Footer />
    </div>
  );
}
