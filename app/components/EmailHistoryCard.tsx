'use client';

import { EmailHistory } from '@/app/models/EmailHistory';
import { fadeInUp } from '@/lib/motion';
import { motion } from 'framer-motion';

interface EmailHistoryCardProps {
  email: EmailHistory;
  onDelete: (id: string) => void;
  onViewDetails: (email: EmailHistory) => void;
}

export default function EmailHistoryCard({
  email,
  onDelete,
  onViewDetails,
}: EmailHistoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
      case 'failed':
        return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-black/40"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {email.companyName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">{email.position}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
            email.status
          )}`}
        >
          {email.status.charAt(0).toUpperCase() + email.status.slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <span className="truncate">{email.recipientEmail}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDate(email.sentDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Template: {email.templateName}</span>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 mb-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
          {email.emailPreview}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(email)}
          className="flex-1 px-4 py-2 bg-[#3b3be3] text-white rounded-lg text-sm font-medium hover:bg-[#2f2fb8] transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => onDelete(email.id)}
          className="px-4 py-2 border border-red-300 dark:border-red-800/60 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
