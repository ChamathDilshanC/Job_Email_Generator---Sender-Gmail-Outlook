'use client';

import { GoogleAuthProvider } from '@/components/google-auth-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { GooeyToaster } from 'goey-toast';
import 'goey-toast/styles.css';
import { ThemeProvider, useTheme } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <GooeyToaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-center"
      closeButton
      showProgress
    />
  );
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <GoogleAuthProvider>
        <AuthProvider>
          {children}
          <ThemedToaster />
        </AuthProvider>
      </GoogleAuthProvider>
    </ThemeProvider>
  );
}
