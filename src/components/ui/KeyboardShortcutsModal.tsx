import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Command, Sparkles, LayoutDashboard, Wallet, Calendar, Zap, Target, BookOpen, Settings } from 'lucide-react';
import { Kbd } from './Kbd';
import { Badge } from './Badge';
import { useLanguage } from '../../contexts/LanguageContext';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';
  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modifierKey = isMac ? '⌘' : 'Ctrl';

  const shortcutGroups = [
    {
      title: isId ? 'Navigasi Cepat (Quick Switch)' : 'Quick Navigation',
      items: [
        {
          label: isId ? 'Buka Dashboard' : 'Go to Dashboard',
          keys: ['Alt', '1'],
          altKeys: ['g', 'd'],
          icon: LayoutDashboard
        },
        {
          label: isId ? 'Buka Keuangan (Finance)' : 'Go to Finance',
          keys: ['Alt', '2'],
          altKeys: ['g', 'f'],
          icon: Wallet
        },
        {
          label: isId ? 'Buka Produktivitas & Jadwal' : 'Go to Schedule / Productivity',
          keys: ['Alt', '3'],
          altKeys: ['g', 'p'],
          icon: Calendar
        },
        {
          label: isId ? 'Buka AI Planner' : 'Open AI Planner',
          keys: ['Alt', '4'],
          altKeys: ['g', 'a'],
          icon: Sparkles
        },
        {
          label: isId ? 'Buka Pelacak Kebiasaan (Habits)' : 'Go to Habits',
          keys: ['Alt', '5'],
          altKeys: ['g', 'h'],
          icon: Zap
        },
        {
          label: isId ? 'Buka Target Harian' : 'Go to Daily Targets',
          keys: ['Alt', '6'],
          altKeys: ['g', 't'],
          icon: Target
        },
        {
          label: isId ? 'Buka Jurnal Refleksi' : 'Go to Daily Journal',
          keys: ['Alt', '7'],
          altKeys: ['g', 'j'],
          icon: BookOpen
        },
      ]
    },
    {
      title: isId ? 'Perintah & Aksi Global' : 'Commands & Global Actions',
      items: [
        {
          label: isId ? 'Buka Command Palette' : 'Open Command Palette',
          keys: [modifierKey, 'K'],
          icon: Command
        },
        {
          label: isId ? 'Tampilkan Bantuan Shortcut' : 'Show Keyboard Shortcuts',
          keys: ['?'],
          icon: Keyboard
        },
        {
          label: isId ? 'Tutup Dialog / Modal' : 'Close Active Modal / Palette',
          keys: ['ESC'],
          icon: X
        },
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-lg bg-[#14151a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#181920]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/25 flex items-center justify-center text-orange-400">
                  <Keyboard size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    {isId ? 'Pintasan Keyboard Global' : 'Global Keyboard Shortcuts'}
                    <Badge variant="outline" className="text-[10px] py-0">Global</Badge>
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {isId 
                      ? 'Navigasi kilat antar modul tanpa menggunakan kursor'
                      : 'Fly across modules and open features at lightning speed'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 custom-scrollbar">
              {shortcutGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-2.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 px-1">
                    {group.title}
                  </span>
                  <div className="space-y-1.5">
                    {group.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                            <Icon size={14} className="text-zinc-400" />
                            <span>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.altKeys && (
                              <div className="hidden sm:flex items-center gap-1 text-[10px] text-zinc-500 mr-2 font-mono">
                                <span>or</span>
                                <Kbd>{item.altKeys[0]}</Kbd>
                                <span>then</span>
                                <Kbd>{item.altKeys[1]}</Kbd>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              {item.keys.map((k, kIdx) => (
                                <React.Fragment key={kIdx}>
                                  <Kbd>{k}</Kbd>
                                  {kIdx < item.keys.length - 1 && <span className="text-[10px] text-zinc-500">+</span>}
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-[#101114] border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                Tip: Press <Kbd>?</Kbd> anywhere to show this cheatsheet
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-medium transition-colors"
              >
                {isId ? 'Tutup' : 'Close'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
