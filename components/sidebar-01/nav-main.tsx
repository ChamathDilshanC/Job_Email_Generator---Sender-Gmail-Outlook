'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Lock } from 'lucide-react';
import type { NavItem } from './types';

type PageType = 'send-email' | 'templates' | 'resume' | 'history' | 'profile';

interface NavMainProps {
  items: NavItem[];
  onNavigate?: (pageId: PageType) => void;
}

export function NavMain({ items, onNavigate }: NavMainProps) {
  return (
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
                  // Don't navigate if locked
                  if (!item.isLocked) {
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
                          cursor: 'not-allowed',
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
  );
}
