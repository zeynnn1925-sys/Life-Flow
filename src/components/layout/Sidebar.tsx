import React, { useState } from 'react';
import {
  SquaresFour,
  Coins,
  Wallet,
  ChartPieSlice,
  ChartLineUp,
  CalendarBlank,
  Repeat,
  Sparkle,
  Target,
  Headphones,
  BookOpenText,
  Compass,
  Trophy,
  User,
  Gear,
  TerminalWindow,
  SignOut,
  IconProps
} from '@phosphor-icons/react';
import { Logo } from '../Logo';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { View } from '../../types';
import { PWAInstallButton } from '../PWAInstallButton';
import { AboutDeveloperModal } from '../AboutDeveloperModal';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps>;
}

export default function Sidebar({ activeView, setActiveView, isCollapsed }: SidebarProps) {
  const { t, language } = useLanguage();
  const { user, signOut } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

  const navGroups = React.useMemo(() => [
    {
      title: t('finance') || 'Finance',
      items: [
        { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: SquaresFour },
        { id: 'finance', label: t('finance') || 'Finance', icon: Coins },
        { id: 'budgets', label: t('budgets') || 'Budgets & Savings', icon: Wallet },
        { id: 'visualization', label: t('financialVisualization') || 'Financial Visualization', icon: ChartPieSlice },
        { id: 'reports', label: t('analytics') || 'Analytics', icon: ChartLineUp },
      ] as NavItemConfig[]
    },
    {
      title: t('productivity') || 'Productivity',
      items: [
        { id: 'schedule', label: t('schedule') || 'Schedule', icon: CalendarBlank },
        { id: 'habits', label: t('habits') || 'Habit Tracker', icon: Repeat },
        { id: 'ai_planner', label: t('aiPlanner') || 'AI Planner', icon: Sparkle },
        { id: 'targets', label: t('targets') || 'Daily Targets', icon: Target },
        { 
          id: 'smart_space', 
          label: t('smartSpace') || (language === 'es' ? 'Espacio Inteligente' : language === 'ar' ? 'المساحة الذكية' : language === 'de' ? 'Smart Space' : language === 'id' ? 'Ruang Pintar' : 'Smart Space'), 
          icon: Headphones 
        },
        { 
          id: 'journal', 
          label: t('journal') || (language === 'es' ? 'Diario y Reflexión' : language === 'ar' ? 'اليوميات والتأمل' : language === 'de' ? 'Journal & Reflexion' : language === 'id' ? 'Jurnal Refleksi' : 'Daily Journal'), 
          icon: BookOpenText 
        },
      ] as NavItemConfig[]
    },
    {
      title: t('system') || 'System',
      items: [
        { 
          id: 'tour', 
          label: language === 'es' ? 'Guía Interactiva' : language === 'ar' ? 'الجولة الإرشادية' : language === 'de' ? 'Interaktive Tour' : language === 'id' ? 'Tur Pemandu' : 'Interactive Tour', 
          icon: Compass 
        },
        { id: 'achievements', label: t('achievements') || 'Achievements', icon: Trophy },
        { id: 'account', label: t('userAccount') || 'Account', icon: User },
        { id: 'settings', label: t('settings') || 'Settings', icon: Gear },
      ] as NavItemConfig[]
    }
  ], [t, language]);

  const navShortcuts: Record<string, string> = {
    dashboard: '⌥1',
    finance: '⌥2',
    schedule: '⌥3',
    ai_planner: '⌥4',
    habits: '⌥5',
  };

  const formatSentenceCase = (text: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div 
      className="lifeflow-sidebar h-full flex flex-col overflow-hidden bg-canvas select-none"
      style={{ '--nav-accent': '#C8A27C' } as React.CSSProperties}
    >
      <style>{`
        .lifeflow-sidebar {
          --nav-accent: #C8A27C;
        }
        .lifeflow-sidebar .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          border-radius: 10px;
          color: rgba(255, 255, 255, .52);
          transition: background .18s ease, color .18s ease;
          height: 36px;
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          box-shadow: none;
        }
        .lifeflow-sidebar .nav-item:hover {
          background: rgba(255, 255, 255, .035);
          color: rgba(255, 255, 255, .92);
        }
        .lifeflow-sidebar .nav-item.active {
          background: rgba(255, 255, 255, .05);
          color: rgba(255, 255, 255, .95);
        }
        .lifeflow-sidebar .nav-item.active svg {
          color: var(--nav-accent);
        }
        .lifeflow-sidebar .nav-section-title {
          font-size: 11.5px;
          line-height: 1.2;
          color: rgba(255, 255, 255, .32);
          font-weight: 400;
          letter-spacing: normal;
          padding-left: 12px;
          padding-right: 12px;
          margin-bottom: 4px;
        }
        .lifeflow-sidebar .nav-shortcut {
          opacity: 0;
          transition: opacity .18s ease;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px;
          color: rgba(255, 255, 255, .92);
          margin-left: auto;
          flex-shrink: 0;
        }
        .lifeflow-sidebar .nav-item:hover .nav-shortcut {
          opacity: 0.4;
        }
      `}</style>

      {/* Header / Logo */}
      <div className="h-[48px] px-3.5 flex items-center gap-2.5 border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <Logo className="w-5 h-5 rounded-md" />
        {!isCollapsed && (
          <span className="text-[13px] font-medium tracking-normal text-[rgba(255,255,255,0.88)]">
            LifeFlow
          </span>
        )}
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {navGroups.map((group, groupIndex) => (
          <div 
            key={group.title} 
            className="space-y-[2px]"
            style={{ marginTop: groupIndex === 0 ? '4px' : '20px' }}
          >
            {!isCollapsed && (
              <div className="nav-section-title">
                {formatSentenceCase(group.title)}
              </div>
            )}

            <div className="space-y-[2px]">
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                const shortcutHint = navShortcuts[item.id];
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as View)}
                    title={shortcutHint ? `${item.label} (${shortcutHint})` : item.label}
                    className={`nav-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center !px-0' : ''}`}
                  >
                    <IconComponent
                      size={18}
                      weight={isActive ? 'regular' : 'light'}
                      className="shrink-0"
                    />

                    {!isCollapsed && (
                      <span className="text-[12.5px] truncate font-normal">
                        {item.label}
                      </span>
                    )}

                    {!isCollapsed && shortcutHint && (
                      <span className="nav-shortcut">
                        {shortcutHint}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-2 border-t border-[rgba(255,255,255,0.06)] shrink-0 space-y-1">
        {!isCollapsed && <PWAInstallButton variant="sidebar" />}

        {/* Profile */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-[10px] ${isCollapsed ? 'justify-center !px-0' : ''}`}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-5 h-5 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div 
              className="w-5 h-5 rounded-full flex items-center justify-center font-medium text-[9.5px] shrink-0"
              style={{ background: 'rgba(200, 162, 124, 0.15)', color: '#C8A27C' }}
            >
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-[11.5px] font-normal text-[rgba(255,255,255,0.78)] truncate leading-tight">
                {user?.displayName || 'User'}
              </span>
              <span className="text-[9.5px] text-[rgba(255,255,255,0.36)] truncate font-mono leading-none mt-0.5">
                {user?.email}
              </span>
            </div>
          )}
        </div>

        {/* About Developer */}
        <button
          onClick={() => setShowAbout(true)}
          className={`nav-item ${isCollapsed ? 'justify-center !px-0' : ''}`}
          title={language === 'id' ? 'Tentang Pengembang' : 'About Developer'}
        >
          <TerminalWindow size={18} weight="light" className="shrink-0" />
          {!isCollapsed && (
            <span className="text-[12.5px] truncate font-normal">
              {language === 'id' ? 'Tentang Pengembang' : 'About Developer'}
            </span>
          )}
        </button>

        {/* Sign Out */}
        <button
          onClick={() => signOut()}
          className={`nav-item ${isCollapsed ? 'justify-center !px-0' : ''}`}
          title={t('signOut') || 'Keluar'}
        >
          <SignOut size={18} weight="light" className="shrink-0" />
          {!isCollapsed && (
            <span className="text-[12.5px] truncate font-normal">
              {t('signOut') || 'Keluar'}
            </span>
          )}
        </button>
      </div>

      <AboutDeveloperModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
