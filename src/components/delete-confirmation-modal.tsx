'use client';

import { X } from 'lucide-react';
import { Button } from './ui/button';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  message = "Are you sure you want to delete this item?",
  itemName
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl shadow-lg max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Modal content */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
          <p className="text-muted-foreground">
            {message}
            {itemName && <span className="font-medium text-foreground"> "{itemName}"</span>}
          </p>
        </div>

        {/* Warning */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-lg p-3 mb-6">
          <p className="text-sm text-red-600 dark:text-red-400">
            This action cannot be undone. The item will be permanently deleted.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
