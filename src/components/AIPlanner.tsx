import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, Trophy, CheckCircle2, Circle, Clock, RefreshCw, BrainCircuit, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { DailyQuote, AIProductivityPlan, AIPlanItem } from '../types';
import { generateDailyQuote, generateAIProductivityPlan } from '../services/aiProductivityService';
import { useData } from '../contexts/DataContext';
import { BackgroundBeams } from './ui/background-beams';

export default function AIPlanner() {
  const { t, language } = useLanguage();
  const { dailyQuote, aiPlan, saveDailyQuote, saveAIPlan } = useData();
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
        <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
        <div className="absolute top-4 right-4 text-accent/5 transition-transform group-hover:scale-110 duration-500">
          <Quote size={120} />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-accent text-eyebrow uppercase">
            <Sparkles size={16} />
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
                <div className="w-10 h-10 rounded-full bg-surface-2 border border-hairline flex items-center justify-center text-accent font-bold">
                  {dailyQuote.author.charAt(0)}
                </div>
                <div>
                  <div className="font-black text-ink">{dailyQuote.author}</div>
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
            className="text-eyebrow text-ink-tertiary hover:text-accent transition-all flex items-center gap-2 uppercase tracking-widest pt-4 border-t border-hairline w-full"
          >
            <RefreshCw size={14} className={loadingQuote ? 'animate-spin' : ''} /> {t('refreshQuote')}
          </button>
        </div>
      </section>

      {/* AI Plan Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-heading-md font-bold text-ink flex items-center gap-3">
              <BrainCircuit className="text-accent w-7 h-7" />
              {t('aiProductivityPlan')}
            </h2>
            <p className="text-body-sm text-ink-tertiary mt-1 max-w-lg">{t('aiPlanDesc')}</p>
          </div>
          <button 
            id="btn-regenerate-plan"
            onClick={fetchPlan}
            disabled={loadingPlan}
            className="w-12 h-12 flex items-center justify-center bg-surface-1 border border-hairline rounded-md hover:border-accent hover:text-accent transition-all disabled:opacity-50 shadow-sm"
            title={t('regeneratePlan')}
          >
            <RefreshCw className={`w-5 h-5 ${loadingPlan ? 'animate-spin' : ''}`} />
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
                  <div className="text-heading-sm font-black text-ink">{completedCount} <span className="text-ink-tertiary font-bold text-lg">/ {totalCount}</span></div>
                </div>
                <div className="text-heading-sm font-black text-accent">{Math.round(progress)}%</div>
              </div>
              <div className="h-4 bg-surface-2 rounded-pill overflow-hidden border border-hairline p-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-accent rounded-pill shadow-glow-accent"
                />
              </div>
              <div className="text-eyebrow text-ink-tertiary flex items-center gap-2 font-bold">
                <Trophy size={16} className="text-accent" />
                {t('challengesCompleted').toUpperCase()}
              </div>
            </div>

            {/* Plan Items */}
            <Reorder.Group 
              axis="y" 
              values={aiPlan.items} 
              onReorder={handleReorder} 
              className="flex flex-col gap-6"
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
                        ? 'border-hairline opacity-60 grayscale-[0.5]' 
                        : 'border-hairline hover:border-accent/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-5 flex-1">
                        <button 
                          onClick={() => toggleItem(item.id)}
                          className={`w-12 h-12 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                            item.completed ? 'bg-accent border-accent text-white shadow-glow-accent' : 'bg-surface-1 border-hairline-strong text-transparent hover:border-accent hover:text-accent/20'
                          }`}
                        >
                          <CheckCircle2 size={24} className={item.completed ? 'scale-100 opacity-100' : 'scale-50 opacity-0'} />
                        </button>
                        <div className="space-y-1">
                          <h3 className={`text-heading-xs font-bold transition-all ${item.completed ? 'text-ink-tertiary line-through' : 'text-ink'}`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 text-eyebrow text-ink-tertiary uppercase">
                            <Clock size={14} />
                            <span className="font-mono">{item.startTime} — {item.endTime}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-ink-tertiary opacity-0 group-hover:opacity-100 transition-opacity p-2 cursor-grab active:cursor-grabbing">
                        <GripVertical size={24} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className={`p-5 rounded-md border shadow-sm transition-all ${
                        item.completed ? 'bg-surface-2 border-hairline text-ink-tertiary' : 'bg-surface-2 border-hairline-strong text-ink'
                      }`}>
                        <div className="text-eyebrow text-ink-tertiary uppercase font-black mb-3 flex items-center gap-2">
                          <Trophy size={14} className="text-accent" />
                          {t('challenge')}
                        </div>
                        <p className="text-body-sm leading-relaxed">{item.challenge}</p>
                      </div>

                      {item.fieldToStudy && (
                        <div className={`p-5 rounded-md border shadow-sm transition-all ${
                          item.completed ? 'bg-surface-2 border-hairline text-ink-tertiary' : 'bg-accent/5 border-accent/20 text-ink'
                        }`}>
                          <div className="text-eyebrow text-accent uppercase font-black mb-3 flex items-center gap-2">
                            <BrainCircuit size={14} />
                            {t('fieldOfStudy')}
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center bg-surface-1 p-2 rounded-md border border-hairline">
                              <span className="text-body-sm font-bold">{item.fieldToStudy}</span>
                              <span className="text-heading-xs font-black text-accent">{item.targetPercentage}%</span>
                            </div>
                            {item.toolsNeeded && item.toolsNeeded.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 border-t border-hairline">
                                {item.toolsNeeded.map(tool => (
                                  <span key={tool} className="px-2 py-0.5 bg-surface-1 border border-hairline rounded-md text-[10px] font-bold text-ink-tertiary truncate">
                                    {tool}
                                  </span>
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
          <div className="p-16 text-center text-ink-tertiary bg-surface-1 rounded-lg border border-hairline border-dashed italic">
            {t('noPlanAvailable')}
          </div>
        )}
      </section>
    </motion.div>
    </div>
  );
}
