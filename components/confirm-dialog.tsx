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
import { AlertCircle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const typeConfig = {
    danger: {
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonClass: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonClass: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col items-center">
        <div className="flex justify-center">
          <div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${config.bgColor}`}
          >
            <AlertCircle className={`h-6 w-6 ${config.iconColor}`} />
          </div>
        </div>

        <DialogHeader className="text-center gap-0">
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-center mx-auto sm:max-w-[90%] whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center w-full gap-2 flex-row">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">
              {cancelText}
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            className={`flex-1 ${config.buttonClass} text-white`}
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
