import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, LayoutDashboard, Wallet, Calendar, Target, Zap, 
  Sparkles, BookOpen, BrainCircuit, Settings, Trophy, 
  ArrowRight, Command, Keyboard
} from 'lucide-react';
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
      icon: LayoutDashboard, 
      view: 'dashboard' as View,
      shortcut: 'Alt+1' 
    },
    { 
      id: 'finance', 
      title: isId ? 'Keuangan & Transaksi' : 'Finance & Transactions', 
      category: isId ? 'Navigasi' : 'Navigation', 
      icon: Wallet, 
      view: 'finance' as View,
      shortcut: 'Alt+2' 
    },
    { 
      id: 'schedule', 
      title: isId ? 'Jadwal & Tugas' : 'Schedule & Tasks', 
      category: isId ? 'Navigasi' : 'Navigation', 
      icon: Calendar, 
      view: 'schedule' as View,
      shortcut: 'Alt+3' 
    },
    { 
      id: 'ai_planner', 
      title: isId ? 'AI Planner (Perencana Harian)' : 'AI Daily Planner', 
      category: 'AI Assistant', 
      icon: Sparkles, 
      view: 'ai_planner' as View,
      shortcut: 'Alt+4' 
    },
    { 
      id: 'habits', 
      title: isId ? 'Pelacak Kebiasaan (Habits)' : 'Habit Tracker', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: Zap, 
      view: 'habits' as View,
      shortcut: 'Alt+5' 
    },
    { 
      id: 'targets', 
      title: isId ? 'Target Harian (Daily Targets)' : 'Daily Targets', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: Target, 
      view: 'targets' as View,
      shortcut: 'Alt+6' 
    },
    { 
      id: 'journal', 
      title: isId ? 'Jurnal Refleksi' : 'Daily Journal', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: BookOpen, 
      view: 'journal' as View,
      shortcut: 'Alt+7' 
    },
    { 
      id: 'budgets', 
      title: isId ? 'Anggaran & Tabungan' : 'Budgets & Savings', 
      category: isId ? 'Keuangan' : 'Finance', 
      icon: Wallet, 
      view: 'budgets' as View 
    },
    { 
      id: 'smart_space', 
      title: isId ? 'Ruang Pintar' : 'Smart Space', 
      category: isId ? 'Produktivitas' : 'Productivity', 
      icon: BrainCircuit, 
      view: 'smart_space' as View 
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
      icon: Settings, 
      view: 'settings' as View,
      shortcut: 'Alt+8' 
    },
    ...(onOpenShortcutsHelp ? [{
      id: 'shortcuts_help',
      title: isId ? 'Lihat Semua Pintasan Keyboard' : 'View All Keyboard Shortcuts',
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
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-xl bg-[#14151a] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 gap-2.5 bg-[#181920]">
              <Search size={16} className="text-zinc-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isId ? 'Ketik perintah atau modul (misal: Keuangan, Jadwal, AI)...' : 'Type a command or search module (e.g. Finance, Schedule, AI)...'}
                autoFocus
                className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
              />
              <Kbd className="text-[10px] text-zinc-400">ESC</Kbd>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-500">
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
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-orange-500/15 text-orange-400 border border-orange-500/25'
                          : 'text-zinc-300 hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-white/5 text-zinc-400'
                          }`}
                        >
                          <Icon size={14} />
                        </div>
                        <span className="font-medium truncate">{item.title}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {item.shortcut && (
                          <Kbd className="text-[9px] py-0 px-1 text-zinc-400 border-white/10 bg-white/5">
                            {item.shortcut}
                          </Kbd>
                        )}
                        <span className="text-[10px] font-mono text-zinc-500 uppercase">
                          {item.category}
                        </span>
                        {isSelected && <ArrowRight size={12} className="text-orange-400" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 bg-[#101114] border-t border-white/5 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-2">
                <span>Navigate: ↑ ↓</span>
                <span>•</span>
                <span>Select: ↵</span>
                <span>•</span>
                <span>Shortcuts: <Kbd className="text-[9px] py-0">?</Kbd></span>
              </span>
              <span className="flex items-center gap-1">
                <Command size={10} /> + K
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
