import React from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Wallet, 
  Calendar, 
  Target as TargetIcon, 
  TrendingUp,
  PieChart,
  BarChart3,
  Trophy,
  Settings,
  Zap,
  Sparkles,
  Globe,
  LogOut,
  BrainCircuit,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { Logo } from '../Logo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { View } from '../../types';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ activeView, setActiveView, isCollapsed, onToggleCollapse }: SidebarProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth(); // Assuming I need user info for bottom section

  const navGroups = React.useMemo(() => [
    {
      title: t('finance'),
      items: [
        { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
        { id: 'finance', label: t('finance'), icon: Wallet },
        { id: 'budgets', label: t('budgets') || 'Budgets & Savings', icon: TrendingUp },
        { id: 'visualization', label: t('financialVisualization'), icon: BarChart3 },
        { id: 'reports', label: t('analytics'), icon: PieChart },
      ]
    },
    {
      title: t('productivity'),
      items: [
        { id: 'schedule', label: t('schedule'), icon: Calendar },
        { id: 'habits', label: t('habits') || 'Habit Tracker', icon: Zap },
        { id: 'ai_planner', label: t('aiPlanner'), icon: Sparkles },
        { id: 'targets', label: t('targets'), icon: TargetIcon },
        { id: 'smart_space', label: language === 'id' ? 'AI Smart Space' : 'AI Smart Space', icon: BrainCircuit },
        { id: 'journal', label: language === 'id' ? 'Jurnal Refleksi' : 'Daily Journal', icon: BookOpen },
      ]
    },
    {
      title: t('system'),
      items: [
        { id: 'tour', label: language === 'id' ? 'Tur Pemandu' : 'Interactive Tour', icon: HelpCircle },
        { id: 'achievements', label: t('achievements'), icon: Trophy },
        { id: 'account', label: t('userAccount') || 'Account', icon: Globe },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ], [t]);

  const profileSection = React.useMemo(() => (
    <div className="flex items-center gap-2">
      {user?.photoURL ? (
        <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-6 h-6 bg-[#5e6ad2] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
          {user?.displayName?.charAt(0) || 'U'}
        </div>
      )}
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-medium text-ink truncate leading-tight">
            {user?.displayName || 'User'}
          </span>
          <span className="text-[9px] text-ink-subtle truncate leading-none">{user?.email}</span>
        </div>
      )}
    </div>
  ), [user, isCollapsed]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-canvas">
      {/* Logo Section */}
      <div className="h-[48px] px-3 flex items-center gap-[10px] border-b border-hairline shrink-0">
        <Logo className="h-6 w-auto" />
        {!isCollapsed && (
          <span className="text-[13px] font-bold text-ink tracking-tight">LIFE FLOW</span>
        )}
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold text-ink-subtle uppercase tracking-[0.5px] mt-[10px] mb-[3px]">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as View)}
                    className={`w-full h-[30px] flex items-center gap-2 px-2 rounded-[6px] cursor-pointer transition-all duration-150 group ${
                      isActive 
                        ? 'bg-[#5e6ad2]/12 text-[#5e6ad2] font-medium border-l-2 border-[#5e6ad2]' 
                        : 'text-ink-subtle hover:bg-surface-2 hover:text-ink'
                    }`}
                  >
                    <item.icon size={14} className="shrink-0" />
                    {!isCollapsed && <span className="text-[12px] truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-[10px] border-t border-hairline shrink-0 space-y-2">
        {profileSection}
        
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-[#e23b4a] hover:bg-[#e23b4a]/10 rounded-md transition-colors text-xs font-medium"
          >
            <LogOut size={14} />
            {!isCollapsed && <span>{t('signOut') || 'Keluar'}</span>}
          </button>
      </div>
    </div>
  );
}
