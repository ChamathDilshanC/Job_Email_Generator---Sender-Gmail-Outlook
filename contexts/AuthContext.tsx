'use client';

import { clearBrowserCache } from '@/lib/clearCache';
import { showToast } from '@/lib/toast';
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
const ACCESS_TOKEN_TIMESTAMP_KEY = 'google_oauth_access_token_timestamp';
const USER_KEY = 'google_oauth_user';
// Keep the signed-in browser session for 48 hours. Google access tokens are
// usually shorter-lived, so this controls session persistence rather than
// extending Google's token validity.
const SESSION_MAX_AGE_MS = 48 * 60 * 60 * 1000;

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
      const storedUser = localStorage.getItem(USER_KEY);

      const isTokenExpired = tokenTimestamp
        ? Date.now() - parseInt(tokenTimestamp) > SESSION_MAX_AGE_MS
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
        localStorage.removeItem(ACCESS_TOKEN_TIMESTAMP_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Error restoring auth session:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Listen for window regain-focus to resolve pending sign-in promise if popup was closed/cancelled
  useEffect(() => {
    const handleWindowFocus = () => {
      if (pendingSignIn.current) {
        setTimeout(() => {
          if (pendingSignIn.current) {
            console.log('Window regained focus: resolving pending sign-in as cancelled.');
            pendingSignIn.current.resolve({
              success: false,
              error: 'Sign in was cancelled.',
            });
            pendingSignIn.current = null;
          }
        }, 600);
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  // Auth-code flow (rather than the simpler implicit flow) so the server can
  // exchange the code for a refresh token and store it for background
  // sending (scheduled emails). Note: @react-oauth/google's code-client
  // config has no `prompt` override and ignores `redirect_uri` in popup
  // mode — Google only guarantees a refresh_token on a user's first-ever
  // consent for this client+scope combination; see storeRefreshTokenIfPresent
  // in lib/googleAuth.ts for how a missing one on later logins is handled.
  const login = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async codeResponse => {
      showToast(
        'info',
        'Logging in...',
        'Please wait a moment while we load your dashboard.'
      );
      try {
        const exchangeResponse = await fetch('/api/auth/google/exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: codeResponse.code }),
        });

        if (!exchangeResponse.ok) {
          const errorData = await exchangeResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to complete Google sign-in');
        }

        const { accessToken, expiresIn, user } = await exchangeResponse.json();
        const authUser: AuthUser = user;

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_TIMESTAMP_KEY, Date.now().toString());
        localStorage.setItem(ACCESS_TOKEN_TIMESTAMP_KEY, Date.now().toString());
        // Persist the browser session for 48 hours. Keep the provider's
        // expiry separately for consumers that need the original value.
        localStorage.setItem(
          TOKEN_EXPIRES_IN_KEY,
          String(expiresIn || 3600)
        );
        localStorage.setItem(USER_KEY, JSON.stringify(authUser));

        setAuthState({
          isAuthenticated: true,
          accessToken,
          userEmail: authUser.email,
          user: authUser,
          isLoading: false,
        });

        console.log('✅ Successfully signed in:', authUser.email);

        pendingSignIn.current?.resolve({
          success: true,
          token: accessToken,
          email: authUser.email,
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
    onNonOAuthError: nonOAuthError => {
      console.warn('Google sign in non-OAuth error:', nonOAuthError);
      pendingSignIn.current?.resolve({
        success: false,
        error:
          nonOAuthError.type === 'popup_closed'
            ? 'Sign in was cancelled.'
            : 'Sign in cancelled or failed.',
      });
      pendingSignIn.current = null;
    },
    scope:
      'https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email',
    select_account: true,
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

  const refreshToken = async () => {
    const userId = authState.user?.uid;
    if (!userId) return null;

    try {
      const response = await fetch('/api/auth/google/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) return null;

      const { accessToken, expiresIn } = await response.json();
      if (!accessToken) return null;

      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(
        ACCESS_TOKEN_TIMESTAMP_KEY,
        Date.now().toString()
      );
      localStorage.setItem(TOKEN_EXPIRES_IN_KEY, String(expiresIn || 3600));
      setAuthState(previous => ({ ...previous, accessToken }));
      return accessToken;
    } catch (error) {
      console.error('Google access token refresh failed:', error);
      return null;
    }
  };

  // Refresh the short-lived Google access token while preserving the
  // original 48-hour browser session window.
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.user) return;

    const refreshIfNeeded = () => {
      const issuedAt = Number(
        localStorage.getItem(ACCESS_TOKEN_TIMESTAMP_KEY) || 0
      );
      const expiresIn = Number(
        localStorage.getItem(TOKEN_EXPIRES_IN_KEY) || 3600
      );
      if (Date.now() - issuedAt >= Math.max(60, expiresIn - 300) * 1000) {
        void refreshToken();
      }
    };

    refreshIfNeeded();
    const interval = window.setInterval(refreshIfNeeded, 60_000);
    window.addEventListener('focus', refreshIfNeeded);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshIfNeeded);
    };
  }, [authState.isAuthenticated, authState.user]);

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
