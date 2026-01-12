import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Check if we're in the browser and have valid config
const isValidConfig = typeof window !== 'undefined' && firebaseConfig.apiKey;

// Initialize Firebase (only once and only in browser)
const app =
  isValidConfig && getApps().length === 0
    ? initializeApp(firebaseConfig)
    : isValidConfig
    ? getApp()
    : null;

// Initialize Firebase Authentication (only if app is initialized)
export const auth = app ? getAuth(app) : null;

// Configure Google Auth Provider with Gmail scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');

// Request offline access to get refresh token
googleProvider.setCustomParameters({
  access_type: 'offline',
  prompt: 'consent',
});

// Initialize App Check (only in browser and if app is initialized)
let appCheck = null;
if (app && typeof window !== 'undefined') {
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (recaptchaSiteKey) {
    try {
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('✅ App Check initialized successfully');
    } catch (error) {
      console.error('❌ App Check initialization failed:', error);
    }
  } else {
    console.warn(
      '⚠️ NEXT_PUBLIC_RECAPTCHA_SITE_KEY not found in environment variables'
    );
  }
}

export { appCheck };
export default app;
