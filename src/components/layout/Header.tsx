import React, { useState } from 'react';
import { Bell, Moon, Sun, Menu as MenuIcon, Globe } from 'lucide-react';
import { Logo } from '../Logo';
import DigitalClock from '../DigitalClock';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { View } from '../../types';
import { Language } from '../../translations';
import { SyncStatusIndicator } from '../SyncStatusIndicator';
import { PWAInstallButton } from '../PWAInstallButton';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface HeaderProps {
  activeView: View;
  onMenuToggle: () => void;
}

export default function Header({ activeView, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { notifications: inAppNotifications } = useNotifications();
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

        {/* Sync Status Badge */}
        <div className="hidden md:block">
          <SyncStatusIndicator compact />
        </div>
      </div>

      {/* Middle Section - Clock */}
      <div className="hidden sm:flex flex-1 justify-center text-[12px]">
        <DigitalClock />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* PWA Install Button */}
        <PWAInstallButton />

        {/* Sync indicator for small screens */}
        <div className="md:hidden">
          <SyncStatusIndicator compact />
        </div>

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
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-ink-subtle hover:text-ink hover:bg-surface-2 rounded-md relative transition-colors"
          >
            <Bell size={16} />
            {inAppNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-surface-1" />
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-hairline">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              className="w-7 h-7 rounded-full object-cover border border-hairline"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white font-bold text-[11px]">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
