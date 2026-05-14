import React, { useState, useEffect } from 'react';
import { Bell, Clock, Calendar, Target, CreditCard, Save, CheckCircle2, ShieldAlert, ShieldCheck, Sparkles } from 'lucide-react';
import { NotificationSetting } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';

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
      case 'schedule': return <Calendar className="w-5 h-5" />;
      case 'bill': return <CreditCard className="w-5 h-5" />;
      case 'target': return <Target className="w-5 h-5" />;
      case 'habit_reminder': return <CheckCircle2 className="w-5 h-5" />;
      case 'streak_warning': return <ShieldAlert className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-full bg-[#010102] p-1">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto space-y-10 pb-20 relative z-10"
      >
      <div className="bg-surface-1 p-10 rounded-lg shadow-card border border-hairline relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-pill -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-all duration-700" />
        
        <div className="flex items-center gap-6 mb-12">
          <div className="w-14 h-14 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shadow-sm">
            <Bell className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-display-md font-black text-ink tracking-tight uppercase">{t('notificationSettings')}</h2>
            <p className="text-body-sm text-ink-tertiary mt-1.5 font-medium lowercase">{t('notificationDesc')}</p>
          </div>
        </div>

        <div className="space-y-6">
          {settings.map((setting, index) => (
            <motion.div 
              key={setting.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-8 rounded-lg bg-surface-2 border border-hairline hover:border-hairline-strong transition-all space-y-6 group/item"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-surface-1 border border-hairline-strong shadow-sm rounded-md flex items-center justify-center text-ink group-hover/item:text-accent transition-all">
                    {getIcon(setting.type)}
                  </div>
                  <div>
                    <h3 className="text-heading-sm font-black text-ink uppercase tracking-tight">{t(setting.type as any)} {t('reminders')}</h3>
                    <p className="text-caption text-ink-subtle font-medium mt-0.5">{t('getNotifiedAbout')} {t(setting.type as any)}.</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSetting(setting.id)}
                  className={`w-14 h-7 rounded-pill transition-all relative p-1 ${
                    setting.enabled ? 'bg-accent shadow-glow-accent' : 'bg-surface-3 border border-hairline'
                  }`}
                >
                  <motion.div
                    animate={{ x: setting.enabled ? 28 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-5 h-5 bg-white rounded-pill shadow-lg"
                  />
                </button>
              </div>

              <AnimatePresence>
                {setting.enabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-8 border-t border-hairline grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    <div>
                      <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-2">{t('reminderTime')}</label>
                      <div className="relative group/input">
                        <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-tertiary group-hover/input:text-accent transition-colors" />
                        <input
                          type="time"
                          value={setting.time}
                          onChange={(e) => updateTime(setting.id, e.target.value)}
                          className="w-full h-11 pl-11 pr-4 bg-surface-3 border border-hairline rounded-md outline-none focus:border-accent font-mono text-ink text-sm transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-2">{t('frequency')}</label>
                      <select
                        value={setting.frequency}
                        onChange={(e) => saveNotificationSetting({ ...setting, frequency: e.target.value as any })}
                        className="w-full h-11 px-4 bg-surface-3 border border-hairline rounded-md outline-none focus:border-accent text-ink text-sm appearance-none cursor-pointer transition-all"
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

        <div className="mt-12 pt-8 border-t border-hairline flex items-center justify-between">
          <button
            onClick={saveSettings}
            className="h-14 bg-accent text-white px-10 rounded-pill font-black text-button hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center gap-3 shadow-glow-accent uppercase tracking-widest"
          >
            <Save className="w-5 h-5" />
            {t('saveChanges')}
          </button>

          <AnimatePresence>
            {showSaved && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 text-success font-black text-eyebrow uppercase tracking-widest"
              >
                <div className="w-8 h-8 bg-success/10 rounded-md flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                {t('settingsSaved')}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-surface-2 p-8 rounded-lg border border-hairline flex items-start gap-6 relative overflow-hidden group hover:border-hairline-strong transition-all"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-pill -mr-16 -mt-16 blur-2xl" />
        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary shrink-0 shadow-sm transition-transform group-hover:rotate-12">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h4 className="text-eyebrow font-black text-primary uppercase tracking-[0.2em] mb-2">{t('proTip')}</h4>
          <p className="text-body-sm text-ink-subtle font-medium leading-relaxed italic opacity-80">
            {t('proTipDesc')}
          </p>
        </div>
      </motion.div>
    </motion.div>
    </div>
  );
}
