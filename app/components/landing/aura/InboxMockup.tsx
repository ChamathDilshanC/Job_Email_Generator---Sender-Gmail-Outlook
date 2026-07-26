'use client';

import { motion } from 'framer-motion';
import {
  Archive,
  Forward,
  Inbox as InboxIcon,
  MoreHorizontal,
  Paperclip,
  Reply,
  Search,
  Send,
  Sparkles,
  Star,
  Trash2,
} from 'lucide-react';

const navItems = [
  { icon: InboxIcon, label: 'Inbox', count: 12, active: true },
  { icon: Star, label: 'Starred', count: 3 },
  { icon: Send, label: 'Sent' },
  { icon: Reply, label: 'Drafts', count: 2 },
  { icon: Archive, label: 'Archive' },
  { icon: Trash2, label: 'Trash' },
];

const labels = [
  { name: 'Interviews', color: '#00d2ff' },
  { name: 'Referrals', color: '#A4F4FD' },
  { name: 'Recruiters', color: '#f59e0b' },
  { name: 'Offers', color: '#10b981' },
];

const messages = [
  {
    name: 'Vertex Robotics',
    subject: 'Re: Senior Frontend Engineer application',
    preview: "Thanks for reaching out — we'd love to schedule a quick call...",
    time: '9:41 AM',
    unread: true,
    active: true,
  },
  {
    name: 'Sophia Chen, Notion',
    subject: 'Re: Product Designer role',
    preview: 'Loved your portfolio, especially the redesign case study...',
    time: '8:12 AM',
    unread: true,
  },
  {
    name: 'Linear',
    subject: 'Your application has been received',
    preview: 'Thanks for applying to the Software Engineer position.',
    time: 'Yesterday',
  },
  {
    name: 'Stripe',
    subject: 'Interview scheduled: Backend Engineer',
    preview: 'Your interview is confirmed for Thursday at 2:00 PM.',
    time: 'Yesterday',
  },
  {
    name: 'Figma',
    subject: 'Re: Introduction from JobMail',
    preview: "Thanks for the note — let's connect next week.",
    time: 'Mon',
  },
  {
    name: 'GitHub',
    subject: 'Application status update',
    preview: "We've moved your application to the next round.",
    time: 'Mon',
  },
];

const toolbarIcons = [Reply, Forward, Archive, Trash2];

export function InboxMockup() {
  return (
    <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0e1014]/90 backdrop-blur-2xl"
      >
        <div className="relative flex items-center justify-center border-b border-white/10 px-4 py-3">
          <div className="absolute left-4 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-white/50">JobMail — Inbox</span>
        </div>

        <div className="grid grid-cols-12 h-[520px]">
          {/* Sidebar */}
          <div className="hidden md:flex col-span-3 border-r border-white/10 bg-black/30 p-4 flex-col gap-6">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white text-black text-xs font-semibold px-3 py-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Compose with AI
            </button>

            <nav className="flex flex-col gap-1">
              {navItems.map(item => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-2 text-xs ${
                    item.active
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                  {item.count !== undefined && (
                    <span className="text-white/40">{item.count}</span>
                  )}
                </div>
              ))}
            </nav>

            <div>
              <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">
                Labels
              </p>
              <div className="flex flex-col gap-2">
                {labels.map(label => (
                  <div
                    key={label.name}
                    className="flex items-center gap-2 text-xs text-white/60"
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Message list */}
          <div className="col-span-12 md:col-span-4 border-r border-white/10 overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 text-xs text-white/40">
              <Search className="w-3.5 h-3.5" />
              Search mail
            </div>
            {messages.map(message => (
              <div
                key={message.subject}
                className={`border-b border-white/5 px-4 py-3 ${
                  message.active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs ${message.unread ? 'font-semibold text-white' : 'text-white/70'}`}
                  >
                    {message.name}
                  </span>
                  <span className="text-[10px] text-white/40">
                    {message.time}
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs ${message.unread ? 'text-white/90' : 'text-white/60'}`}
                >
                  {message.subject}
                </p>
                <p className="mt-0.5 text-[11px] text-white/40 line-clamp-1">
                  {message.preview}
                </p>
              </div>
            ))}
          </div>

          {/* Reader */}
          <div className="hidden md:flex col-span-5 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-1">
                {toolbarIcons.map((Icon, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-7 h-7 rounded-md hover:bg-white/5 flex items-center justify-center text-white/60"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
              <MoreHorizontal className="w-3.5 h-3.5 text-white/60" />
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">
                  Re: Senior Frontend Engineer application
                </h3>
                <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] text-white/60">
                  Interviews
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#00d2ff] to-[#0B2551] flex items-center justify-center text-[11px] font-semibold text-white">
                  V
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    Vertex Robotics
                  </p>
                  <p className="text-[10px] text-white/40">to me · 9:41 AM</p>
                </div>
              </div>

              <div className="mt-4 liquid-glass rounded-lg p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                  <Sparkles className="w-3 h-3" style={{ color: '#A4F4FD' }} />
                  Summary by JobMail AI
                </p>
                <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
                  Vertex wants to schedule a 30-minute intro call this week.
                  No red flags — respond with your availability within 24
                  hours for best results.
                </p>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-white/70">
                <p>Hi Alex,</p>
                <p>
                  Thanks so much for reaching out about the Senior Frontend
                  Engineer role. Your project portfolio really stood out to
                  our team, especially the work on real-time collaboration
                  tools.
                </p>
                <p>
                  We&apos;d love to set up a quick 30-minute call this week
                  to learn more about your experience and answer any
                  questions you might have about the role.
                </p>
                <p>
                  Let me know a couple of times that work for you and
                  I&apos;ll send a calendar invite.
                </p>
                <p className="text-white/50">— Priya, Talent Partner at Vertex</p>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-white/60">
                <Paperclip className="w-3 h-3" />
                Senior-Frontend-Engineer-JD.pdf
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
