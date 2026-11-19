'use client';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import {
  cancelScheduledEmail,
  checkGoogleBackgroundSendStatus,
  deleteScheduledEmail,
  listScheduledEmails,
  ScheduledEmail,
} from '@/lib/scheduledEmailService';
import { getCachedData, setCachedData } from '@/lib/pageDataCache';
import { showToast } from '@/lib/toast';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Scheduled() {
  const { user, isAuthenticated, handleSignIn } = useAuth();
  const [scheduled, setScheduled] = useState<ScheduledEmail[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'sent' | 'failed' | 'cancelled' | 'all'
  >('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [hasBackgroundSend, setHasBackgroundSend] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setScheduled([]);
        setIsLoading(false);
        return;
      }

      const cacheKey = `scheduled:${user.uid}`;
      const cached = getCachedData<ScheduledEmail[]>(cacheKey);
      if (cached) {
        setScheduled(cached);
        setIsLoading(false);
      } else {
        setIsLoading(true);
      }

      const [list, backgroundSendOk] = await Promise.all([
        listScheduledEmails(user.uid),
        checkGoogleBackgroundSendStatus(user.uid),
      ]);
      setScheduled(list);
      setCachedData(cacheKey, list);
      setHasBackgroundSend(backgroundSendOk);
      setIsLoading(false);
    };
    load();
  }, [user?.uid]);

  const handleReconnect = async () => {
    const result = await handleSignIn();
    if (result.success && user?.uid) {
      const ok = await checkGoogleBackgroundSendStatus(user.uid);
      setHasBackgroundSend(ok);
      showToast(
        ok ? 'success' : 'warning',
        ok ? 'Background Sending Enabled' : 'Still Not Enabled',
        ok
          ? 'Scheduled emails can now send in the background, even while this browser is closed.'
          : "Google didn't grant offline access this time. Visit myaccount.google.com/permissions, remove access for this app, then reconnect again."
      );
    }
  };

  const handleCancel = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Cancel Scheduled Email?',
      description: 'This email will no longer be sent at its scheduled time.',
      onConfirm: async () => {
        const ok = await cancelScheduledEmail(id);
        if (ok) {
          setScheduled(prev =>
            prev.map(s => (s.id === id ? { ...s, status: 'cancelled' } : s))
          );
        } else {
          showToast('error', 'Error', 'Failed to cancel the scheduled email.');
        }
      },
    });
  };

  const handleDelete = (id: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Scheduled Email?',
      description: 'This removes it from your list permanently.',
      onConfirm: async () => {
        const ok = await deleteScheduledEmail(id);
        if (ok) {
          setScheduled(prev => prev.filter(s => s.id !== id));
        } else {
          showToast('error', 'Error', 'Failed to delete the scheduled email.');
        }
      },
    });
  };

  const statusBadge = (status: ScheduledEmail['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
      case 'sent':
        return 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50';
      case 'failed':
        return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const filteredScheduled =
    statusFilter === 'all'
      ? scheduled
      : scheduled.filter(item => item.status === statusFilter);

  const statusCounts = {
    all: scheduled.length,
    pending: scheduled.filter(item => item.status === 'pending').length,
    sent: scheduled.filter(item => item.status === 'sent').length,
    failed: scheduled.filter(item => item.status === 'failed').length,
    cancelled: scheduled.filter(item => item.status === 'cancelled').length,
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          Scheduled Emails
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in with Google to schedule and manage emails.
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="w-full"
      >
        <motion.div variants={fadeInUp} className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Scheduled Emails
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Emails you've queued to send automatically at a future time.
          </p>
        </motion.div>

        {!hasBackgroundSend && !isLoading && (
          <motion.div
            variants={fadeInUp}
            className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-amber-500 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-5"
          >
            <AlertTriangle className="h-8 w-8 shrink-0 text-amber-500" />
            <div className="min-w-[220px] flex-1">
              <h3 className="mb-1 font-semibold text-amber-700 dark:text-amber-400">
                Background Sending Not Enabled
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Google hasn't granted this app offline access yet, so
                scheduled emails can't send while your browser is closed.
                Reconnect your account to enable it.
              </p>
            </div>
            <button
              onClick={handleReconnect}
              className="btn btn-primary whitespace-nowrap"
            >
              Reconnect Google Account
            </button>
          </motion.div>
        )}

        <motion.div variants={fadeInUp}>
          {!isLoading && scheduled.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {([
                ['pending', 'Pending'],
                ['sent', 'Sent'],
                ['failed', 'Failed'],
                ['cancelled', 'Cancelled'],
                ['all', 'All'],
              ] as const).map(([status, label]) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'border-[#3b3be3] bg-[#3b3be3] text-white dark:border-[#818cf8] dark:bg-[#818cf8]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {label} ({statusCounts[status]})
                </button>
              ))}
            </div>
          )}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-[#3b3be3] dark:border-[#818cf8]" />
            </div>
          ) : filteredScheduled.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-12 text-center">
              <CalendarClock className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-700" />
              <h3 className="mb-2 text-xl font-semibold text-gray-700 dark:text-gray-200">
                {scheduled.length === 0
                  ? 'No scheduled emails yet'
                  : `No ${statusFilter === 'all' ? '' : statusFilter} scheduled emails`}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {scheduled.length === 0
                  ? 'Choose "Schedule for Later" when sending an email to queue it for a future time.'
                  : 'Choose another status filter to view different scheduled emails.'}
              </p>
            </div>
          ) : (
            <motion.div
              variants={staggerContainer(0.06)}
              className="grid grid-cols-1 gap-5"
            >
              {filteredScheduled.map(item => (
                <motion.div
                  key={item.id}
                  variants={fadeInUp}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {item.companyName || 'Untitled'}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadge(item.status)}`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.position} &middot; {item.to}
                    </p>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {new Date(item.scheduledFor).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2" aria-label="Attachment status">
                      {[
                        { label: 'CV', fileName: item.attachmentNames?.cv },
                        {
                          label: 'Cover letter',
                          fileName: item.attachmentNames?.coverLetter,
                        },
                      ].map(attachment => {
                        const attached = Boolean(attachment.fileName);
                        return (
                          <span
                            key={attachment.label}
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${
                              attached
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                                : 'border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400'
                            }`}
                            title={
                              attached
                                ? attachment.fileName
                                : `${attachment.label} not attached`
                            }
                          >
                            {attached ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {attachment.label}: {attached ? 'Attached' : 'Not attached'}
                          </span>
                        );
                      })}
                    </div>
                    {item.status === 'failed' && item.error && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        {item.error === 'auth_expired'
                          ? 'Google access expired — reconnect your account above and re-schedule.'
                          : item.error}
                      </p>
                    )}
                    {item.status === 'sent' && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(item.id)}
                        className="rounded-lg border border-amber-300 dark:border-amber-800/60 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/30"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg border border-red-300 dark:border-red-800/60 p-2 text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={open => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        type="warning"
      />
    </>
  );
}
