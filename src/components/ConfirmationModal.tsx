import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-3 rounded-xxl shadow-modal border border-hairline-strong overflow-hidden backdrop-blur-xl"
          >
            <div className="p-8">
              <div className="flex flex-col items-center text-center gap-6 mb-8">
                <div className={`w-16 h-16 rounded-pill flex items-center justify-center border shadow-sm ${
                  type === 'danger' ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-accent/10 border-accent/30 text-accent'
                }`}>
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-heading-md font-black text-ink uppercase tracking-tight">{title}</h3>
                  <p className="text-body-sm text-ink-tertiary">{message}</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={onCancel}
                  className="flex-1 h-12 rounded-pill font-bold text-ink-tertiary bg-surface-2 border border-hairline hover:bg-surface-3 transition-all uppercase tracking-widest text-eyebrow"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    // onCancel(); // Assuming we want the caller to handle closing if needed, but usually it closes.
                  }}
                  className={`flex-1 h-12 rounded-pill font-bold text-white transition-all uppercase tracking-widest text-eyebrow shadow-sm ${
                    type === 'danger' ? 'bg-danger hover:bg-danger/90 shadow-glow-primary/20' : 'bg-accent hover:bg-accent-hover shadow-glow-accent'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 hover:bg-surface-2 rounded-pill transition-all group"
            >
              <X className="w-5 h-5 text-ink-tertiary group-hover:text-ink" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
