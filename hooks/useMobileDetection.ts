'use client';

import { useEffect, useState } from 'react';

export function useMobileDetection(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Check user agent for mobile devices
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

      // Check screen width (mobile devices typically < 768px)
      const isMobileWidth = window.matchMedia('(max-width: 767px)').matches;

      // Consider it mobile if either condition is true
      setIsMobile(isMobileUA || isMobileWidth);
    };

    // Check on mount
    checkMobile();

    // Add resize listener to handle window resizing
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return isMobile;
}
