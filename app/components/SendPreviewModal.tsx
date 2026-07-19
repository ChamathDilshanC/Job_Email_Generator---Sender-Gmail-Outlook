'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CalendarClock, Paperclip, Pencil, Send } from 'lucide-react';

interface SendPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  to: string;
  subject: string;
  bodyHtml: string;
  attachmentNames: string[];
  isSending: boolean;
  emailClient: 'gmail' | 'outlook';
  sendMode: 'now' | 'schedule';
  scheduledFor: Date | null;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function SendPreviewModal({
  open,
  onOpenChange,
  to,
  subject,
  bodyHtml,
  attachmentNames,
  isSending,
  emailClient,
  sendMode,
  scheduledFor,
  onConfirm,
  onEdit,
}: SendPreviewModalProps) {
  const isScheduling = sendMode === 'schedule' && emailClient === 'gmail';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Preview Email</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4 text-sm">
          <div className="flex gap-3">
            <span className="w-16 shrink-0 font-medium text-muted-foreground">
              To
            </span>
            <span className="text-foreground">{to}</span>
          </div>
          <div className="flex gap-3">
            <span className="w-16 shrink-0 font-medium text-muted-foreground">
              Subject
            </span>
            <span className="text-foreground">{subject}</span>
          </div>
          {attachmentNames.length > 0 && (
            <div className="flex gap-3">
              <span className="w-16 shrink-0 font-medium text-muted-foreground">
                Files
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                {attachmentNames.join(', ')}
              </span>
            </div>
          )}
          {isScheduling && scheduledFor && (
            <div className="flex gap-3">
              <span className="w-16 shrink-0 font-medium text-muted-foreground">
                Sends On
              </span>
              <span className="flex items-center gap-1.5 text-foreground">
                <CalendarClock className="h-3.5 w-3.5" />
                {scheduledFor.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        <div
          className="max-h-[40vh] overflow-y-auto rounded-lg border border-border p-4 text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onEdit();
            }}
            disabled={isSending}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSending}>
            <Send className="h-3.5 w-3.5" />
            {isSending
              ? isScheduling
                ? 'Scheduling...'
                : 'Sending...'
              : isScheduling
                ? 'Confirm & Schedule'
                : emailClient === 'gmail'
                  ? 'Confirm & Send via Gmail'
                  : 'Confirm & Open in Outlook'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
