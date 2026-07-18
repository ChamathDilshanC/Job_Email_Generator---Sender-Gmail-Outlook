'use client';

import { GoogleAuthProvider } from '@/components/google-auth-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';

interface ProvidersProps {
  children: React.ReactNode;
}

function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="top-center"
      richColors
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
