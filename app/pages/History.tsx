'use client';

import EmailHistoryCard from '@/app/components/EmailHistoryCard';
import EmailHistoryModal from '@/app/components/EmailHistoryModal';
import { EmailHistory } from '@/app/models/EmailHistory';
import {
  deleteEmailFromHistory,
  loadEmailHistory,
} from '@/lib/emailHistoryService';
import { useEffect, useState } from 'react';

export default function History() {
  const [emailHistory, setEmailHistory] = useState<EmailHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailHistory | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load email history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const history = await loadEmailHistory();
        setEmailHistory(history);
      } catch (error) {
        console.error('Error loading email history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

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

  const handleDelete = async (emailId: string) => {
    if (
      confirm('Are you sure you want to delete this email from your history?')
    ) {
      const success = await deleteEmailFromHistory(emailId);
      if (success) {
        setEmailHistory(prev => prev.filter(email => email.id !== emailId));
      }
    }
  };

  const handleViewDetails = (email: EmailHistory) => {
    setSelectedEmail(email);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmail(null);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#3b3be3] to-[#3b3be3] bg-clip-text text-transparent">
            Email History
          </h1>
          <p className="text-gray-600">
            View and manage your sent job application emails
          </p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold leading-none mb-1">
                {totalSent}
              </div>
              <div className="text-sm text-gray-500">Total Sent</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold leading-none mb-1">
                {totalPending}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold leading-none mb-1">
                {totalFailed}
              </div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
            <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#8b5cf6"
                strokeWidth="2"
                className="w-6 h-6"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-3xl font-bold leading-none mb-1">
                {uniqueCompanies}
              </div>
              <div className="text-sm text-gray-500">Companies</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-7xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by company, position, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3b3be3] focus:border-transparent transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b3be3] mb-4"></div>
                <p className="text-gray-600">Loading your email history...</p>
              </div>
            </div>
          ) : filteredEmails.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
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
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchQuery ? 'No emails found' : 'No email history yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Your sent job application emails will appear here'}
              </p>
              {!searchQuery && (
                <a
                  href="/send-email"
                  className="inline-block px-6 py-3 bg-[#3b3be3] text-white rounded-lg font-medium hover:bg-[#2f2fb8] transition-colors"
                >
                  Send Your First Email
                </a>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredEmails.length} of {emailHistory.length} emails
              </div>
              <div className="grid grid-cols-1 gap-6">
                {filteredEmails.map(email => (
                  <EmailHistoryCard
                    key={email.id}
                    email={email}
                    onDelete={handleDelete}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <EmailHistoryModal
        email={selectedEmail}
        isOpen={showModal}
        onClose={closeModal}
      />
    </>
  );
}
