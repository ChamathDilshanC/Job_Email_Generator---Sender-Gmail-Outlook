'use client';

import { AlertDialog } from '@/components/alert-dialog';
import { BounceSidebar } from '@/components/ui/bounce-sidebar';
import { useState } from 'react';
import type { NavItem, PageType } from './types';

interface NavMainProps {
  items: NavItem[];
  onNavigate?: (pageId: PageType) => void;
}

export function NavMain({ items, onNavigate }: NavMainProps) {
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, title: '', description: '', type: 'info' });

  return (
    <>
      <div className="px-2 py-4">
        <BounceSidebar
          items={items.map(item => ({
            label: item.isLocked ? `${item.title}  🔒` : item.title,
          }))}
          value={Math.max(
            0,
            items.findIndex(item => item.isActive)
          )}
          onChange={index => {
            const item = items[index];
            if (!item) return;

            if (item.isLocked) {
              setAlertDialog({
                open: true,
                title: 'Sign In Required',
                description:
                  'Please sign in with your Google account to access this feature.',
                type: 'warning',
              });
              return;
            }

            onNavigate?.(item.id as PageType);
          }}
          dotColor="#4f46e5"
          className="gap-2 pl-4"
        />
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={open => setAlertDialog({ ...alertDialog, open })}
        title={alertDialog.title}
        description={alertDialog.description}
        type={alertDialog.type}
      />
    </>
  );
}
