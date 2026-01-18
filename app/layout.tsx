'use client';

import './globals.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
