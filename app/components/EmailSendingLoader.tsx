'use client';

import styles from './EmailSendingLoader.module.css';

interface EmailSendingLoaderProps {
  message?: string;
}

export default function EmailSendingLoader({
  message = 'Sending your email...',
}: EmailSendingLoaderProps) {
  return (
    <div className={styles['email-loader-overlay']}>
      <div className={styles['email-loader-container']}>
        {/* Animated Wave Loader */}
        <div className={styles.loading}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Animated Message */}
        <h3 className={styles['loader-message']}>{message}</h3>

        {/* Subtle subtext with typing animation */}
        <p className={styles['loader-subtext']}>
          Please wait while we deliver your message
          <span className={styles['typing-dots']}>
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>
    </div>
  );
}
