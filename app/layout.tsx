'use client';

import MobileNotSupported from '@/components/MobileNotSupported';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import './globals.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isMobile = useMobileDetection();

  return (
    <html lang="en">
      <head>
        <title>JobMail - Professional Job Application Emails</title>
        <meta
          name="description"
          content="Generate professional job application emails with AI-powered assistance. Create personalized, compelling emails for your job applications."
        />
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <Providers>{isMobile ? <MobileNotSupported /> : children}</Providers>
      </body>
    </html>
  );
}
