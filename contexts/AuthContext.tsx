'use client';

import { clearBrowserCache } from '@/lib/clearCache';
import { useGoogleLogin } from '@react-oauth/google';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

interface SignInResult {
  success: boolean;
  token?: string;
  email?: string | null;
  error?: string;
}

interface AuthContextType {
  // Auth state
  isAuthenticated: boolean;
  accessToken: string | null;
  userEmail: string | null;
  user: AuthUser | null;
  isLoading: boolean;

  // Auth methods
  handleSignIn: () => Promise<SignInResult>;
  handleSignOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'google_oauth_token';
const TOKEN_TIMESTAMP_KEY = 'google_oauth_token_timestamp';
const TOKEN_EXPIRES_IN_KEY = 'google_oauth_token_expires_in';
const USER_KEY = 'google_oauth_user';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    accessToken: string | null;
    userEmail: string | null;
    user: AuthUser | null;
    isLoading: boolean;
  }>({
    isAuthenticated: false,
    accessToken: null,
    userEmail: null,
    user: null,
    isLoading: true,
  });

  // Holds the resolver for the promise returned by handleSignIn(), since
  // useGoogleLogin's onSuccess/onError fire asynchronously after login() is called.
  const pendingSignIn = useRef<{
    resolve: (result: SignInResult) => void;
  } | null>(null);

  // Restore a previous session from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const tokenTimestamp = localStorage.getItem(TOKEN_TIMESTAMP_KEY);
      const expiresIn = localStorage.getItem(TOKEN_EXPIRES_IN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      const maxAgeMs = (expiresIn ? parseInt(expiresIn) : 3600) * 1000;
      const isTokenExpired = tokenTimestamp
        ? Date.now() - parseInt(tokenTimestamp) > maxAgeMs
        : true;

      if (storedToken && storedUser && !isTokenExpired) {
        const user: AuthUser = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          accessToken: storedToken,
          userEmail: user.email,
          user,
          isLoading: false,
        });
      } else {
        if (storedToken) {
          console.log('⚠️ OAuth token expired, clearing...');
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TIMESTAMP_KEY);
        localStorage.removeItem(TOKEN_EXPIRES_IN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error restoring auth session:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = useGoogleLogin({
    onSuccess: async tokenResponse => {
      try {
        const accessToken = tokenResponse.access_token;

        const userInfoResponse = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch Google account info');
        }

        const userInfo = await userInfoResponse.json();

        const user: AuthUser = {
          uid: userInfo.sub,
          email: userInfo.email,
          displayName: userInfo.name || userInfo.email,
          photoURL: userInfo.picture || '',
        };

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(
          TOKEN_EXPIRES_IN_KEY,
          String(tokenResponse.expires_in || 3600)
        );
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setAuthState({
          isAuthenticated: true,
          accessToken,
          userEmail: user.email,
          user,
          isLoading: false,
        });

        console.log('✅ Successfully signed in:', user.email);

        pendingSignIn.current?.resolve({
          success: true,
          token: accessToken,
          email: user.email,
        });
      } catch (error) {
        console.error('Sign in error:', error);
        pendingSignIn.current?.resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
        });
      } finally {
        pendingSignIn.current = null;
      }
    },
    onError: errorResponse => {
      console.error('Google sign in error:', errorResponse);
      pendingSignIn.current?.resolve({
        success: false,
        error: errorResponse.error_description || 'Sign in failed',
      });
      pendingSignIn.current = null;
    },
    scope:
      'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
  });

  const handleSignIn = (): Promise<SignInResult> => {
    return new Promise(resolve => {
      pendingSignIn.current = { resolve };
      try {
        login();
      } catch (error) {
        pendingSignIn.current = null;
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
        });
      }
    });
  };

  const handleSignOut = async () => {
    try {
      await clearBrowserCache();

      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        userEmail: null,
        user: null,
        isLoading: false,
      });

      console.log('✅ Successfully signed out and cleared all cache');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      try {
        await clearBrowserCache();
      } catch (cacheError) {
        console.error('❌ Cache clearing error:', cacheError);
      }
    }
  };

  // The implicit OAuth flow used here doesn't support silent token refresh -
  // once the access token expires the user needs to sign in again.
  const refreshToken = async () => {
    return authState.accessToken;
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
