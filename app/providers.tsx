'use client';

import { GoogleAuthProvider } from '@/components/google-auth-provider';
import { AuthProvider } from '@/contexts/AuthContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <GoogleAuthProvider>
      <AuthProvider>{children}</AuthProvider>
    </GoogleAuthProvider>
  );
}
