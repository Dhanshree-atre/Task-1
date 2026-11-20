import React, { useState } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  habit,
  onClose,
  onConfirm
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !habit) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(habit.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/15 text-rose-400 rounded-xl shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-1">
              Delete Habit?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-2">
              Are you sure you want to delete <strong className="text-white">"{habit.title}"</strong>?
            </p>
            <p className="text-xs text-rose-400/90 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20">
              ⚠️ This will permanently remove this habit and all its {habit.total_completions || 0} historical check-in logs. This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Habit'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
