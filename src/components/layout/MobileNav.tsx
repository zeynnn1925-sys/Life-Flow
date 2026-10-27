import React from 'react';
import { 
  SquaresFour, 
  Wallet, 
  Lightning, 
  Gear, 
  User
} from '@phosphor-icons/react';
import { useAuth } from '../../contexts/AuthContext';
import { View } from '../../types';

interface MobileNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

export default function MobileNav({ activeView, setActiveView }: MobileNavProps) {
  const { user } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: SquaresFour },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'productivity', label: 'Productivity', icon: Lightning },
    { id: 'system', label: 'System', icon: Gear },
    { id: 'account', label: 'Account', icon: User },
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[56px] bg-[#0d0e12]/95 backdrop-blur-[16px] border-t border-hairline pb-[env(safe-area-inset-bottom,0px)] flex">
        {tabs.map((tab) => {
          const active = isTabActive(tab.id);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 min-h-[44px] transition-colors"
            >
              {tab.id === 'account' && user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className={`w-[20px] h-[20px] rounded-full object-cover transition-all ${
                    active ? 'border-[1.5px] border-[#C8A27C]' : 'border-[1.5px] border-transparent opacity-70'
                  }`}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Icon 
                  size={20} 
                  weight={active ? 'regular' : 'light'}
                  className={active ? 'text-[#C8A27C]' : 'text-white/45'}
                />
              )}
              
              <span className={`text-[10px] tracking-tight transition-colors ${
                active ? 'text-[#C8A27C] font-medium' : 'text-white/45 font-normal'
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
