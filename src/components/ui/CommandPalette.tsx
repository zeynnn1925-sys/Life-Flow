import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlass, 
  SquaresFour, 
  Coins, 
  CalendarBlank, 
  CalendarCheck, 
  Repeat, 
  Target, 
  BookOpenText, 
  Wallet, 
  Headphones, 
  Trophy, 
  Gear, 
  Keyboard, 
  ArrowRight, 
  Command 
} from '@phosphor-icons/react';
import { View } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { Kbd } from './Kbd';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveView: (view: View) => void;
  onOpenShortcutsHelp?: () => void;
}

interface ActionItem {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  view?: View;
  shortcut?: string;
  onSelect?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  setActiveView,
  onOpenShortcutsHelp,
}) => {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions: ActionItem[] = [
    { 
      id: 'dashboard', 
      title: 'Dashboard', 
      category: isId ? 'Navigasi' : 'Navigation', 
      icon: SquaresFour, 
      view: 'dashboard' as View,
      shortcut: '⌥1' 
    },
    { 
      id: 'finance', 
      title: isId ? 'Keuangan & Transaksi' : 'Finance & Transactions', 
      category: isId ? 'Keuangan' : 'Finance', 
      icon: Coins, 
      view: 'finance' as View,
      shortcut: '⌥2' 
    },
    { 
      id: 'budgets', 
      title: isId ? 'Anggaran & Tabungan' : 'Budgets & Savings', 
      category: isId ? 'Keuangan' : 'Finance', 
      icon: Wallet, 
      view: 'budgets' as View,
      shortcut: '⌥3' 
    },
    { 
      id: 'schedule', 
      title: isId ? 'Jadwal & Agenda' : 'Schedule & Agenda', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: CalendarBlank, 
      view: 'schedule' as View,
      shortcut: '⌥4' 
    },
    { 
      id: 'habits', 
      title: isId ? 'Pelacak Kebiasaan' : 'Habit Tracker', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: Repeat, 
      view: 'habits' as View,
      shortcut: '⌥5' 
    },
    { 
      id: 'ai_planner', 
      title: isId ? 'Rencana Hari Ini' : 'Daily Plan', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: CalendarCheck, 
      view: 'ai_planner' as View,
      shortcut: '⌥6' 
    },
    { 
      id: 'targets', 
      title: isId ? 'Target Harian' : 'Daily Targets', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: Target, 
      view: 'targets' as View,
      shortcut: '⌥7' 
    },
    { 
      id: 'smart_space', 
      title: isId ? 'Smart Space (Fokus & Suasana)' : 'Smart Space (Focus & Ambient)', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: Headphones, 
      view: 'smart_space' as View,
      shortcut: '⌥8' 
    },
    { 
      id: 'journal', 
      title: isId ? 'Jurnal Refleksi' : 'Daily Journal', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: BookOpenText, 
      view: 'journal' as View,
      shortcut: '⌥9' 
    },
    { 
      id: 'achievements', 
      title: isId ? 'Pencapaian & Medali' : 'Achievements & Badges', 
      category: isId ? 'Sistem' : 'System', 
      icon: Trophy, 
      view: 'achievements' as View 
    },
    { 
      id: 'settings', 
      title: isId ? 'Pengaturan Sistem' : 'System Settings', 
      category: isId ? 'Sistem' : 'System', 
      icon: Gear, 
      view: 'settings' as View 
    },
    ...(onOpenShortcutsHelp ? [{
      id: 'shortcuts_help',
      title: isId ? 'Daftar Pintasan Keyboard' : 'View Keyboard Shortcuts',
      category: isId ? 'Bantuan' : 'Help',
      icon: Keyboard,
      shortcut: '?',
      onSelect: () => {
        onOpenShortcutsHelp();
      }
    }] : [])
  ];

  const filtered = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const executeAction = (action: ActionItem) => {
    if (action.onSelect) {
      action.onSelect();
    } else if (action.view) {
      setActiveView(action.view);
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(filtered.length, 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(filtered.length, 1));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        executeAction(filtered[selectedIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose, setActiveView]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-xl bg-[#14161b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-white/[0.07] gap-2.5 bg-white/[0.02]">
              <MagnifyingGlass size={16} weight="light" className="text-white/40 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isId ? 'Ketik perintah atau modul (misal: Keuangan, Jadwal, Target)...' : 'Type a command or search module (e.g. Finance, Schedule, Targets)...'}
                autoFocus
                className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/35 outline-none font-normal"
              />
              <Kbd className="text-[10px] text-white/40 border-white/10 bg-white/[0.04]">ESC</Kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-white/40">
                  {isId ? 'Tidak ada modul atau perintah yang cocok.' : 'No commands or views found.'}
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => executeAction(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-white/[0.06] text-white'
                          : 'text-white/70 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'text-[#C8A27C]' : 'text-white/40'
                          }`}
                        >
                          <Icon size={16} weight={isSelected ? "regular" : "light"} />
                        </div>
                        <span className="font-normal truncate">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <Kbd className="text-[10px] py-0 px-1 text-white/40 border-white/10 bg-white/[0.04] font-mono">
                            {item.shortcut}
                          </Kbd>
                        )}
                        <span className="text-[10px] font-mono text-white/35">
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight size={12} weight="light" className="text-[#C8A27C]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-white/[0.01] border-t border-hairline flex items-center justify-between text-[10px] text-white/40 font-mono">
              <span className="flex items-center gap-2">
                <span>Navigate: ↑ ↓</span>
                <span>·</span>
                <span>Select: ↵</span>
                <span>·</span>
                <span>Shortcuts: <Kbd className="text-[9px] py-0">?</Kbd></span>
              </span>
              <span className="flex items-center gap-1">
                <Command size={11} weight="light" /> + K
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
