'use client';

import { useEffect, useState } from 'react';

export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check user agent for mobile devices (only once on mount)
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android',
      'webos',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
    ];

    const isMobileUA = mobileKeywords.some(keyword =>
      userAgent.includes(keyword)
    );

    // Create media query for screen width
    const mediaQuery = window.matchMedia('(max-width: 767px)');

    const checkMobile = () => {
      // Check screen width (mobile devices typically < 768px)
      const isMobileWidth = mediaQuery.matches;

      // Consider it mobile if either condition is true
      setIsMobile(isMobileUA || isMobileWidth);
    };

    // Check on mount
    checkMobile();

    // Add matchMedia listener for efficient media query detection
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsMobile(isMobileUA || e.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleMediaChange);
    }

    // Add resize listener as additional fallback
    window.addEventListener('resize', checkMobile);

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
