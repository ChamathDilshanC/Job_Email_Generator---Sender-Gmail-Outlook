'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
}

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancel',
  onConfirm,
  variant = 'default',
}: AlertDialogProps) {
  const iconConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
  };

  const config = iconConfig[type];
  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <div className="flex justify-center">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor}`}
          >
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
        </div>

        <DialogHeader className="text-center gap-0">
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-center mx-auto sm:max-w-[90%] whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center w-full gap-2">
          {onConfirm ? (
            <>
              <DialogClose asChild>
                <Button variant="outline" className="w-full">
                  {cancelText}
                </Button>
              </DialogClose>
              <Button onClick={onConfirm} variant={variant} className="w-full">
                {confirmText}
              </Button>
            </>
          ) : (
            <DialogClose asChild>
              <Button variant={variant} className="w-full">
                {confirmText}
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
