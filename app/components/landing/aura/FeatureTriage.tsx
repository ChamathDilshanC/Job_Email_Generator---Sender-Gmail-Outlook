'use client';

import { motion } from 'framer-motion';
import { SectionEyebrow } from './primitives';

const chips = [
  'Auto-categorize replies',
  'Interview reminders',
  'Silent rejections',
  'One-tap follow-up',
];

const groups = [
  {
    label: 'Interviews',
    count: 4,
    color: '#ffffff',
    items: ['Vertex Robotics — call scheduled', 'Stripe — onsite Thursday'],
  },
  {
    label: 'Awaiting reply',
    count: 7,
    color: '#e5e5e5',
    items: ['Notion — Product Designer', 'Figma — intro thread'],
  },
  {
    label: 'Updates',
    count: 18,
    color: '#a3a3a3',
    items: ['Linear — application received', 'GitHub — moved to next round'],
  },
  {
    label: 'Archived',
    count: 13,
    color: '#525252',
    items: ['Auto-rejections · Newsletters · Duplicates'],
  },
];

export function FeatureTriage() {
  return (
    <section
      id="workflow"
      className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28"
    >
      <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <SectionEyebrow label="Tracking" tag="AI-native" />
          <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
            Track your search
            <br />
            in a single pass.
          </h2>
          <p className="mt-6 text-white/60 text-base leading-[1.6] max-w-md">
            JobMail reads every reply, understands intent, and sorts
            interviews from noise. Focus on the conversations that move your
            career forward — the rest stays organized automatically.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {chips.map(chip => (
              <span
                key={chip}
                className="text-xs text-white/70 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03]"
              >
                {chip}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.1 }}
          id="features"
          className="scroll-mt-20 liquid-glass rounded-2xl p-5"
        >
          <p className="text-xs text-white/50 mb-4">
            Today · 42 applications tracked
          </p>
          <div className="space-y-3">
            {groups.map(group => (
              <div key={group.label} className="liquid-glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-semibold"
                    style={{ color: group.color }}
                  >
                    {group.label}
                  </span>
                  <span className="text-xs text-white/40">{group.count}</span>
                </div>
                <ul className="mt-1.5 space-y-0.5">
                  {group.items.map(item => (
                    <li key={item} className="text-[11px] text-white/50">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
