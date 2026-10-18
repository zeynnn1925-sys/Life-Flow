import React, { useState } from 'react';
import { Bell, Moon, Sun, Menu as MenuIcon, Globe, Search, Keyboard } from 'lucide-react';
import { Logo } from '../Logo';
import DigitalClock from '../DigitalClock';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { View } from '../../types';
import { Language } from '../../translations';
import { PWAInstallButton } from '../PWAInstallButton';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { NotificationDropdown } from './NotificationDropdown';
import { Kbd } from '../ui/Kbd';

interface HeaderProps {
  activeView: View;
  onMenuToggle: () => void;
  onNavigate?: (view: View) => void;
  onOpenCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export default function Header({ 
  activeView, 
  onMenuToggle, 
  onNavigate,
  onOpenCommandPalette,
  onOpenShortcutsHelp 
}: HeaderProps) {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <div className="flex-1 flex items-center justify-between h-full w-full px-2 sm:px-4">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Logo & Brand */}
        <div className="lg:hidden flex items-center gap-2">
          <Logo className="w-7 h-7" />
          <span className="text-base font-black text-ink tracking-tight">{t('appName')}</span>
        </div>

        {/* Desktop Sidebar Toggle */}
        <button
          onClick={onMenuToggle}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-surface-2 text-ink-subtle hover:text-ink transition-colors"
          title="Toggle Menu"
        >
          <MenuIcon size={16} />
        </button>
      </div>

      {/* Middle Section - Clock & Command Palette Search */}
      <div className="hidden sm:flex flex-1 items-center justify-center gap-3 text-[12px]">
        <DigitalClock />

        {onOpenCommandPalette && (
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-2/70 hover:bg-surface-2 text-ink-subtle hover:text-ink text-xs border border-hairline transition-all cursor-pointer group"
            title="Buka Command Palette (Cmd+K / Ctrl+K)"
          >
            <Search size={13} className="text-ink-subtle group-hover:text-accent transition-colors" />
            <span className="text-[11px] font-medium text-ink-muted group-hover:text-ink">
              {language === 'id' ? 'Cari perintah...' : 'Search commands...'}
            </span>
            <Kbd className="text-[9px] py-0 px-1 text-ink-subtle border-hairline">⌘K</Kbd>
          </button>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Shortcuts Cheat Sheet Button */}
        {onOpenShortcutsHelp && (
          <button
            type="button"
            onClick={onOpenShortcutsHelp}
            className="hidden sm:flex p-2 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded-md transition-colors cursor-pointer"
            title={language === 'id' ? 'Pintasan Keyboard (?)' : 'Keyboard Shortcuts (?)'}
            aria-label="Keyboard Shortcuts"
          >
            <Keyboard size={16} />
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Language Selector Dropdown */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex p-2 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded-md transition-colors"
          title={theme === 'light' ? 'Mode Gelap' : 'Mode Terang'}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            id="bell-notification-btn"
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
            className="p-2 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded-md relative transition-colors"
            aria-label="Toggle notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-accent text-white text-[9px] font-mono font-bold rounded-full flex items-center justify-center border border-surface-1 shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </div>
  );
}
