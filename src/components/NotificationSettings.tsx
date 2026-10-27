import React, { useState } from 'react';
import { 
  Bell, 
  Clock, 
  CalendarBlank, 
  Target, 
  CreditCard, 
  FloppyDisk, 
  CheckCircle, 
  Warning, 
  Info 
} from '@phosphor-icons/react';
import { NotificationSetting } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

export default function NotificationSettings() {
  const { t } = useLanguage();
  const { notificationSettings: settings, saveNotificationSetting } = useData();

  const [showSaved, setShowSaved] = useState(false);

  const toggleSetting = (id: string) => {
    const setting = settings.find(s => s.id === id);
    if (setting) {
      saveNotificationSetting({ ...setting, enabled: !setting.enabled });
    }
  };

  const updateTime = (id: string, time: string) => {
    const setting = settings.find(s => s.id === id);
    if (setting) {
      saveNotificationSetting({ ...setting, time });
    }
  };

  const saveSettings = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  const getIcon = (type: NotificationSetting['type']) => {
    switch (type) {
      case 'schedule': return <CalendarBlank size={20} weight="light" />;
      case 'bill': return <CreditCard size={20} weight="light" />;
      case 'target': return <Target size={20} weight="light" />;
      case 'habit_reminder': return <CheckCircle size={20} weight="light" />;
      case 'streak_warning': return <Warning size={20} weight="light" />;
      default: return <Bell size={20} weight="light" />;
    }
  };

  return (
    <div className="min-h-full bg-[#0d0e11] p-1">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto space-y-6 pb-20 relative z-10"
      >
        <div className="bg-[#14161b] p-6 sm:p-8 rounded-xl border border-white/[0.07] relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 bg-white/[0.04] border border-white/[0.08] rounded-lg flex items-center justify-center text-[#C8A27C]">
              <Bell size={22} weight="regular" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white/95 tracking-normal">{t('notificationSettings')}</h2>
              <p className="text-xs text-white/45 mt-0.5">{t('notificationDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {settings.map((setting, index) => (
              <motion.div 
                key={setting.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-5 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 bg-white/[0.03] border border-white/[0.07] rounded-lg flex items-center justify-center text-white/70">
                      {getIcon(setting.type)}
                    </div>
                    <div>
                      <h3 className="text-xs font-medium text-white/90">{t(setting.type as any)} {t('reminders')}</h3>
                      <p className="text-[11px] text-white/45 mt-0.5">{t('getNotifiedAbout')} {t(setting.type as any)}.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting(setting.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                      setting.enabled ? 'bg-[#C8A27C]' : 'bg-white/10'
                    }`}
                  >
                    <motion.div
                      animate={{ x: setting.enabled ? 20 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-5 h-5 bg-stone-950 rounded-full shadow-sm"
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {setting.enabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pt-4 border-t border-white/[0.05] grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div>
                        <label className="block text-[11px] font-mono text-white/40 mb-1.5">{t('reminderTime')}</label>
                        <div className="relative">
                          <Clock size={15} weight="light" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                          <input
                            type="time"
                            value={setting.time}
                            onChange={(e) => updateTime(setting.id, e.target.value)}
                            className="w-full h-9 pl-9 pr-3 bg-white/[0.03] border border-white/[0.08] rounded-md outline-none focus:border-[#C8A27C]/50 font-mono text-white/90 text-xs transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-white/40 mb-1.5">{t('frequency')}</label>
                        <select
                          value={setting.frequency}
                          onChange={(e) => saveNotificationSetting({ ...setting, frequency: e.target.value as any })}
                          className="w-full h-9 px-3 bg-[#181a20] border border-white/[0.08] rounded-md outline-none focus:border-[#C8A27C]/50 text-white/90 text-xs appearance-none cursor-pointer transition-colors"
                        >
                          <option value="daily">{t('daily')}</option>
                          <option value="weekly">{t('weekly')}</option>
                          <option value="once">{t('once')}</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.07] flex items-center justify-between">
            <button
              type="button"
              onClick={saveSettings}
              className="h-10 bg-[#C8A27C] text-stone-950 px-5 rounded-lg font-medium text-xs hover:bg-[#d8b28c] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <FloppyDisk size={16} weight="regular" />
              <span>{t('saveChanges')}</span>
            </button>

            <AnimatePresence>
              {showSaved && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center gap-2 text-emerald-400 font-mono text-xs"
                >
                  <CheckCircle size={16} weight="regular" />
                  <span>{t('settingsSaved')}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-[#14161b] p-5 rounded-xl border border-white/[0.07] flex items-start gap-4"
        >
          <div className="w-9 h-9 bg-white/[0.03] border border-white/[0.08] rounded-lg flex items-center justify-center text-white/60 shrink-0">
            <Info size={18} weight="light" />
          </div>
          <div>
            <h4 className="text-xs font-medium text-white/90 mb-1">{t('proTip')}</h4>
            <p className="text-[12px] text-white/50 leading-relaxed">
              {t('proTipDesc')}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
