'use client';

import { auth, googleProvider } from '@/lib/firebase';
import {
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  User,
} from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  user: User | null;
  isLoading: boolean;

  // Auth methods
  handleSignIn: () => Promise<{
    success: boolean;
    token?: string;
    email?: string | null;
    error?: string;
  }>;
  handleSignOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    accessToken: null as string | null,
    userEmail: null as string | null,
    user: null as User | null,
    isLoading: true,
  });

  // Listen to auth state changes
  useEffect(() => {
    // If auth is not initialized (e.g., during SSR or missing config), skip
    if (!auth) {
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        userEmail: null,
        user: null,
        isLoading: false,
      });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          // Try to get the stored OAuth access token
          const storedToken = localStorage.getItem('google_oauth_token');
          const tokenTimestamp = localStorage.getItem(
            'google_oauth_token_timestamp'
          );

          // Check if token exists and is not expired (tokens typically expire after 1 hour)
          const isTokenExpired = tokenTimestamp
            ? Date.now() - parseInt(tokenTimestamp) > 3600000 // 1 hour in milliseconds
            : true;

          if (storedToken && !isTokenExpired) {
            console.log('✅ Using stored OAuth token');
            setAuthState({
              isAuthenticated: true,
              accessToken: storedToken,
              userEmail: user.email,
              user,
              isLoading: false,
            });
          } else {
            // Token expired or doesn't exist
            if (isTokenExpired && storedToken) {
              console.log('⚠️ OAuth token expired, clearing...');
              localStorage.removeItem('google_oauth_token');
              localStorage.removeItem('google_oauth_token_timestamp');
            }

            setAuthState({
              isAuthenticated: false,
              accessToken: null,
              userEmail: user.email,
              user,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Error getting token:', error);
          setAuthState({
            isAuthenticated: false,
            accessToken: null,
            userEmail: null,
            user: null,
            isLoading: false,
          });
        }
      } else {
        setAuthState({
          isAuthenticated: false,
          accessToken: null,
          userEmail: null,
          user: null,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!auth) {
      return {
        success: false,
        error: 'Firebase auth is not initialized',
      };
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Get the Google OAuth access token from the credential
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      console.log('🔐 Auth Debug:', {
        hasCredential: !!credential,
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length,
        tokenPreview: accessToken?.substring(0, 20) + '...',
      });

      if (!accessToken) {
        throw new Error('Failed to get access token from Google');
      }

      console.log('✅ Successfully signed in:', result.user.email);

      // Store the OAuth access token and timestamp
      localStorage.setItem('google_oauth_token', accessToken);
      localStorage.setItem(
        'google_oauth_token_timestamp',
        Date.now().toString()
      );

      // Update state
      setAuthState({
        isAuthenticated: true,
        accessToken,
        userEmail: result.user.email,
        user: result.user,
        isLoading: false,
      });

      return {
        success: true,
        token: accessToken,
        email: result.user.email,
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  };

  const handleSignOut = async () => {
    if (!auth) {
      return;
    }

    try {
      await firebaseSignOut(auth);
      // Clear the stored OAuth token and timestamp
      localStorage.removeItem('google_oauth_token');
      localStorage.removeItem('google_oauth_token_timestamp');
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshToken = async () => {
    if (authState.user) {
      try {
        const token = await authState.user.getIdToken(true);
        setAuthState(prev => ({
          ...prev,
          accessToken: token,
        }));
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }
    return null;
  };

  const value: AuthContextType = {
    ...authState,
    handleSignIn,
    handleSignOut,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
