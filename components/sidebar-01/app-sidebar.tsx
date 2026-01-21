'use client';

import { NavFooter } from '@/components/sidebar-01/nav-footer';
import { NavHeader } from '@/components/sidebar-01/nav-header';
import { NavMain } from '@/components/sidebar-01/nav-main';
import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, FileText, Home, Mail, User } from 'lucide-react';
import type { NavItem, SidebarData } from './types';

type PageType = 'send-email' | 'templates' | 'resume' | 'history' | 'profile';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (page: PageType) => void;
  activePage?: PageType;
}

const userData = {
  name: 'JobMail User',
  email: 'user@jobmail.app',
  avatar: '/logo.png',
};

export function AppSidebar({
  onNavigate,
  activePage = 'send-email',
  ...props
}: AppSidebarProps) {
  const { isAuthenticated } = useAuth();

  const baseNavItems: NavItem[] = [
    {
      id: 'send-email',
      title: 'Send Email',
      url: '#',
      icon: Home,
      isActive: false,
    },
    {
      id: 'resume',
      title: 'Your Information',
      url: '#',
      icon: FileText,
      isActive: false,
      isLocked: !isAuthenticated, // Lock when not authenticated
    },
    {
      id: 'templates',
      title: 'Email Templates',
      url: '#',
      icon: Mail,
      isActive: false,
    },
    {
      id: 'history',
      title: 'History',
      url: '#',
      icon: Clock,
      isActive: false,
      isLocked: !isAuthenticated, // Lock when not authenticated
    },
    {
      id: 'profile',
      title: 'Profile',
      url: '#',
      icon: User,
      isActive: false,
      isLocked: !isAuthenticated, // Lock when not authenticated
    },
  ];

  // Update active state based on current page
  const navMainWithActive = baseNavItems.map(item => ({
    ...item,
    isActive: item.id === activePage,
  }));

  const data: SidebarData = {
    user: userData,
    navMain: navMainWithActive,
    navCollapsible: {
      favorites: [],
      teams: [],
      topics: [],
    },
  };

  return (
    <Sidebar {...props}>
      <NavHeader data={data} />
      <SidebarContent>
        <NavMain items={data.navMain} onNavigate={onNavigate} />
      </SidebarContent>
      <NavFooter user={data.user} />
    </Sidebar>
  );
}
