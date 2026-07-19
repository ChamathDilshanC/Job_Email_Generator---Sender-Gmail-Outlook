import { ApplicationStatus } from '@/app/models/EmailHistory';

export type DeliveryStatus = 'sent' | 'pending' | 'failed';

export function getDeliveryStatusClasses(status: string): string {
  switch (status as DeliveryStatus) {
    case 'sent':
      return 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'pending':
      return 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50';
    case 'failed':
      return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
}

export function getApplicationStatusClasses(
  status: ApplicationStatus | undefined
): string {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 dark:bg-[#818cf8]/15 text-blue-800 dark:text-[#a5b4fc] border-blue-200 dark:border-[#818cf8]/30';
    case 'interview_scheduled':
      return 'bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
    case 'offered':
      return 'bg-green-100 dark:bg-green-500/10 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'rejected':
      return 'bg-red-100 dark:bg-red-500/10 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800/50';
    case 'no_response':
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700';
  }
}

export function formatDeliveryStatusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
