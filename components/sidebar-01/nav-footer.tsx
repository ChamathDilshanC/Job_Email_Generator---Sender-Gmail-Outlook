'use client';

import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, ExternalLink, FileCode, LogOut } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';
import type { PageType } from './types';

interface NavFooterProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onNavigate?: (page: PageType) => void;
  activePage?: PageType;
}

export function NavFooter({ user, onNavigate, activePage }: NavFooterProps) {
  const { isAuthenticated, handleSignOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <SidebarFooter className="gap-0 p-0">
      {/* Guide Flow & Documentation Section */}
      <SidebarMenu className="px-2 pt-2 pb-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={activePage === 'guide'}
            onClick={() => onNavigate?.('guide')}
            className="gap-3 group"
            style={
              activePage === 'guide'
                ? {
                    backgroundColor: '#3b3be3',
                    color: 'white',
                  }
                : undefined
            }
          >
            <BookOpen className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Guide Flow</span>
            <ExternalLink
              className={`h-4 w-4 ml-auto flex-shrink-0 transition-opacity ${
                activePage === 'guide'
                  ? 'text-white opacity-100'
                  : 'text-muted-foreground opacity-60 group-hover:opacity-100'
              }`}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem className="mt-1">
          <SidebarMenuButton
            isActive={activePage === 'docs'}
            onClick={() => onNavigate?.('docs')}
            className="gap-3 group"
            style={
              activePage === 'docs'
                ? {
                    backgroundColor: '#3b3be3',
                    color: 'white',
                  }
                : undefined
            }
          >
            <FileCode className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Documentation</span>
            <ExternalLink
              className={`h-4 w-4 ml-auto flex-shrink-0 transition-opacity ${
                activePage === 'docs'
                  ? 'text-white opacity-100'
                  : 'text-muted-foreground opacity-60 group-hover:opacity-100'
              }`}
            />
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Divider */}
      <div className="border-t border-border my-1" />

      {/* Log Out Section */}
      {isAuthenticated && (
        <>
          <SidebarMenu className="px-2 py-1">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowLogoutConfirm(true)}
                className="gap-3 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              >
                <LogOut className="h-5 w-5" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="border-t border-border" />
        </>
      )}

      <div className="flex flex-col items-center justify-center gap-3 p-4">
        <NextImage
          src="/logosm.png"
          alt="JobMail"
          width={100}
          height={100}
          className="opacity-90"
        />
        <p className="text-xs text-center text-muted-foreground">
          Developed by Chamath Dilshan
        </p>
      </div>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Log Out"
        description="Are you sure you want to log out of your account?"
        confirmText="Log Out"
        type="warning"
        onConfirm={handleSignOut}
      />
    </SidebarFooter>
  );
}
