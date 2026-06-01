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
  BrainCircuit
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
      ]
    },
    {
      title: t('system'),
      items: [
        { id: 'achievements', label: t('achievements'), icon: Trophy },
        { id: 'account', label: t('userAccount') || 'Account', icon: Globe },
        { id: 'settings', label: t('settings'), icon: Settings },
      ]
    }
  ], [t]);

  const profileSection = React.useMemo(() => (
    <div className="flex items-center gap-3">
      {user?.photoURL ? (
        <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <div className="w-7 h-7 bg-[#5e6ad2] rounded-full flex items-center justify-center text-white font-bold text-[10px]">
          {user?.displayName?.charAt(0) || 'U'}
        </div>
      )}
      {!isCollapsed && (
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-medium text-[#f7f8f8] truncate">
            {user?.displayName || 'User'}
          </span>
          <span className="text-[10px] text-[#62666d] truncate">{user?.email}</span>
        </div>
      )}
    </div>
  ), [user, isCollapsed]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#010102]">
      {/* Logo Section */}
      <div className="h-[56px] px-4 flex items-center gap-[10px] border-b border-white/5 shrink-0">
        <Logo className="h-7 w-auto" />
        {!isCollapsed && (
          <span className="text-sm font-bold text-[#f7f8f8] tracking-tight">LIFE FLOW</span>
        )}
      </div>

      {/* Menu Section */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-2 text-[10px] font-semibold text-[#4b5563] uppercase tracking-[0.6px] mt-4 mb-2">
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
                    className={`w-full flex items-center gap-[10px] px-[10px] py-[7px] rounded-md cursor-pointer transition-all duration-150 group ${
                      isActive 
                        ? 'bg-[#5e6ad2]/12 text-[#5e6ad2] font-medium border-l-2 border-[#5e6ad2]' 
                        : 'text-[#62666d] hover:bg-white/5 hover:text-[#9ca3af]'
                    }`}
                  >
                    <item.icon size={15} className="shrink-0" />
                    {!isCollapsed && <span className="text-[13px] truncate">{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-white/5 shrink-0 space-y-3">
        {profileSection}
        
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-2 py-2 text-[#e23b4a] hover:bg-[#e23b4a]/10 rounded-md transition-colors text-xs font-medium"
          >
            <LogOut size={14} />
            {!isCollapsed && <span>{t('signOut') || 'Keluar'}</span>}
          </button>
      </div>
    </div>
  );
}
