'use client';

import { AppSidebar } from '@/components/sidebar-01/app-sidebar';
import type { PageType } from '@/components/sidebar-01/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { pageFromPathname, routeForPage } from '@/lib/pageNavigation';
import packageJson from '../../package.json';
import DocsPage from '../pages/DocsPage';
import EmailTemplates from '../pages/EmailTemplates';
import GuidePage from '../pages/GuidePage';
import History from '../pages/History';
import Profile from '../pages/Profile';
import ResumeBuilder from '../pages/ResumeBuilder';
import Scheduled from '../pages/Scheduled';
import SendEmail from '../pages/SendEmail';
import CoverLetter from '../pages/CoverLetter';

export function Dashboard() {
  const [activePage, setActivePage] = useState<PageType>('send-email');
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const isWorkspacePage = activePage === 'cover-letter' || activePage === 'resume';

  useEffect(() => {
    setSidebarExpanded(localStorage.getItem('jobmail-sidebar-expanded') === 'true');
  }, []);

  useEffect(() => {
    const page = pageFromPathname(window.location.pathname);
    setActivePage(page);
    if (window.location.pathname === '/') {
      window.history.replaceState(null, '', routeForPage(page));
    }

    const handlePopState = () => {
      setActivePage(pageFromPathname(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPage = (page: PageType) => {
    const route = routeForPage(page);
    if (window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
    setActivePage(page);
  };

  const updateSidebarExpanded = (expanded: boolean) => {
    setSidebarExpanded(expanded);
    localStorage.setItem('jobmail-sidebar-expanded', String(expanded));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'send-email':
        return <SendEmail onNavigate={navigateToPage} />;
      case 'templates':
        return <EmailTemplates />;
      case 'cover-letter':
        return <CoverLetter />;
      case 'resume':
        return <ResumeBuilder />;
      case 'history':
        return <History />;
      case 'scheduled':
        return <Scheduled onNavigate={navigateToPage} />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return (
          <Profile
            settingsMode
            sidebarExpanded={sidebarExpanded}
            onSidebarExpandedChange={updateSidebarExpanded}
          />
        );
      case 'guide':
        return <GuidePage />;
      case 'docs':
        return <DocsPage />;
      default:
        return <SendEmail onNavigate={navigateToPage} />;
    }
  };

  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden">
      <AppSidebar
        onNavigate={navigateToPage}
        activePage={activePage}
        expandedPinned={sidebarExpanded}
        onExpandedPinnedChange={updateSidebarExpanded}
      />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight">
                JobMail
              </h1>
              <span className="text-sm text-muted-foreground">
                Professional Job Applications
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary sm:inline-flex">
              v{packageJson.version}
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className={`min-h-0 flex-1 ${isWorkspacePage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          <div className={`px-4 pt-4 sm:px-8 ${isWorkspacePage ? 'h-full min-h-0' : 'pb-24'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={isWorkspacePage ? 'h-full min-h-0' : undefined}
              >
                {renderPage()}
              </motion.div>
            </AnimatePresence>
          </div>
          {!isWorkspacePage && <footer
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
          </footer>}
        </main>
      </div>
    </div>
  );
}
