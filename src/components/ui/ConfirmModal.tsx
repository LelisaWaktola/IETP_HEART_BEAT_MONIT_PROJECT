'use client';

import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
}

export default function ConfirmModal({
  open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', loading = false,
}: ConfirmModalProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="flex gap-3 mb-5">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-critical/15 border border-critical/30 flex items-center justify-center">
          <AlertTriangle size={18} className="text-critical" />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed pt-2">{description}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-150 border border-border"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium bg-critical text-primary-foreground rounded-lg hover:bg-critical/90 transition-all duration-150 active:scale-95 disabled:opacity-60 flex items-center gap-2 min-w-[90px] justify-center"
        >
          {loading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing…
            </>
          ) : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}