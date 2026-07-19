'use client';

import { AppSidebar } from '@/components/sidebar-01/app-sidebar';
import type { PageType } from '@/components/sidebar-01/types';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import EmailTemplates from '../pages/EmailTemplates';
import History from '../pages/History';
import Profile from '../pages/Profile';
import ResumeBuilder from '../pages/ResumeBuilder';
import Scheduled from '../pages/Scheduled';
import SendEmail from '../pages/SendEmail';

export function Dashboard() {
  const [activePage, setActivePage] = useState<PageType>('send-email');

  const renderPage = () => {
    switch (activePage) {
      case 'send-email':
        return <SendEmail onNavigate={setActivePage} />;
      case 'templates':
        return <EmailTemplates />;
      case 'resume':
        return <ResumeBuilder />;
      case 'history':
        return <History />;
      case 'scheduled':
        return <Scheduled />;
      case 'profile':
        return <Profile />;
      default:
        return <SendEmail onNavigate={setActivePage} />;
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setActivePage} activePage={activePage} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">
                JobMail
              </h1>
              <span className="text-sm text-muted-foreground">
                Professional Job Applications
              </span>
            </div>
          </div>
          <ThemeToggle />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="px-8 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
          <footer
            style={{
              marginTop: '2rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--text-muted)',
              userSelect: 'none',
              padding: '1rem',
            }}
          >
            <p style={{ marginBottom: '0.5rem' }}>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary no-underline"
              >
                Privacy Policy
              </a>
              {' • '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary no-underline"
              >
                Terms of Service
              </a>
            </p>
            <p>
              Built with ❤️ by Chamath Dilshan •{' '}
              <a
                href="https://chamathdilshan.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary"
              >
                Portfolio
              </a>
            </p>
          </footer>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
