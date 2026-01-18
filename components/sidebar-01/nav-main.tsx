'use client';

import { AlertDialog } from '@/components/alert-dialog';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Lock } from 'lucide-react';
import { useState } from 'react';
import type { NavItem } from './types';

type PageType = 'send-email' | 'templates' | 'resume' | 'history' | 'profile';

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
      <SidebarGroup>
        <SidebarMenu>
          {items.map(item => {
            const Icon = item.icon;

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  tooltip={item.isLocked ? 'Sign in to access' : item.title}
                  isActive={item.isActive}
                  onClick={e => {
                    e.preventDefault();
                    // Show alert if locked
                    if (item.isLocked) {
                      setAlertDialog({
                        open: true,
                        title: 'Sign In Required',
                        description:
                          'Please sign in with your Google account to access this feature.',
                        type: 'warning',
                      });
                    } else {
                      onNavigate?.(item.id as PageType);
                    }
                  }}
                  className="gap-3"
                  style={
                    item.isActive
                      ? {
                          backgroundColor: '#3b3be3',
                          color: 'white',
                        }
                      : item.isLocked
                        ? {
                            opacity: 0.5,
                            cursor: 'pointer',
                          }
                        : undefined
                  }
                >
                  {Icon && <Icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                  {item.isLocked && <Lock className="h-4 w-4 ml-auto" />}
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

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
