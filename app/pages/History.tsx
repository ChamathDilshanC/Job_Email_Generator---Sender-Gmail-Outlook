'use client';

import EmailHistoryCard from '@/app/components/EmailHistoryCard';
import EmailHistoryModal from '@/app/components/EmailHistoryModal';
import { ApplicationStatus, EmailHistory } from '@/app/models/EmailHistory';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteEmailsFromHistory,
  deleteEmailFromHistory,
  loadEmailHistory,
  updateApplicationStatus,
} from '@/lib/emailHistoryService';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { getCachedData, setCachedData } from '@/lib/pageDataCache';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  Search,
  ThumbsDown,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

// How often to silently re-check for open-tracking updates (recipient
// opened the email) while this page is visible. Not a hard real-time push
// (no websocket/SSE infra here) -- polling is the simplest thing that
// actually works within Vercel's serverless model, and 15s is frequent
// enough to feel live without hammering the API/DB.
const LIVE_REFRESH_INTERVAL_MS = 15000;

export default function History() {
  const { user } = useAuth();
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'opened' | 'not_opened' | 'sent' | 'pending' | 'failed' | 'all'
  >('opened');
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    description: '',
    type: 'warning',
    onConfirm: () => {},
  });

  // Load email history on mount
  useEffect(() => {
    if (!user?.uid) {
      setEmailHistory([]);
      setIsLoading(false);
      return;
    }
    const cacheKey = `history:${user.uid}`;

    const fetchHistory = async () => {
      const cached = getCachedData<EmailHistory[]>(cacheKey);
      if (cached) {
        // Show what we already have instantly, then quietly refresh.
        setEmailHistory(cached);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      try {
        const history = await loadEmailHistory(user.uid);
        setEmailHistory(history);
        setCachedData(cacheKey, history);
        setLastSyncedAt(new Date());
      } catch (error) {
        console.error('Error loading email history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.uid]);

  // Silently re-check for open-tracking updates while the page is visible,
  // so an "Opened" badge can flip on without the user refreshing. Skips a
  // tick if the tab isn't visible or a previous check is still in flight.
  const isSyncingRef = useRef(false);
  useEffect(() => {
    if (!user?.uid) return;
    const cacheKey = `history:${user.uid}`;

    const intervalId = setInterval(async () => {
      if (isSyncingRef.current || document.visibilityState !== 'visible') {
        return;
      }
      isSyncingRef.current = true;
      try {
        const history = await loadEmailHistory(user.uid);
        setEmailHistory(history);
        setCachedData(cacheKey, history);
        setLastSyncedAt(new Date());
      } catch (error) {
        console.error('Error refreshing email history:', error);
      } finally {
        isSyncingRef.current = false;
      }
    }, LIVE_REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [user?.uid]);

  const isOpened = (email: EmailHistory) =>
    Boolean(email.firstOpenedAt || email.lastOpenedAt || (email.openCount || 0) > 0);

  // Opened is the default view. Status and text filters combine rather than
  // replacing each other so users can narrow the selected folder quickly.
  const filteredEmails = emailHistory.filter(email => {
    const matchesSearch =
      email.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'opened' && isOpened(email)) ||
      (statusFilter === 'not_opened' && !isOpened(email)) ||
      email.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const allVisibleSelected =
    filteredEmails.length > 0 &&
    filteredEmails.every(email => selectedEmailIds.has(email.id));

  const toggleEmailSelection = (emailId: string) => {
    setSelectedEmailIds(previous => {
      const next = new Set(previous);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    setSelectedEmailIds(previous => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        filteredEmails.forEach(email => next.delete(email.id));
      } else {
        filteredEmails.forEach(email => next.add(email.id));
      }
      return next;
    });
  };

  // Calculate stats
  const totalSent = emailHistory.filter(e => e.status === 'sent').length;
  const totalPending = emailHistory.filter(e => e.status === 'pending').length;
  const totalFailed = emailHistory.filter(e => e.status === 'failed').length;
  const uniqueCompanies = new Set(emailHistory.map(e => e.companyName)).size;

  const handleStatusChange = async (
    emailId: string,
    newStatus: ApplicationStatus
  ) => {
    const previous = emailHistory;
    setEmailHistory(prev =>
      prev.map(email =>
        email.id === emailId
          ? { ...email, applicationStatus: newStatus }
          : email
      )
    );

    const success = await updateApplicationStatus(emailId, newStatus);
    if (!success) {
      setEmailHistory(previous);
      showToast(
        'error',
        'Error',
        'Failed to update application status. Please try again.'
      );
    }
  };

  const handleDelete = (emailId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Email',
      description:
        'Are you sure you want to delete this email from your history? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const success = await deleteEmailFromHistory(user?.uid, emailId);
          if (success) {
            const nextHistory = emailHistory.filter(email => email.id !== emailId);
            setEmailHistory(nextHistory);
            if (user?.uid) setCachedData(`history:${user.uid}`, nextHistory);
            setSelectedEmailIds(previous => {
              const next = new Set(previous);
              next.delete(emailId);
              return next;
            });
            showToast(
              'success',
              'Email Deleted',
              'The email has been successfully deleted from your history.'
            );
          } else {
            showToast('error', 'Error', 'Failed to delete email. Please try again.');
          }
        } catch (error) {
          console.error('Error deleting email:', error);
          showToast('error', 'Error', 'An error occurred while deleting the email.');
        }
      },
    });
  };

  const requestBulkDelete = () => {
    if (selectedEmailIds.size === 0) return;

    setConfirmDialog({
      open: true,
      title: `Delete ${selectedEmailIds.size} Emails`,
      description:
        'Are you sure you want to delete the selected emails from your history? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        const idsToDelete = Array.from(selectedEmailIds);
        const deletedCount = await deleteEmailsFromHistory(user?.uid, idsToDelete);

        if (deletedCount > 0) {
          const deletedIds = new Set(idsToDelete);
          const nextHistory = emailHistory.filter(email => !deletedIds.has(email.id));
          setEmailHistory(nextHistory);
          if (user?.uid) setCachedData(`history:${user.uid}`, nextHistory);
          setSelectedEmailIds(previous => {
            const next = new Set(previous);
            idsToDelete.forEach(id => next.delete(id));
            return next;
          });
          showToast(
            'success',
            'Emails Deleted',
            `${deletedCount} email${deletedCount === 1 ? '' : 's'} deleted from your history.`
          );
        } else {
          showToast('error', 'Error', 'Failed to delete the selected emails. Please try again.');
        }
      },
    });
  };

  const handleViewDetails = (email: EmailHistory) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
  };

  const stats = [
    {
      label: 'Total Sent',
      value: totalSent,
      icon: CheckCircle2,
      iconClass: 'text-green-500',
      bgClass: 'bg-green-50 dark:bg-green-500/10',
    },
    {
      label: 'Pending',
      value: totalPending,
      icon: Clock,
      iconClass: 'text-amber-500',
      bgClass: 'bg-yellow-50 dark:bg-yellow-500/10',
    },
    {
      label: 'Failed',
      value: totalFailed,
      icon: XCircle,
      iconClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-500/10',
    },
    {
      label: 'Companies',
      value: uniqueCompanies,
      icon: Building2,
      iconClass: 'text-purple-500',
      bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  // Application pipeline stats (mini-CRM view) — only meaningful for
  // successfully sent emails, since pending/failed rows have no
  // applicationStatus set.
  const pipelineStats = [
    {
      label: 'Interview Scheduled',
      value: emailHistory.filter(
        e => e.applicationStatus === 'interview_scheduled'
      ).length,
      icon: CalendarClock,
      iconClass: 'text-purple-500',
      bgClass: 'bg-purple-50 dark:bg-purple-500/10',
    },
    {
      label: 'Offered',
      value: emailHistory.filter(e => e.applicationStatus === 'offered')
        .length,
      icon: ThumbsUp,
      iconClass: 'text-green-500',
      bgClass: 'bg-green-50 dark:bg-green-500/10',
    },
    {
      label: 'Rejected',
      value: emailHistory.filter(e => e.applicationStatus === 'rejected')
        .length,
      icon: ThumbsDown,
      iconClass: 'text-red-500',
      bgClass: 'bg-red-50 dark:bg-red-500/10',
    },
  ];

  const statusCounts = {
    opened: emailHistory.filter(isOpened).length,
    not_opened: emailHistory.filter(email => !isOpened(email)).length,
    sent: emailHistory.filter(email => email.status === 'sent').length,
    pending: emailHistory.filter(email => email.status === 'pending').length,
    failed: emailHistory.filter(email => email.status === 'failed').length,
    all: emailHistory.length,
  };

  return (
    <>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          className="mb-8 flex flex-wrap items-end justify-between gap-3"
        >
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Email History
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your sent job application emails
            </p>
          </div>
          {user?.uid && (
            <div
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
              title="Open status refreshes automatically every 15 seconds while this page is open"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              Live
              {lastSyncedAt && (
                <span className="hidden sm:inline">
                  &middot; synced {lastSyncedAt.toLocaleTimeString()}
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={staggerContainer(0.06)}
          className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map(stat => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              whileHover={{ y: -3 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex items-center gap-4 border-b border-gray-200 py-4 dark:border-gray-800"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bgClass}`}
              >
                <stat.icon className={`h-6 w-6 ${stat.iconClass}`} />
              </div>
              <div className="flex-1">
                <div className="mb-1 text-3xl font-semibold leading-none text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Application Pipeline Stats */}
        {totalSent > 0 && (
          <motion.div
            variants={staggerContainer(0.06)}
            className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3"
          >
            {pipelineStats.map(stat => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                className="flex items-center gap-4 border-b border-gray-200 py-4 dark:border-gray-800"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bgClass}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.iconClass}`} />
                </div>
                <div className="flex-1">
                  <div className="mb-0.5 text-2xl font-semibold leading-none text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Search Bar */}
        <motion.div variants={fadeInUp} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company, position, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 py-3 pl-12 pr-4 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="mb-6 flex flex-wrap gap-2">
          {([
            ['opened', 'Opened'],
            ['not_opened', 'Not Opened'],
            ['sent', 'Sent'],
            ['pending', 'Pending'],
            ['failed', 'Failed'],
            ['all', 'All'],
          ] as const).map(([status, label]) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'
              }`}
            >
              {label} ({statusCounts[status]})
            </button>
          ))}
        </motion.div>

        {filteredEmails.length > 0 && (
          <motion.div
            variants={fadeInUp}
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAllVisible}
                aria-label="Select all visible emails"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              />
              Select all visible
            </label>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedEmailIds.size} selected
              </span>
              <button
                type="button"
                onClick={requestBulkDelete}
                disabled={selectedEmailIds.size === 0}
                className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-800/60 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                Delete selected
              </button>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <motion.div variants={fadeInUp}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#3b3be3] dark:border-[#818cf8]" />
                <p className="text-gray-600 dark:text-gray-400">
                  Loading your email history...
                </p>
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <svg
                className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-700"
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
              <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                {searchQuery ? 'No emails found' : 'No email history yet'}
              </h3>
              <p className="mb-6 text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Your sent job application emails will appear here'}
              </p>
              {!searchQuery && (
                <a
                  href="/send-email"
                  className="inline-block rounded-full bg-[#3b3be3] px-6 py-3 font-medium text-white transition-colors hover:bg-[#2f2fb8]"
                >
                  Send Your First Email
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredEmails.length} of {emailHistory.length} emails
              </div>
              <motion.div
                variants={staggerContainer(0.06)}
                className="grid grid-cols-1 gap-5"
              >
                {filteredEmails.map(email => (
                  <EmailHistoryCard
                    key={email.id}
                    email={email}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                    onStatusChange={handleStatusChange}
                    selected={selectedEmailIds.has(email.id)}
                    onSelect={toggleEmailSelection}
                  />
                ))}
              </motion.div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Modal */}
      <EmailHistoryModal
        email={selectedEmail}
        isOpen={showModal}
        onClose={closeModal}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
