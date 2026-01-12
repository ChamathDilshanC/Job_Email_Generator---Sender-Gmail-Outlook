'use client';

export default function MobileNotSupported() {
  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Indigo Center Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #6366f1, transparent)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <svg
              className="w-20 h-20 text-indigo-600 animate-bounce"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="2" y1="17" x2="22" y2="17" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Desktop Experience Required
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            This application is not optimized for mobile devices.
          </p>

          {/* Suggestion */}
          <p className="text-gray-700 mb-8">
            Please use a <strong className="text-indigo-600">tablet</strong>,{' '}
            <strong className="text-indigo-600">laptop</strong>, or{' '}
            <strong className="text-indigo-600">PC</strong> for the best
            experience.
          </p>

          {/* Device Icons */}
          <div className="flex justify-center gap-8 mb-8">
            {/* Tablet */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Tablet</span>
            </div>

            {/* Laptop */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="2" y1="17" x2="22" y2="17" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Laptop</span>
            </div>

            {/* Desktop */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Desktop</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-500 border-t border-gray-200 pt-6">
            We're working on a mobile version. Thank you for your understanding!
          </p>
        </div>
      </div>
    </div>
  );
}
