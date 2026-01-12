'use client';

import NextImage from 'next/image';
import { useState } from 'react';
import EmailTemplates from './pages/EmailTemplates';
import History from './pages/History';
import Profile from './pages/Profile';
import ResumeBuilder from './pages/ResumeBuilder';
import SendEmail from './pages/SendEmail';

type PageType = 'send-email' | 'templates' | 'resume' | 'history' | 'profile';

export default function Home() {
  const [activePage, setActivePage] = useState<PageType>('send-email');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (activePage) {
      case 'send-email':
        return <SendEmail />;
      case 'templates':
        return <EmailTemplates />;
      case 'resume':
        return <ResumeBuilder />;
      case 'history':
        return <History />;
      case 'profile':
        return <Profile />;
      default:
        return <SendEmail />;
    }
  };

  return (
    <div className="app-layout">
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-button"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar animate-slide-in ${
          isMobileMenuOpen ? 'mobile-open' : ''
        }`}
      >
        <div className="sidebar-header">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.5rem',
            }}
          >
            <NextImage
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              style={{ borderRadius: '8px' }}
            />
            <div>
              <div className="sidebar-title">JobMail</div>
              <div className="sidebar-subtitle">
                Professional Job Applications
              </div>
            </div>
          </div>
        </div>

        <nav
          style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
        >
          <div
            className={`nav-item ${
              activePage === 'send-email' ? 'active' : ''
            }`}
            onClick={() => {
              setActivePage('send-email');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Send Email
          </div>
          <div
            className={`nav-item ${activePage === 'resume' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('resume');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Your Information
          </div>

          <div
            className={`nav-item ${activePage === 'templates' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('templates');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Email Templates
          </div>

          <div
            className={`nav-item ${activePage === 'history' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('history');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </div>

          <div
            className={`nav-item ${activePage === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setActivePage('profile');
              setIsMobileMenuOpen(false);
            }}
          >
            <svg
              className="nav-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </div>

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '20px',
              textAlign: 'center',
            }}
          >
            <NextImage
              src="/logosm.png"
              alt="Logo"
              width={150}
              height={150}
              style={{
                margin: '0 auto',
                display: 'block',
              }}
            />
            <p
              className="text-center text-xs"
              style={{ marginTop: '10px', opacity: 0.7, userSelect: 'none' }}
            >
              Developed by Chamath Dilshan .
            </p>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {renderPage()}

        <footer
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            userSelect: 'none',
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
    </div>
  );
}
