'use client';

import { APPLICATION_STATUS_LABELS, EmailHistory } from '@/app/models/EmailHistory';
import { loadEmailBodyHtml } from '@/lib/emailHistoryService';
import {
  formatDeliveryStatusLabel,
  getApplicationStatusClasses,
  getDeliveryStatusClasses,
} from '@/lib/emailHistoryStatus';
import { cleanPreviewText, htmlToPlainText } from '@/lib/emailPreview';
import { motion } from 'framer-motion';
import { Eye, Loader2, Paperclip } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const [bodyHtml, setBodyHtml] = useState('');
  const [isLoadingBody, setIsLoadingBody] = useState(false);
  const [showPlainText, setShowPlainText] = useState(false);

  const emailId = email?.id;
  const userId = email?.userId;
  // Rows saved before we started keeping the HTML body have no `hasBodyHtml`;
  // those fall back to the stored text snippet.
  const hasBodyHtml = Boolean(email?.hasBodyHtml || email?.emailBodyHtml);

  useEffect(() => {
    if (!isOpen || !emailId) return;

    setShowPlainText(false);

    if (email?.emailBodyHtml) {
      setBodyHtml(email.emailBodyHtml);
      return;
    }

    if (!hasBodyHtml) {
      setBodyHtml('');
      return;
    }

    let cancelled = false;
    setIsLoadingBody(true);
    setBodyHtml('');

    loadEmailBodyHtml(userId, emailId)
      .then(html => {
        if (!cancelled) setBodyHtml(html);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingBody(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, emailId, userId, hasBodyHtml]);

  if (!isOpen || !email) return null;

  const attachmentNames = [
    email.attachments?.cv,
    email.attachments?.coverLetter,
  ].filter((name): name is string => Boolean(name && name.trim()));

  const previewText = cleanPreviewText(email.emailPreview || '');

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
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
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
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Recipient</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {email.recipientEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Sent Date</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">
                {formatDate(email.sentDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Template Used</p>
              <p className="text-gray-900 dark:text-gray-100 font-medium">{email.templateName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getDeliveryStatusClasses(
                  email.status
                )}`}
              >
                {formatDeliveryStatusLabel(email.status)}
              </span>
            </div>
            {email.status === 'sent' && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Application Stage
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getApplicationStatusClasses(
                    email.applicationStatus
                  )}`}
                >
                  {email.applicationStatus
                    ? APPLICATION_STATUS_LABELS[email.applicationStatus]
                    : 'Applied'}
                </span>
              </div>
            )}
            {typeof email.openCount === 'number' && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Email Opens
                </p>
                <p className="flex items-center gap-1.5 text-gray-900 dark:text-gray-100 font-medium">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-[#a5b4fc]" />
                  {email.openCount > 0
                    ? `Opened ${email.openCount}x${
                        email.lastOpenedAt
                          ? ` · last ${formatDate(new Date(email.lastOpenedAt))}`
                          : ''
                      }`
                    : 'Not opened yet'}
                </p>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          {email.statusHistory && email.statusHistory.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Status History
              </p>
              <ol className="space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                {[...email.statusHistory]
                  .reverse()
                  .map((entry, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {APPLICATION_STATUS_LABELS[entry.status]}
                      </span>{' '}
                      <span className="text-gray-500 dark:text-gray-400">
                        &mdash; {formatDate(new Date(entry.changedAt))}
                      </span>
                      {entry.note && (
                        <p className="text-gray-500 dark:text-gray-400">
                          {entry.note}
                        </p>
                      )}
                    </li>
                  ))}
              </ol>
            </div>
          )}

          {/* Attachments */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Attachments{' '}
              {attachmentNames.length > 0 && (
                <span className="text-gray-400 dark:text-gray-500">
                  ({attachmentNames.length})
                </span>
              )}
            </p>
            {attachmentNames.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {attachmentNames.map(name => (
                  <span
                    key={name}
                    title={name}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700 dark:bg-[#818cf8]/10 dark:text-[#a5b4fc]"
                  >
                    <Paperclip className="h-4 w-4 shrink-0" />
                    <span className="truncate">{name}</span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                No attachments were sent with this email.
              </p>
            )}
          </div>

          {/* Email Subject */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Subject</p>
            <p className="text-gray-900 dark:text-gray-100 font-medium">{email.emailSubject}</p>
          </div>

          {/* Email Preview */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email Preview
              </p>
              {bodyHtml && (
                <button
                  type="button"
                  onClick={() => setShowPlainText(prev => !prev)}
                  className="text-xs font-medium text-[#3b3be3] hover:underline dark:text-[#a5b4fc]"
                >
                  {showPlainText ? 'Show formatted email' : 'Show plain text'}
                </button>
              )}
            </div>

            {isLoadingBody ? (
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading the email…
              </div>
            ) : bodyHtml && !showPlainText ? (
              // Sandboxed so the stored email markup can never run script or
              // reach back into the app — it's only ever rendered, not trusted.
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700">
                <iframe
                  title="Sent email preview"
                  srcDoc={bodyHtml}
                  sandbox=""
                  className="h-[420px] w-full border-0 bg-white"
                />
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  {(showPlainText ? htmlToPlainText(bodyHtml) : '') ||
                    previewText ||
                    'No preview available for this email.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
