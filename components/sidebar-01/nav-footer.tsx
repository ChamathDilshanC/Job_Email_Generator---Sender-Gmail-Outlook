'use client';

import { SidebarFooter } from '@/components/ui/sidebar';
import NextImage from 'next/image';

export function NavFooter({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  return (
    <SidebarFooter className="p-4">
      <div className="flex flex-col items-center justify-center gap-3">
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
    </SidebarFooter>
  );
}
