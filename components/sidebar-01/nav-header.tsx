'use client';

import { SidebarData } from '@/components/sidebar-01/types';
import { SidebarHeader, SidebarTrigger } from '@/components/ui/sidebar';
import NextImage from 'next/image';

interface NavHeaderProps {
  data: SidebarData;
}

export function NavHeader({ data }: NavHeaderProps) {
  return (
    <SidebarHeader>
      <div className="flex items-center gap-3 px-2 py-4 group-data-[collapsible=icon]:justify-center">
        <NextImage
          src="/logo.png"
          alt="JobMail Logo"
          width={40}
          height={40}
          className="shrink-0 rounded-lg group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8"
        />
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="font-semibold text-base">JobMail</span>
          <span className="text-xs text-muted-foreground">
            Professional Job Applications
          </span>
        </div>
        <SidebarTrigger className="ml-auto h-7 w-7 group-data-[collapsible=icon]:hidden" />
      </div>
    </SidebarHeader>
  );
}
