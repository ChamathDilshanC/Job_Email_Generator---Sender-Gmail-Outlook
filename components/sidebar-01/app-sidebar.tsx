"use client";

import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { motion } from "framer-motion";
import NextImage from "next/image";
import {
  BookOpen,
  CalendarClock,
  Clock,
  FileCode,
  FileText,
  Home,
  LogOut,
  Mail,
  ScrollText,
  Settings,
} from "lucide-react";
import { useState } from "react";
import type { PageType } from "./types";

interface AppSidebarProps {
  onNavigate?: (page: PageType) => void;
  activePage?: PageType;
  expandedPinned?: boolean;
  onExpandedPinnedChange?: (expanded: boolean) => void;
}

export function AppSidebar({
  onNavigate,
  activePage = "send-email",
  expandedPinned = false,
}: AppSidebarProps) {
  const { isAuthenticated, handleSignOut } = useAuth();
  const [hoverExpanded, setHoverExpanded] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const expanded = expandedPinned || hoverExpanded;

  const navItems = [
    { id: "send-email" as PageType, title: "Send Email", icon: Home },
    { id: "resume" as PageType, title: "Your Information", icon: FileText, locked: !isAuthenticated },
    { id: "templates" as PageType, title: "Email Templates", icon: Mail },
    { id: "cover-letter" as PageType, title: "Cover Letter", icon: ScrollText, locked: !isAuthenticated },
    { id: "history" as PageType, title: "History", icon: Clock, locked: !isAuthenticated },
    { id: "scheduled" as PageType, title: "Scheduled", icon: CalendarClock, locked: !isAuthenticated },
    { id: "settings" as PageType, title: "Settings", icon: Settings },
  ];

  const navigate = (item: (typeof navItems)[number]) => {
    if (item.locked) return;
    onNavigate?.(item.id);
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: expanded ? 248 : 72 }}
        transition={{ type: "spring", stiffness: 420, damping: 38 }}
        onMouseEnter={() => setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        className="relative z-40 flex h-screen shrink-0 flex-col border-r border-border bg-background"
      >
        <div className="flex h-[64px] items-center border-b border-border px-4">
          <NextImage src="/logo.png" alt="JobMail" width={32} height={32} className="shrink-0" />
          {expanded && (
            <motion.div initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="ml-3 min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">JobMail</p>
              <p className="truncate text-[11px] text-muted-foreground">Professional Job Applications</p>
            </motion.div>
          )}
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {navItems.map(item => {
              const active = item.id === activePage;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item)}
                  aria-label={item.title}
                  title={!expanded ? item.title : undefined}
                  className={cn(
                    "group relative flex h-11 w-full items-center rounded-xl text-sm transition-colors",
                    expanded ? "gap-3 px-3" : "justify-center px-0",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-[18px] w-[18px] shrink-0", active && "text-primary")} />
                  {expanded ? (
                    <span className="truncate font-medium">{item.title}</span>
                  ) : (
                    <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                      {item.title}
                    </span>
                  )}
                  {active && <span className="absolute left-0 h-5 w-0.5 rounded-r-full bg-primary" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-border p-3">
          {[
            { id: "guide" as PageType, title: "Guide Flow", icon: BookOpen },
            { id: "docs" as PageType, title: "Documentation", icon: FileCode },
          ].map(item => {
            const active = item.id === activePage;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.id)}
                aria-label={item.title}
                title={!expanded ? item.title : undefined}
                className={cn(
                  "group relative mb-1 flex h-10 w-full items-center rounded-xl text-sm transition-colors",
                  expanded ? "gap-3 px-3" : "justify-center",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {expanded && <span className="font-medium">{item.title}</span>}
                {!expanded && (
                  <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.title}
                  </span>
                )}
              </button>
            );
          })}

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              aria-label="Log Out"
              title={!expanded ? "Log Out" : undefined}
              className={cn(
                "group relative mt-1 flex h-10 w-full items-center rounded-xl text-sm text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30",
                expanded ? "gap-3 px-3" : "justify-center",
              )}
            >
              <LogOut className="h-[18px] w-[18px] shrink-0" />
              {expanded && <span className="font-medium">Log Out</span>}
              {!expanded && (
                <span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                  Log Out
                </span>
              )}
            </button>
          )}

          {expanded && (
            <div className="mt-3 flex items-center gap-2 border-t border-border px-1 pt-3">
              <NextImage src="/logosm.png" alt="JobMail" width={24} height={24} />
              <span className="text-[11px] text-muted-foreground">Chamath Dilshan</span>
            </div>
          )}
        </div>
      </motion.aside>

      <ConfirmDialog
        open={showLogoutConfirm}
        onOpenChange={setShowLogoutConfirm}
        title="Log Out"
        description="Are you sure you want to log out?"
        confirmText="Log Out"
        type="warning"
        onConfirm={handleSignOut}
      />
    </>
  );
}
