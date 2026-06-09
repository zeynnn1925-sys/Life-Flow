import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Zap, 
  Settings2, 
  UserCircle,
  LogOut, 
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { View } from '../../types';

interface MobileNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  const { user } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'system', label: 'System', icon: Settings2 },
    { id: 'account', label: 'Account', icon: UserCircle },
  ];

  const isTabActive = (tabId: string) => {
    if (tabId === 'dashboard') return activeView === 'dashboard';
    if (tabId === 'finance') return ['finance-hub', 'finance', 'budgets', 'visualization', 'reports'].includes(activeView);
    if (tabId === 'productivity') return ['productivity-hub', 'schedule', 'habits', 'ai_planner', 'targets', 'smart_space', 'journal'].includes(activeView);
    if (tabId === 'system') return ['system-hub', 'achievements', 'settings'].includes(activeView);
    if (tabId === 'account') return activeView === 'account';
    return false;
  };

  const handleTabClick = (tabId: string) => {
    if (tabId === 'dashboard') {
      setActiveView('dashboard');
    } else if (tabId === 'finance') {
      setActiveView('finance-hub');
    } else if (tabId === 'productivity') {
      setActiveView('productivity-hub');
    } else if (tabId === 'system') {
      setActiveView('system-hub');
    } else if (tabId === 'account') {
      setActiveView('account');
    }
  };

  return (
    <div className="lg:hidden">
      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[60px] bg-surface-1/96 backdrop-blur-[20px] border-t border-hairline pb-[env(safe-area-inset-bottom,0px)] flex">
        {tabs.map((tab) => {
          const active = isTabActive(tab.id);
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] min-h-[44px] relative"
            >
              {active && (
                <div className="absolute top-[6px] w-[3px] h-[3px] rounded-full bg-[#5e6ad2]" />
              )}
              
              {tab.id === 'account' && user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className={`w-[22px] h-[22px] rounded-full object-cover transition-all ${
                    active ? 'border-[1.5px] border-[#5e6ad2]' : 'border-[1.5px] border-transparent opacity-80'
                  }`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <tab.icon 
                  size={22} 
                  strokeWidth={active ? 2.5 : 1.8}
                  className={active ? 'text-[#5e6ad2]' : 'text-[#62666d]'}
                />
              )}
              
              <span className={`text-[10px] transition-colors ${
                active ? 'text-[#5e6ad2] font-semibold' : 'text-[#62666d] font-normal'
              }`}>
                {tab.id === 'account' ? 'Akun' : tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
