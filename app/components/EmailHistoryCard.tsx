'use client';

import {
  APPLICATION_STATUS_LABELS,
  ApplicationStatus,
  EmailHistory,
} from '@/app/models/EmailHistory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatDeliveryStatusLabel,
  getApplicationStatusClasses,
  getDeliveryStatusClasses,
} from '@/lib/emailHistoryStatus';
import { fadeInUp } from '@/lib/motion';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  Eye,
  FileText,
  Mail,
  Trash2,
  ArrowUpRight,
} from 'lucide-react';

interface EmailHistoryCardProps {
  email: EmailHistory;
  onDelete: (id: string) => void;
  onViewDetails: (email: EmailHistory) => void;
  onStatusChange?: (id: string, status: ApplicationStatus) => void;
}

// Deterministic, pleasant avatar color per company name — same company
// always gets the same color, purely cosmetic (no data encoded in it).
const AVATAR_PALETTE = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
];

function avatarClasses(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

const DELIVERY_ACCENT: Record<string, string> = {
  sent: 'before:bg-green-400 dark:before:bg-green-500',
  pending: 'before:bg-yellow-400 dark:before:bg-yellow-500',
  failed: 'before:bg-red-400 dark:before:bg-red-500',
};

export default function EmailHistoryCard({
  email,
  onDelete,
  onViewDetails,
  onStatusChange,
}: EmailHistoryCardProps) {
  const getStatusColor = getDeliveryStatusClasses;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const initial = (email.companyName || '?').trim().charAt(0).toUpperCase();

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-black/40 before:absolute before:inset-y-0 before:left-0 before:w-1 before:content-[''] ${
        DELIVERY_ACCENT[email.status] || 'before:bg-gray-300 dark:before:bg-gray-700'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-semibold ${avatarClasses(
              email.companyName || ''
            )}`}
          >
            {initial}
          </div>
          <div className="min-w-0 pt-0.5">
            <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
              {email.companyName}
            </h3>
            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
              {email.position}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(
            email.status
          )}`}
        >
          {formatDeliveryStatusLabel(email.status)}
        </span>
      </div>

      {email.status === 'sent' && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {onStatusChange ? (
            <Select
              value={email.applicationStatus || 'applied'}
              onValueChange={value =>
                onStatusChange(email.id, value as ApplicationStatus)
              }
            >
              <SelectTrigger
                className={`h-7 w-auto gap-1.5 rounded-full border px-2.5 text-xs font-semibold shadow-none ${getApplicationStatusClasses(
                  email.applicationStatus
                )}`}
              >
                <SelectValue placeholder="Update stage" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(APPLICATION_STATUS_LABELS) as ApplicationStatus[]
                ).map(status => (
                  <SelectItem key={status} value={status}>
                    {APPLICATION_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <span
              className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getApplicationStatusClasses(
                email.applicationStatus
              )}`}
            >
              {email.applicationStatus
                ? APPLICATION_STATUS_LABELS[email.applicationStatus]
                : 'Applied'}
            </span>
          )}
          {typeof email.openCount === 'number' && email.openCount > 0 && (
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 dark:bg-[#818cf8]/10 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-[#a5b4fc]"
              title={
                email.lastOpenedAt
                  ? `Last opened ${formatDate(new Date(email.lastOpenedAt))}`
                  : undefined
              }
            >
              <Eye className="h-3 w-3" /> Opened
            </span>
          )}
        </div>
      )}

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          <span className="truncate">{email.recipientEmail}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <CalendarClock className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          <span>{formatDate(email.sentDate)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <FileText className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500" />
          <span className="truncate">Template: {email.templateName}</span>
        </div>
      </div>

      <div className="mb-4 rounded-lg border-l-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 py-2 pl-3 pr-3">
        <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">
          {email.emailPreview}
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(email)}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#3b3be3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2f2fb8]"
        >
          View Details
          <ArrowUpRight className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete(email.id)}
          title="Delete"
          className="rounded-lg border border-red-300 p-2 text-red-600 transition-colors hover:bg-red-50 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
