import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  ExternalLink, 
  Settings2,
  Lock,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function AccountPage() {
  const { 
    user, 
    signOut, 
    isCalendarConnected, 
    connectGoogleCalendar, 
    disconnectGoogleCalendar,
    isOutlookConnected,
    connectOutlookCalendar,
    disconnectOutlookCalendar
  } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleSignOut = () => {
    if (window.confirm(t('logoutConfirm') || "Yakin ingin keluar?")) {
      signOut();
    }
  };

  const creationDate = user?.metadata.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }) 
    : '-';

  const lastLogin = user?.metadata.lastSignInTime 
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) 
    : '-';

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-[#f7f8f8] tracking-tight">
          {t('userAccount') || 'Akun Pengguna'}
        </h1>
        <p className="text-[#8a8f98] text-sm">
          Kelola informasi profil dan keamanan akun LifeFlow Anda.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-white/5 shadow-lg shadow-black/20" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 bg-[#5e6ad2] rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-[#5e6ad2]/20">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
              
              <div className="flex-1 space-y-1">
                <h2 className="text-2xl font-bold text-[#f7f8f8]">{user?.displayName || 'User'}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#8a8f98]">
                  <div className="flex items-center gap-1.5">
                    <Mail size={14} />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{t('joined') || 'Bergabung'} {creationDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 rounded-full text-[#5e6ad2] text-[10px] font-bold uppercase tracking-wider">
                  {t('freePlan') || 'Free Plan'}
                </span>
              </div>
            </div>
          </section>

          {/* Account Details */}
          <section className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center gap-3">
              <Shield size={18} className="text-[#5e6ad2]" />
              <h3 className="font-bold text-[#f7f8f8]">{t('security') || 'Security & Privacy'}</h3>
            </div>
            <div className="divide-y divide-white/5">
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#f7f8f8]">{t('authMethod') || 'Metode Otentikasi'}</p>
                  <p className="text-xs text-[#62666d]">Akun Anda terhubung dengan Google/GitHub</p>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-md text-[11px] text-[#8a8f98]">
                  {user?.providerData[0]?.providerId || 'password'}
                </div>
              </div>
              
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#f7f8f8]">UID</p>
                  <p className="text-xs text-[#62666d] font-mono">{user?.uid}</p>
                </div>
              </div>

              <div className="p-6 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#f7f8f8]">{t('lastLogin') || 'Login Terakhir'}</p>
                  <p className="text-xs text-[#62666d]">{lastLogin}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Settings */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="font-bold text-[#f7f8f8] flex items-center gap-2">
              <Settings2 size={18} className="text-[#5e6ad2]" />
              {t('preferences') || 'Preferences'}
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[#8a8f98]">{t('language') || 'Bahasa'}</span>
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'id')}
                  className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-[#f7f8f8]"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[#8a8f98]">{t('connectedServices') || 'Layanan Terhubung'}</span>
                
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={isCalendarConnected ? disconnectGoogleCalendar : connectGoogleCalendar}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight px-3 py-2 rounded-lg transition-all ${
                      isCalendarConnected 
                        ? 'bg-[#4285F4]/10 text-[#4285F4] border border-[#4285F4]/20' 
                        : 'bg-white/5 text-[#8a8f98] border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Globe size={12} />
                    {isCalendarConnected ? t('googleCalendar') : t('connectGoogleCalendar')}
                  </button>

                  <button 
                    onClick={isOutlookConnected ? disconnectOutlookCalendar : connectOutlookCalendar}
                    className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tight px-3 py-2 rounded-lg transition-all ${
                      isOutlookConnected 
                        ? 'bg-[#0078D4]/10 text-[#0078D4] border border-[#0078D4]/20' 
                        : 'bg-white/5 text-[#8a8f98] border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Globe size={12} />
                    {isOutlookConnected ? t('outlookCalendar') : t('connectOutlookCalendar')}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-[#e23b4a]/5 border border-[#e23b4a]/20 rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-[#e23b4a] flex items-center gap-2">
              <Lock size={18} />
              Danger Zone
            </h3>
            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 p-3 bg-[#e23b4a] text-white rounded-xl text-sm font-bold hover:bg-[#c93442] transition-colors shadow-lg shadow-[#e23b4a]/20"
            >
              <LogOut size={16} />
              <span>{t('logout') || 'Keluar'}</span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
