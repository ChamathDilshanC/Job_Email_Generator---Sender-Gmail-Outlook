'use client';

interface EmailSendingLoaderProps {
  message?: string;
}

export default function EmailSendingLoader({
  message = 'Sending your email...',
}: EmailSendingLoaderProps) {
  return (
    <div className="email-loader-overlay">
      <div className="email-loader-container">
        {/* Animated Wave Loader */}
        <div className="loading">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Animated Message */}
        <h3 className="loader-message">{message}</h3>

        {/* Subtle subtext with typing animation */}
        <p className="loader-subtext">
          Please wait while we deliver your message
          <span className="typing-dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
      </div>

      <style jsx>{`
        .email-loader-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          animation: fadeIn 0.3s ease-in-out;
        }

        .email-loader-container {
          background: white;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 3rem 2rem;
          max-width: 28rem;
          width: 90%;
          margin: 0 1rem;
          animation: scaleIn 0.3s ease-in-out;
        }

        /* Wave Loading Animation */
        .loading {
          --speed-of-animation: 0.9s;
          --gap: 6px;
          --first-color: #4c86f9;
          --second-color: #49a84c;
          --third-color: #f6bb02;
          --fourth-color: #ff6b6b;
          --fifth-color: #2196f3;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100px;
          gap: var(--gap);
          height: 100px;
          margin: 0 auto 2rem;
        }

        .loading span {
          width: 8px;
          height: 50px;
          background: var(--first-color);
          border-radius: 4px;
          animation: scale var(--speed-of-animation) ease-in-out infinite;
        }

        .loading span:nth-child(2) {
          background: var(--second-color);
          animation-delay: -0.8s;
        }

        .loading span:nth-child(3) {
          background: var(--third-color);
          animation-delay: -0.7s;
        }

        .loading span:nth-child(4) {
          background: var(--fourth-color);
          animation-delay: -0.6s;
        }

        .loading span:nth-child(5) {
          background: var(--fifth-color);
          animation-delay: -0.5s;
        }

        @keyframes scale {
          0%,
          40%,
          100% {
            transform: scaleY(0.05);
          }

          20% {
            transform: scaleY(1);
          }
        }

        /* Message Styling */
        .loader-message {
          font-size: 1.25rem;
          font-weight: 700;
          text-align: center;
          color: #1f2937;
          margin-bottom: 0.5rem;
          animation: slideUp 0.5s ease-out 0.2s both;
        }

        .loader-subtext {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          animation: slideUp 0.5s ease-out 0.4s both;
        }

        /* Typing Dots Animation */
        .typing-dots {
          display: inline-block;
          margin-left: 2px;
        }

        .typing-dots span {
          animation: typingDots 1.4s infinite;
          opacity: 0;
        }

        .typing-dots span:nth-child(1) {
          animation-delay: 0s;
        }

        .typing-dots span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dots span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingDots {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

        /* Overlay and Container Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
