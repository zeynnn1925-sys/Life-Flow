import React, { useState, useEffect } from 'react';
import { 
  Quotes, 
  Trophy, 
  CheckCircle, 
  Clock, 
  ArrowsClockwise, 
  CalendarBlank, 
  DotsSixVertical, 
  GraduationCap 
} from '@phosphor-icons/react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { DailyQuote, AIProductivityPlan, AIPlanItem } from '../types';
import { generateDailyQuote, generateAIProductivityPlan } from '../services/aiProductivityService';
import { useData } from '../contexts/DataContext';
import { useNotifications } from '../contexts/NotificationContext';
import { BackgroundBeams } from './ui/background-beams';

export default function AIPlanner() {
  const { t, language } = useLanguage();
  const { dailyQuote, aiPlan, saveDailyQuote, saveAIPlan } = useData();
  const { addNotification } = useNotifications();
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!dailyQuote || dailyQuote.date !== today) {
      fetchQuote();
    }
    if (!aiPlan || aiPlan.date !== today) {
      fetchPlan();
    }
  }, [dailyQuote, aiPlan, today]);

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const newQuote = await generateDailyQuote();
      await saveDailyQuote(newQuote);
    } catch (err) {
      console.error(err);
      setError('Failed to load quote');
    } finally {
      setLoadingQuote(false);
    }
  };

  const fetchPlan = async () => {
    setLoadingPlan(true);
    try {
      const newPlan = await generateAIProductivityPlan(today, language);
      await saveAIPlan(newPlan);
      await addNotification({
        title: language === 'id' ? 'Rencana harian siap' : 'Daily plan ready',
        message: language === 'id'
          ? `${newPlan.items.length} agenda fokus telah disiapkan untuk harimu.`
          : `${newPlan.items.length} focus items prepared for your day.`,
        type: 'ai_insight',
        link: 'ai_planner',
      });
    } catch (err) {
      console.error(err);
      setError('Failed to load plan');
    } finally {
      setLoadingPlan(false);
    }
  };

  const toggleItem = async (id: string) => {
    if (!aiPlan) return;
    const newItems = aiPlan.items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    const newPlan = { ...aiPlan, items: newItems };
    await saveAIPlan(newPlan);
  };

  const handleReorder = async (newItems: AIPlanItem[]) => {
    if (!aiPlan) return;
    const newPlan = { ...aiPlan, items: newItems };
    await saveAIPlan(newPlan);
  };

  const completedCount = aiPlan?.items.filter(i => i.completed).length || 0;
  const totalCount = aiPlan?.items.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="relative min-h-full overflow-hidden p-1">
      <BackgroundBeams className="opacity-40" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8 relative z-10"
      >
        {/* Quote Section */}
      <section className="relative overflow-hidden bg-surface-1 p-8 rounded-lg shadow-card border border-hairline group">
        <div className="absolute top-4 right-4 text-accent/5 transition-transform group-hover:scale-105 duration-500 pointer-events-none">
          <Quotes size={96} weight="light" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 text-[#C8A27C] text-eyebrow uppercase tracking-widest font-semibold">
            <Quotes size={16} weight="regular" />
            {t('dailyInspiration')}
          </div>
          {loadingQuote ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-surface-2 rounded-md w-3/4" />
              <div className="h-6 bg-surface-2 rounded-md w-1/4" />
            </div>
          ) : dailyQuote ? (
            <div className="space-y-6">
              <p className="text-heading-sm font-medium italic leading-relaxed text-ink">"{dailyQuote.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-[#C8A27C] font-bold">
                  {dailyQuote.author.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-ink">{dailyQuote.author}</div>
                  <div className="text-eyebrow text-ink-tertiary uppercase">{dailyQuote.field}</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-ink-tertiary italic">{t('failedToLoadQuote')}</p>
          )}
          <button 
            id="btn-refresh-quote"
            onClick={fetchQuote}
            className="text-eyebrow text-ink-tertiary hover:text-[#C8A27C] transition-all flex items-center gap-2 uppercase tracking-widest pt-4 border-t border-hairline w-full cursor-pointer"
          >
            <ArrowsClockwise size={14} weight="regular" className={loadingQuote ? 'animate-spin' : ''} /> {t('refreshQuote')}
          </button>
        </div>
      </section>

      {/* Daily Plan Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-heading-md font-bold text-ink flex items-center gap-2.5">
              <CalendarBlank size={24} weight="regular" className="text-[#C8A27C]" />
              {language === 'id' ? 'Rencana Fokus Hari Ini' : 'Daily Focus Plan'}
            </h2>
            <p className="text-body-sm text-ink-tertiary mt-1 max-w-lg">
              {language === 'id' 
                ? 'Agenda harian terstruktur yang diprioritaskan untuk menjaga alur kerja Anda.' 
                : 'Structured focus agenda prioritized to maintain your daily workflow.'}
            </p>
          </div>
          <button 
            id="btn-regenerate-plan"
            onClick={fetchPlan}
            disabled={loadingPlan}
            className="w-10 h-10 flex items-center justify-center bg-surface-1 border border-hairline rounded-md hover:border-[#C8A27C]/60 hover:text-[#C8A27C] transition-all disabled:opacity-50 cursor-pointer"
            title={language === 'id' ? 'Perbarui Rencana' : 'Refresh Plan'}
          >
            <ArrowsClockwise size={16} weight="regular" className={`${loadingPlan ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-surface-1 border border-hairline animate-pulse rounded-lg" />
            ))}
          </div>
        ) : aiPlan ? (
          <div className="space-y-10">
            {/* Progress Bar */}
            <div className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-eyebrow text-ink-tertiary uppercase mb-1">{t('dailyChallengeProgress')}</div>
                  <div className="text-heading-sm font-bold text-ink">{completedCount} <span className="text-ink-tertiary font-normal text-base">/ {totalCount}</span></div>
                </div>
                <div className="text-heading-sm font-bold text-[#C8A27C] tabular-nums font-mono">{Math.round(progress)}%</div>
              </div>
              <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden border border-hairline p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-[#C8A27C] rounded-full"
                />
              </div>
              <div className="text-eyebrow text-ink-tertiary flex items-center gap-2 font-medium">
                <Trophy size={16} weight="light" className="text-[#C8A27C]" />
                {t('challengesCompleted')}
              </div>
            </div>

            {/* Plan Items */}
            <Reorder.Group 
              axis="y" 
              values={aiPlan.items} 
              onReorder={handleReorder} 
              className="flex flex-col gap-4"
            >
              <AnimatePresence mode="popLayout">
                {aiPlan.items.map((item, index) => (
                  <Reorder.Item
                    key={item.id}
                    value={item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 bg-surface-1 rounded-lg border shadow-card transition-all cursor-grab active:cursor-grabbing group ${
                      item.completed 
                        ? 'border-hairline opacity-60' 
                        : 'border-hairline hover:border-hairline-strong'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <button 
                          onClick={() => toggleItem(item.id)}
                          className={`w-9 h-9 rounded-md border flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                            item.completed ? 'bg-[#C8A27C] border-[#C8A27C] text-stone-950' : 'bg-surface-1 border-hairline hover:border-[#C8A27C]'
                          }`}
                        >
                          <CheckCircle size={20} weight={item.completed ? "fill" : "light"} className={item.completed ? 'opacity-100' : 'opacity-0'} />
                        </button>
                        <div className="space-y-1">
                          <h3 className={`text-sm font-semibold transition-all ${item.completed ? 'text-ink-tertiary line-through' : 'text-ink'}`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 text-eyebrow text-ink-tertiary">
                            <Clock size={13} weight="light" />
                            <span className="font-mono tabular-nums text-xs">{item.startTime} – {item.endTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-grab active:cursor-grabbing">
                        <DotsSixVertical size={20} weight="light" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className={`p-4 rounded-md border transition-all ${
                        item.completed ? 'bg-surface-2 border-hairline text-ink-tertiary' : 'bg-surface-2 border-hairline text-ink'
                      }`}>
                        <div className="text-eyebrow text-ink-tertiary uppercase font-medium mb-2 flex items-center gap-1.5">
                          <Trophy size={14} weight="light" className="text-[#C8A27C]" />
                          {t('challenge')}
                        </div>
                        <p className="text-body-sm leading-relaxed text-ink-subtle">{item.challenge}</p>
                      </div>

                      {item.fieldToStudy && (
                        <div className={`p-4 rounded-md border transition-all ${
                          item.completed ? 'bg-surface-2 border-hairline text-ink-tertiary' : 'bg-surface-2 border-hairline text-ink'
                        }`}>
                          <div className="text-eyebrow text-[#C8A27C] uppercase font-medium mb-2 flex items-center gap-1.5">
                            <GraduationCap size={15} weight="light" />
                            {t('fieldOfStudy')}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center bg-surface-1 p-2 rounded border border-hairline">
                              <span className="text-body-sm font-medium">{item.fieldToStudy}</span>
                              <span className="text-xs font-mono tabular-nums font-bold text-[#C8A27C]">{item.targetPercentage}%</span>
                            </div>
                            {item.toolsNeeded && item.toolsNeeded.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1.5 pt-2 text-xs text-ink-tertiary">
                                {item.toolsNeeded.map((tool, idx) => (
                                  <React.Fragment key={tool}>
                                    {idx > 0 && <span aria-hidden="true" className="text-ink-tertiary/40">·</span>}
                                    <span>{tool}</span>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        ) : (
          <div className="p-12 text-center text-ink-tertiary bg-surface-1 rounded-lg border border-hairline border-dashed italic">
            {t('noPlanAvailable')}
          </div>
        )}
      </section>
    </motion.div>
    </div>
  );
}
