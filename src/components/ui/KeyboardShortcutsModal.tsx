import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Keyboard, 
  Command, 
  CalendarCheck, 
  SquaresFour, 
  Coins, 
  CalendarBlank, 
  Repeat, 
  Target, 
  BookOpenText 
} from '@phosphor-icons/react';
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
      title: isId ? 'Navigasi Cepat' : 'Quick Navigation',
      items: [
        {
          label: isId ? 'Buka Dashboard' : 'Go to Dashboard',
          keys: ['Alt', '1'],
          altKeys: ['g', 'd'],
          icon: SquaresFour
        },
        {
          label: isId ? 'Buka Keuangan' : 'Go to Finance',
          keys: ['Alt', '2'],
          altKeys: ['g', 'f'],
          icon: Coins
        },
        {
          label: isId ? 'Buka Jadwal' : 'Go to Schedule',
          keys: ['Alt', '3'],
          altKeys: ['g', 'p'],
          icon: CalendarBlank
        },
        {
          label: isId ? 'Buka Rencana Hari Ini' : 'Go to Daily Plan',
          keys: ['Alt', '4'],
          altKeys: ['g', 'a'],
          icon: CalendarCheck
        },
        {
          label: isId ? 'Buka Kebiasaan' : 'Go to Habits',
          keys: ['Alt', '5'],
          altKeys: ['g', 'h'],
          icon: Repeat
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
          icon: BookOpenText
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
          label: isId ? 'Tampilkan Bantuan Pintasan' : 'Show Keyboard Shortcuts',
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
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-lg bg-[#14161b] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#C8A27C]/15 border border-[#C8A27C]/25 flex items-center justify-center text-[#C8A27C]">
                  <Keyboard size={16} weight="regular" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-white/95 flex items-center gap-2">
                    {isId ? 'Pintasan Keyboard' : 'Keyboard Shortcuts'}
                    <Badge variant="outline" className="text-[10px] py-0 text-white/50 border-white/10">Global</Badge>
                  </h3>
                  <p className="text-[11px] text-white/45">
                    {isId 
                      ? 'Akses cepat modul dan perintah dengan tombol keyboard'
                      : 'Fly across views and trigger commands with your keyboard'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X size={15} weight="light" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5 custom-scrollbar">
              {shortcutGroups.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-2.5">
                  <span className="text-[10px] font-mono font-medium text-white/40 px-1">
                    {group.title}
                  </span>
                  <div className="space-y-1.5">
                    {group.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 text-xs text-white/80">
                            <Icon size={15} weight="light" className="text-white/40" />
                            <span>{item.label}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {item.altKeys && (
                              <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/40 mr-2 font-mono">
                                <span>or</span>
                                <Kbd className="bg-white/[0.04] border-white/10">{item.altKeys[0]}</Kbd>
                                <span>then</span>
                                <Kbd className="bg-white/[0.04] border-white/10">{item.altKeys[1]}</Kbd>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              {item.keys.map((k, kIdx) => (
                                <React.Fragment key={kIdx}>
                                  <Kbd className="bg-white/[0.04] border-white/10 font-mono text-[10.5px]">{k}</Kbd>
                                  {kIdx < item.keys.length - 1 && <span className="text-[10px] text-white/30">+</span>}
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
            <div className="px-5 py-3 bg-white/[0.01] border-t border-hairline flex items-center justify-between text-[11px] text-white/40">
              <span className="flex items-center gap-1 font-mono text-[10.5px]">
                Tip: Tekan <Kbd className="bg-white/[0.04] border-white/10">?</Kbd> di mana saja untuk melihat panduan ini
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-white/80 text-xs font-normal transition-colors cursor-pointer"
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
