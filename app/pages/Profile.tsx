'use client';

import { AlertDialog } from '@/components/alert-dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { GoogleSignInButton } from '@/components/google-sign-in';
import { useAuth } from '@/contexts/AuthContext';
import {
  deleteEmailFromHistory,
  loadEmailHistory,
} from '@/lib/emailHistoryService';
import { fadeInUp, staggerContainer } from '@/lib/motion';
import { loadResumeData } from '@/lib/resumeDataService';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Download,
  Info,
  LogOut,
  SettingsIcon,
  Trash2,
  User,
} from 'lucide-react';
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
          const history = await loadEmailHistory(user?.uid);
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
      } else {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [isAuthenticated, user?.uid]);

  // Get user info from Google account
  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  const photoURL = user?.photoURL || '';

  // Show sign in required state if not authenticated
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mx-auto mt-8 flex max-w-[600px] flex-col items-center justify-center gap-6 rounded-2xl border-2 border-red-500 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-8 text-center"
        >
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <div>
            <h3 className="mb-2 text-xl font-semibold text-red-600 dark:text-red-400">
              Sign In Required
            </h3>
            <p className="text-base text-red-800 dark:text-red-300">
              Please sign in with Google to manage your profile, view email
              statistics, and access your account settings.
            </p>
          </div>

          <GoogleSignInButton
            onSuccess={() => {
              console.log('Signed in successfully');
            }}
            onError={(error: string) => {
              console.error('Sign in failed:', error);
              setAlertDialog({
                open: true,
                title: 'Sign In Failed',
                description: error,
                type: 'error',
              });
            }}
          />
        </motion.div>

        {/* Alert Dialog */}
        <AlertDialog
          open={alertDialog.open}
          onOpenChange={open => setAlertDialog({ ...alertDialog, open })}
          title={alertDialog.title}
          description={alertDialog.description}
          type={alertDialog.type}
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={staggerContainer(0.08)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl"
      >
        <motion.div variants={fadeInUp} className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Profile
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <motion.div variants={fadeInUp} className="flex flex-col gap-6">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-sm">
              <div className="relative mx-auto mb-6 h-32 w-32">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="h-32 w-32 rounded-full border-4 border-gray-100 object-cover dark:border-gray-800"
                    referrerPolicy="no-referrer"
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div
                  className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-[#3b3be3] to-[#2f2fb8]"
                  style={{ display: photoURL ? 'none' : 'flex' }}
                >
                  <User className="h-16 w-16 text-white" strokeWidth={1.5} />
                </div>
              </div>
              <h2 className="mb-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {displayName}
              </h2>
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                {email}
              </p>
              {user ? (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-green-50 dark:bg-green-500/10 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Connected with Google
                </div>
              ) : (
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-50 dark:bg-red-500/10 px-3 py-1 text-xs font-medium text-red-700 dark:text-red-400">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Not connected
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-800 pt-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-[#3b3be3] dark:text-[#818cf8]">
                    {isLoading ? '...' : emailStats.sent}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Emails Sent
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-semibold text-[#3b3be3] dark:text-[#818cf8]">
                    {isLoading ? '...' : emailStats.total}
                  </div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Total Emails
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col gap-6">
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
                Account Information
              </h2>
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      disabled
                      className="cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      Synced from your Google account
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="cursor-not-allowed rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      Synced from your Google account
                    </p>
                  </div>
                </div>

                <div className="mt-2 rounded-xl border border-blue-200 dark:border-[#818cf8]/25 bg-blue-50 dark:bg-[#818cf8]/10 p-4">
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-[#a5b4fc]" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-[#c7d2fe]">
                        Google Account Integration
                      </p>
                      <p className="mt-1 text-sm text-blue-700 dark:text-[#a5b4fc]">
                        Your profile information is automatically synced from
                        your Google account. To update your name or email,
                        please update them in your Google account settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Advanced Settings */}
            <motion.div
              variants={fadeInUp}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Advanced
                </h2>
              </div>

              <motion.div
                variants={staggerContainer(0.05)}
                initial="hidden"
                animate="visible"
                className="flex flex-col"
              >
                {/* Clear Cache */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 py-4"
                >
                  <div>
                    <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                      Clear Cache
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Clear application cache and temporary data
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Clear Cache',
                        description:
                          'Are you sure you want to clear the cache? This will remove temporary data and you may need to sign in again.',
                        type: 'warning',
                        onConfirm: async () => {
                          try {
                            localStorage.clear();
                            sessionStorage.clear();
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
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Clear Cache
                  </motion.button>
                </motion.div>

                {/* Export Data */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 py-4"
                >
                  <div>
                    <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                      Export Data
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Download all your data in JSON format
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      try {
                        const resumeData = await loadResumeData(user?.uid);
                        const emailHistory = await loadEmailHistory(user?.uid);

                        const exportData = {
                          user: {
                            name: user?.displayName,
                            email: user?.email,
                          },
                          resumeData,
                          emailHistory,
                          exportedAt: new Date().toISOString(),
                        };

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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </motion.button>
                </motion.div>

                {/* Sign Out */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 py-4"
                >
                  <div>
                    <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                      Sign Out
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Sign out from your Google account
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
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
                    className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-500 dark:border-yellow-600 bg-yellow-400 px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-yellow-300"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </motion.button>
                </motion.div>

                {/* Delete Account */}
                <motion.div
                  variants={fadeInUp}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <h3 className="mb-1 font-medium text-gray-900 dark:text-gray-100">
                      Delete Account
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setConfirmDialog({
                        open: true,
                        title: 'Delete Account',
                        description:
                          'This action cannot be undone. All your data will be permanently deleted. Are you sure you want to delete your account?',
                        type: 'danger',
                        onConfirm: async () => {
                          try {
                            await fetch(`/api/resume?userId=${user?.uid}`, {
                              method: 'DELETE',
                            });

                            const history = await loadEmailHistory(user?.uid);
                            await Promise.all(
                              history.map(email =>
                                deleteEmailFromHistory(email.id)
                              )
                            );

                            localStorage.clear();
                            sessionStorage.clear();

                            setAlertDialog({
                              open: true,
                              title: 'Account Deleted',
                              description:
                                'Your account has been deleted. You will be signed out.',
                              type: 'success',
                            });

                            setTimeout(() => {
                              window.location.href = '/';
                            }, 1500);
                          } catch (error) {
                            console.error('Error deleting account:', error);
                            setAlertDialog({
                              open: true,
                              title: 'Error',
                              description:
                                'Failed to delete account. Please contact support.',
                              type: 'error',
                            });
                          }
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete Account
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

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
