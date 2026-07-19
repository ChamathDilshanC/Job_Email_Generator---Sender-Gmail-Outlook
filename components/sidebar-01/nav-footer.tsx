'use client';

import { ConfirmDialog } from '@/components/confirm-dialog';
import {
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';
import NextImage from 'next/image';
import { useState } from 'react';

export function NavFooter({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const { isAuthenticated, handleSignOut } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <SidebarFooter className="gap-0 p-0">
      {isAuthenticated && (
        <>
          <SidebarMenu className="px-2 py-2">
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
