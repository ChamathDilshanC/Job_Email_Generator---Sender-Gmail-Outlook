'use client';

import { AlertDialog } from '@/components/alert-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteEmailFromHistory,
  loadEmailHistory,
} from '@/lib/emailHistoryService';
import { loadResumeData } from '@/lib/resumeDataService';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { user, isAuthenticated, handleSignOut } = useAuth();
  const [emailStats, setEmailStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchStats = async () => {
      if (isAuthenticated) {
        try {
          const history = await loadEmailHistory();
          setEmailStats({
            total: history.length,
            sent: history.filter(e => e.status === 'sent').length,
            pending: history.filter(e => e.status === 'pending').length,
          });
        } catch (error) {
          console.error('Error loading email stats:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, [isAuthenticated]);

  // Get user info from Google account
  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const photoURL = user?.photoURL || '';

  return (
    <>
      <div className="p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-[#3b3be3] to-[#3b3be3] bg-clip-text text-transparent">
            Profile
          </h1>
          <p className="text-gray-500">
            Manage your personal information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          {/* Sidebar */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      // Fallback to default avatar if image fails to load
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3b3be3] to-[#2f2fb8] flex items-center justify-center"
                  style={{ display: photoURL ? 'none' : 'flex' }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    className="w-16 h-16"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold mb-1">{displayName}</h2>
              <p className="text-sm text-gray-500 mb-2">{email}</p>
              {user ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium mb-6">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Connected with Google
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium mb-6">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Not connected
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#3b3be3]">
                    {isLoading ? '...' : emailStats.sent}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Emails Sent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#3b3be3]">
                    {isLoading ? '...' : emailStats.total}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Total Emails</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-6">
                Account Information
              </h2>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      disabled
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Synced from your Google account
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500">
                      Synced from your Google account
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-2">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Google Account Integration
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Your profile information is automatically synced from
                        your Google account. To update your name or email,
                        please update them in your Google account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <svg
                  className="w-5 h-5 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h2 className="text-xl font-semibold">Advanced</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Clear Cache */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Clear Cache
                    </h3>
                    <p className="text-sm text-gray-500">
                      Clear application cache and temporary data
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clear Cache',
                        description:
                          'Are you sure you want to clear the cache? This will remove temporary data and you may need to sign in again.',
                        type: 'warning',
                        onConfirm: async () => {
                          try {
                            // Clear localStorage
                            localStorage.clear();
                            // Clear sessionStorage
                            sessionStorage.clear();
                            // Clear service worker cache if available
                            if ('caches' in window) {
                              const cacheNames = await caches.keys();
                              await Promise.all(
                                cacheNames.map(cacheName =>
                                  caches.delete(cacheName)
                                )
                              );
                            }
                            setAlertDialog({
                              open: true,
                              title: 'Success',
                              description:
                                'Cache cleared successfully! The page will reload.',
                              type: 'success',
                            });
                            setTimeout(() => window.location.reload(), 1500);
                          } catch (error) {
                            console.error('Error clearing cache:', error);
                            setAlertDialog({
                              open: true,
                              title: 'Error',
                              description:
                                'Failed to clear cache. Please try again.',
                              type: 'error',
                            });
                          }
                        },
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear Cache
                  </button>
                </div>

                {/* Export Data */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Export Data
                    </h3>
                    <p className="text-sm text-gray-500">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        // Gather all user data
                        const resumeData = await loadResumeData();
                        const emailHistory = await loadEmailHistory();

                        const exportData = {
                          user: {
                            name: user?.displayName,
                            email: user?.email,
                          },
                          resumeData,
                          emailHistory,
                          exportedAt: new Date().toISOString(),
                        };

                        // Create and download JSON file
                        const dataStr = JSON.stringify(exportData, null, 2);
                        const dataBlob = new Blob([dataStr], {
                          type: 'application/json',
                        });
                        const url = URL.createObjectURL(dataBlob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `job-email-generator-data-${
                          new Date().toISOString().split('T')[0]
                        }.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);

                        setAlertDialog({
                          open: true,
                          title: 'Success',
                          description:
                            'Your data has been exported successfully!',
                          type: 'success',
                        });
                      } catch (error) {
                        console.error('Error exporting data:', error);
                        setAlertDialog({
                          open: true,
                          title: 'Error',
                          description:
                            'Failed to export data. Please try again.',
                          type: 'error',
                        });
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Export
                  </button>
                </div>

                {/* Sign Out */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Sign Out</h3>
                    <p className="text-sm text-gray-500">
                      Sign out from your Google account
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Sign Out',
                        description:
                          'Are you sure you want to sign out? All your data is safely saved and you can sign back in anytime.',
                        type: 'warning',
                        onConfirm: async () => {
                          try {
                            await handleSignOut();
                            setAlertDialog({
                              open: true,
                              title: 'Signed Out',
                              description:
                                'You have been successfully signed out.',
                              type: 'success',
                            });
                            // Redirect to home page after a short delay
                            setTimeout(() => {
                              window.location.href = '/';
                            }, 1500);
                          } catch (error) {
                            console.error('Error signing out:', error);
                            setAlertDialog({
                              open: true,
                              title: 'Error',
                              description:
                                'Failed to sign out. Please try again.',
                              type: 'error',
                            });
                          }
                        },
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-400 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>

                {/* Delete Account */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const confirmation = prompt(
                        'This action cannot be undone. All your data will be permanently deleted.\n\nType "DELETE" to confirm:'
                      );

                      if (confirmation === 'DELETE') {
                        try {
                          // Delete user's resume data
                          await fetch(`/api/resume?userId=${user?.uid}`, {
                            method: 'DELETE',
                          });

                          // Delete user's email history
                          const history = await loadEmailHistory();
                          await Promise.all(
                            history.map(email =>
                              deleteEmailFromHistory(email.id)
                            )
                          );

                          // Sign out and clear local data
                          localStorage.clear();
                          sessionStorage.clear();

                          alert(
                            'Your account has been deleted. You will be signed out.'
                          );
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Error deleting account:', error);
                          alert(
                            'Failed to delete account. Please contact support.'
                          );
                        }
                      } else if (confirmation !== null) {
                        alert(
                          'Account deletion cancelled. Please type "DELETE" exactly to confirm.'
                        );
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </>
  );
}
