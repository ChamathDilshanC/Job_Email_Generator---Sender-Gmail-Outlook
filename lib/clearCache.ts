/**
 * Comprehensive cache clearing utility
 * Clears all browser storage when user is not authenticated
 */

export async function clearBrowserCache() {
  try {
    console.log('🧹 Starting comprehensive cache clearing...');

    // 1. Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.clear();
      console.log('✅ LocalStorage cleared');
    }

    // 2. Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.clear();
      console.log('✅ SessionStorage cleared');
    }

    // 3. Clear IndexedDB databases
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
            console.log(`✅ IndexedDB cleared: ${db.name}`);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not clear IndexedDB:', error);
      }
    }

    // 4. Clear Cache Storage (Service Workers cache)
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('✅ Cache Storage cleared');
      } catch (error) {
        console.warn('⚠️ Could not clear Cache Storage:', error);
      }
    }

    // 5. Clear cookies (domain-specific)
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const eqPos = cookie.indexOf('=');
        const name =
          eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
        // Set cookie to expire in the past
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      }
      console.log('✅ Cookies cleared');
    }

    console.log('✨ Browser cache clearing completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing browser cache:', error);
    return false;
  }
}

/**
 * Clear only authentication-related data
 */
export function clearAuthData() {
  try {
    console.log('🔐 Clearing authentication data...');

    // Clear Google OAuth tokens
    localStorage.removeItem('google_oauth_token');
    localStorage.removeItem('google_oauth_token_timestamp');

    // Clear Gmail tokens (if using @react-oauth/google)
    localStorage.removeItem('gmail_access_token');
    localStorage.removeItem('gmail_user_email');

    // Clear any Firebase-related tokens
    localStorage.removeItem('firebase:authUser');

    console.log('✅ Authentication data cleared');
    return true;
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
    return false;
  }
}
