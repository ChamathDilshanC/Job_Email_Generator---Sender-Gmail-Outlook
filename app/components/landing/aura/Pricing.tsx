'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';

interface Plan {
  tier: string;
  monthly: string | null;
  yearly: string | null;
  desc: string;
  features: string[];
  pro?: boolean;
}

const plans: Plan[] = [
  {
    tier: 'Free',
    monthly: 'Free',
    yearly: 'Free',
    desc: 'For job seekers just starting their search.',
    features: [
      '5 AI-generated emails per month',
      'Gmail sending',
      'Basic templates',
      'Application history (7 days)',
      'Access via web',
    ],
  },
  {
    tier: 'Standard',
    monthly: '$9,99/m',
    yearly: '$99,99/y',
    desc: 'For active job seekers running a serious search.',
    features: [
      '100 AI-generated emails per month',
      'Gmail + Outlook sending',
      'All 12 templates',
      'Unlimited application history',
      'Priority email support',
    ],
  },
  {
    tier: 'Pro',
    monthly: '$19,99/m',
    yearly: '$199,99/y',
    desc: 'For career changers and power users applying at scale.',
    features: [
      'Unlimited AI-generated emails',
      'Gmail + Outlook + follow-up scheduling',
      'Custom template creation',
      'Resume + cover letter AI tailoring',
      'Priority support & early access',
    ],
    pro: true,
  },
];

interface PricingProps {
  onGetStarted: () => void;
}

export function Pricing({ onGetStarted }: PricingProps) {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-20 c3-pricing-section">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <filter id="c3-noise-pricing">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.5"
            numOctaves={2}
            stitchTiles="stitch"
          />
          <feComponentTransfer>
            <feFuncA type="linear" slope={0.075} />
          </feComponentTransfer>
          <feComposite in2="SourceGraphic" operator="in" result="noise" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </svg>

      <div className="c3-watermark-container">
        <div className="c3-watermark-main">
          <span className="c3-watermark-line-1">Your job search.</span>
          <span className="c3-watermark-line-2">Revitalized</span>
        </div>
      </div>

      <div className="c3-grid">
        {plans.map(plan => (
          <div
            key={plan.tier}
            className={`c3-card ${plan.pro ? 'c3-card-pro' : ''}`}
          >
            <span className="c3-tier-small">{plan.tier}</span>
            <span className="c3-tier-large">
              {plan.tier === 'Free'
                ? 'Free'
                : yearly
                  ? plan.yearly
                  : plan.monthly}
            </span>
            <p className="c3-desc">{plan.desc}</p>
            <ul className="c3-list">
              {plan.features.map(feature => (
                <li key={feature}>
                  <span className="c3-check">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <button type="button" className="c3-btn" onClick={onGetStarted}>
              Choose Plan
            </button>
          </div>
        ))}
      </div>

      <div className="c3-toggle-wrap">
        <span className="text-sm text-white/70">Yearly</span>
        <button
          type="button"
          onClick={() => setYearly(y => !y)}
          className={`c3-toggle ${yearly ? 'active' : ''}`}
          aria-pressed={yearly}
        >
          <span className="c3-toggle-knob" />
        </button>
      </div>
    </section>
  );
}
