import React from 'react';
import { Bell, Moon, Sun, Menu as MenuIcon } from 'lucide-react';
import { Logo } from '../Logo';
import DigitalClock from '../DigitalClock';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { View } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  activeView: View;
  onMenuToggle: () => void;
}

export default function Header({ activeView, onMenuToggle }: HeaderProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { notifications: inAppNotifications } = useNotifications();
  const [showNotifications, setShowNotifications] = React.useState(false);

  return (
    <div className="flex-1 flex items-center justify-between h-full w-full">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Logo & Brand */}
        <div className="lg:hidden flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-black text-[#f7f8f8] tracking-tight">{t('appName')}</span>
        </div>

        {/* Desktop Sidebar Toggle */}
        <button 
          onClick={onMenuToggle}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-md hover:bg-white/5 text-[#62666d] hover:text-[#9ca3af] transition-colors"
        >
          <MenuIcon size={20} />
        </button>
      </div>

      {/* Middle Section - Clock */}
      <div className="hidden sm:flex flex-1 justify-center">
        <DigitalClock />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 lg:gap-4">
        {/* Theme Toggle (Tablet+) */}
        <button
          onClick={toggleTheme}
          className="hidden md:flex p-2 text-[#62666d] hover:text-[#9ca3af] hover:bg-white/5 rounded-md transition-colors"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-[#62666d] hover:text-[#9ca3af] hover:bg-white/5 rounded-md relative transition-colors"
          >
            <Bell size={18} />
            {inAppNotifications.length > 0 && (
              <span className="absolute top-2 right-2 w.5 h-1.5 bg-[#e23b4a] rounded-full border border-[#010102]" />
            )}
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 lg:pl-4 border-l border-white/10 ml-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-white/10" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#5e6ad2] flex items-center justify-center text-white font-bold text-xs">
              {user?.displayName?.charAt(0) || 'U'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
