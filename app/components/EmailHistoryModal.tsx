'use client';

import { EmailHistory } from '@/app/models/EmailHistory';
import { motion } from 'framer-motion';

interface EmailHistoryModalProps {
  email: EmailHistory | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EmailHistoryModal({
  email,
  isOpen,
  onClose,
}: EmailHistoryModalProps) {
  if (!isOpen || !email) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#3b3be3] to-[#2f2fb8] text-white p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">{email.companyName}</h2>
              <p className="text-blue-100">{email.position}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Email Details */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Recipient</p>
              <p className="text-gray-900 font-medium">
                {email.recipientEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Sent Date</p>
              <p className="text-gray-900 font-medium">
                {formatDate(email.sentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Template Used</p>
              <p className="text-gray-900 font-medium">{email.templateName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  email.status === 'sent'
                    ? 'bg-green-100 text-green-800'
                    : email.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Attachments</p>
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                    clipRule="evenodd"
                  />
                </svg>
                {email.attachments.cv}
              </span>
              {email.attachments.coverLetter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {email.attachments.coverLetter}
                </span>
              )}
            </div>
          </div>

          {/* Email Subject */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Subject</p>
            <p className="text-gray-900 font-medium">{email.emailSubject}</p>
          </div>

          {/* Email Preview */}
          <div>
            <p className="text-sm text-gray-500 mb-2">Email Preview</p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {email.emailPreview}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
