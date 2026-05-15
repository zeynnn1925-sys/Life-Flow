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
  const [showAccount, setShowAccount] = useState(false);
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    if (window.confirm("Yakin ingin keluar dari LifeFlow?")) {
      signOut();
    }
  };

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
    if (tabId === 'productivity') return ['productivity-hub', 'schedule', 'habits', 'ai_planner', 'targets'].includes(activeView);
    if (tabId === 'system') return ['system-hub', 'achievements', 'settings'].includes(activeView);
    if (tabId === 'account') return showAccount;
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
      setShowAccount(true);
    }
  };

  return (
    <div className="lg:hidden">
      {/* Backdrop */}
      <AnimatePresence>
        {showAccount && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAccount(false)}
            className="fixed inset-0 z-[48] bg-black/50 backdrop-blur-[4px]"
          />
        )}
      </AnimatePresence>

      {/* Account Sheet */}
      <AnimatePresence>
        {showAccount && (
          <motion.div 
            initial={{ translateY: '100%' }}
            animate={{ translateY: 0 }}
            exit={{ translateY: '100%' }}
            transition={{ 
              duration: 0.25,
              ease: "easeOut"
            }}
            className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-0 right-0 z-[49] bg-[#111318] border-t border-white/10 rounded-t-[16px] shadow-2xl overflow-hidden"
          >
            <div className="p-5 relative">
              <div className="w-10 h-1 bg-[#34343a] rounded-full mx-auto mb-4" />
              <button 
                onClick={() => setShowAccount(false)}
                className="absolute top-4 right-4 p-2 text-[#62666d] hover:text-white"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-4">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 bg-[#5e6ad2] rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="flex flex-col">
                  <h3 className="text-base font-semibold text-[#f7f8f8]">{user?.displayName || 'User'}</h3>
                  <p className="text-xs text-[#8a8f98]">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-t border-white/10 my-4" />
              
              <p className="text-xs text-[#62666d] mb-4">
                Bergabung sejak {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
              </p>
              
              <div className="border-t border-white/10 my-4" />

              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-3 bg-[#e23b4a]/12 border border-[#e23b4a]/25 rounded-[10px] text-[#e23b4a] text-sm font-medium hover:bg-[#e23b4a]/20 transition-all"
              >
                <LogOut size={16} />
                <span>Keluar dari LifeFlow</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 h-[60px] bg-[#0a0a0c]/96 backdrop-blur-[20px] border-t border-white/8 pb-[env(safe-area-inset-bottom,0px)] flex">
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
