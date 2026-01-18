'use client';

import { SidebarData } from '@/components/sidebar-01/types';
import { SidebarHeader } from '@/components/ui/sidebar';
import NextImage from 'next/image';

interface NavHeaderProps {
  data: SidebarData;
}

export function NavHeader({ data }: NavHeaderProps) {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-3 px-2 py-4">
        <NextImage
          src="/logo.png"
          alt="JobMail Logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div className="flex flex-col">
          <span className="font-semibold text-base">JobMail</span>
          <span className="text-xs text-muted-foreground">
            Professional Job Applications
          </span>
        </div>
      </div>
    </SidebarHeader>
  );
}
