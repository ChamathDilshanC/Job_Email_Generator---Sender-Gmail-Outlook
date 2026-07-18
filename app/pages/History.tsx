'use client';

import EmailHistoryCard from '@/app/components/EmailHistoryCard';
import EmailHistoryModal from '@/app/components/EmailHistoryModal';
import { EmailHistory } from '@/app/models/EmailHistory';
import { AlertDialog } from '@/components/alert-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteEmailFromHistory,
  loadEmailHistory,
} from '@/lib/emailHistoryService';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Clock, Search, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function History() {
  const { user } = useAuth();
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, title: '', description: '', type: 'info' });
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
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const history = await loadEmailHistory(user?.uid);
        setEmailHistory(history);
      } catch (error) {
        console.error('Error loading email history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user?.uid]);

  // Filter emails based on search query
  const filteredEmails = emailHistory.filter(
    email =>
      email.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.recipientEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate stats
  const totalSent = emailHistory.filter(e => e.status === 'sent').length;
  const totalPending = emailHistory.filter(e => e.status === 'pending').length;
  const totalFailed = emailHistory.filter(e => e.status === 'failed').length;
  const uniqueCompanies = new Set(emailHistory.map(e => e.companyName)).size;

  const handleDelete = (emailId: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete Email',
      description:
        'Are you sure you want to delete this email from your history? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          const success = await deleteEmailFromHistory(emailId);
          if (success) {
            setEmailHistory(prev => prev.filter(email => email.id !== emailId));
            setAlertDialog({
              open: true,
              title: 'Email Deleted',
              description:
                'The email has been successfully deleted from your history.',
              type: 'success',
            });
          } else {
            setAlertDialog({
              open: true,
              title: 'Error',
              description: 'Failed to delete email. Please try again.',
              type: 'error',
            });
          }
        } catch (error) {
          console.error('Error deleting email:', error);
          setAlertDialog({
            open: true,
            title: 'Error',
            description: 'An error occurred while deleting the email.',
            type: 'error',
          });
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

  return (
    <>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Email History
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage your sent job application emails
          </p>
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
              className="flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-lg dark:hover:shadow-black/40"
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

        {/* Search Bar */}
        <motion.div variants={fadeInUp} className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company, position, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 py-3 pl-12 pr-4 transition-all focus:border-transparent focus:ring-2 focus:ring-[#3b3be3] dark:focus:ring-[#818cf8]"
            />
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </motion.div>

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

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={open => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
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
