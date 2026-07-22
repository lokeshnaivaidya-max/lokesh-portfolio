import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', onConfirm, onCancel
}: Props) {
  if (!open) return null;

  const colors = variant === 'danger'
    ? { bg: 'bg-red-950/40 border-red-500/40', btn: 'bg-[#E8332A] hover:bg-red-600', icon: 'text-red-400' }
    : variant === 'warning'
    ? { bg: 'bg-amber-950/40 border-amber-500/40', btn: 'bg-amber-600 hover:bg-amber-700', icon: 'text-amber-400' }
    : { bg: 'bg-blue-950/40 border-blue-500/40', btn: 'bg-blue-600 hover:bg-blue-700', icon: 'text-blue-400' };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={`${colors.bg} border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${colors.icon}`} />
            <h3 className="font-display text-xl text-white uppercase tracking-wider">{title}</h3>
          </div>
          <button onClick={onCancel} className="text-gray-500 hover:text-white transition cursor-pointer bg-transparent border-0 p-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="font-mono text-sm text-gray-300 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="bg-[#2D2D2D] hover:bg-gray-700 text-white font-mono text-xs uppercase px-4 py-2 rounded transition cursor-pointer">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`${colors.btn} text-white font-mono text-xs uppercase px-4 py-2 rounded transition cursor-pointer`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
