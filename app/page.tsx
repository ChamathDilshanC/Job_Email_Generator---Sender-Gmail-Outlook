'use client';

import { AppSidebar } from '@/components/sidebar-01/app-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useState } from 'react';
import EmailTemplates from './pages/EmailTemplates';
import History from './pages/History';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import SendEmail from './pages/SendEmail';

type PageType = 'send-email' | 'templates' | 'resume' | 'history' | 'profile';

export default function Home() {
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">JobMail</h1>
            <span className="text-sm text-muted-foreground">
              Professional Job Applications
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="px-8 py-4">{renderPage()}</div>
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
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                Privacy Policy
              </a>
              {' • '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
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
                style={{ color: 'var(--primary)' }}
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
