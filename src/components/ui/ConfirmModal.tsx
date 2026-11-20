'use client';

import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, Loader2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning' | 'info';
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  variant = 'primary',
  icon,
}: ConfirmModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isProcessing) return; // Prevent double click
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setIsProcessing(false);
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          btn: 'bg-pantas-red text-white hover:bg-red-700 focus:ring-red-400',
          iconBg: 'bg-red-50 text-pantas-red border-red-200',
          defaultIcon: <AlertCircle className="w-5 h-5 text-pantas-red" />,
        };
      case 'warning':
        return {
          btn: 'bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-400',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
        };
      case 'info':
        return {
          btn: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-400',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
          defaultIcon: <HelpCircle className="w-5 h-5 text-blue-600" />,
        };
      case 'primary':
      default:
        return {
          btn: 'bg-pantas-primary text-white hover:bg-pantas-primary-hover focus:ring-pantas-primary',
          iconBg: 'bg-pantas-soft text-pantas-primary border-pantas-border',
          defaultIcon: <CheckCircle2 className="w-5 h-5 text-pantas-primary" />,
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-lg border border-pantas-border overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-pantas-border bg-neutral-50/60">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 ${styles.iconBg}`}>
              {icon || styles.defaultIcon}
            </div>
            <h3 id="confirm-modal-title" className="text-base font-bold text-pantas-dark leading-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-pantas-muted hover:text-pantas-dark rounded-md transition-colors disabled:opacity-50"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="px-5 py-4 text-sm text-neutral-600 leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-neutral-50/70 border-t border-pantas-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 border border-pantas-border rounded-lg text-xs sm:text-sm font-semibold text-neutral-600 hover:text-pantas-dark hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50 min-w-[100px] ${styles.btn}`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Memproses...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
