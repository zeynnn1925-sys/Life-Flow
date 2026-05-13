import React, { useState, useEffect } from 'react';
import { Sparkles, Quote, Trophy, CheckCircle2, Circle, Clock, RefreshCw, BrainCircuit, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { DailyQuote, AIProductivityPlan, AIPlanItem } from '../types';
import { generateDailyQuote, generateAIProductivityPlan } from '../services/aiProductivityService';
import { useData } from '../contexts/DataContext';

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Quote Section */}
      <section className="relative overflow-hidden bg-deep-space-blue p-6 lg:p-8 rounded-2xl lg:rounded-3xl shadow-xl text-white">
        <div className="absolute top-4 right-4 text-vivid-tangerine/20">
          <Quote size={120} />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-vivid-tangerine font-bold uppercase tracking-widest text-xs">
            <Sparkles size={16} />
            {t('dailyInspiration')}
          </div>
          {loadingQuote ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-white/10 rounded w-3/4" />
              <div className="h-4 bg-white/10 rounded w-1/4" />
            </div>
          ) : dailyQuote ? (
            <div className="space-y-4">
              <p className="text-2xl font-medium italic leading-relaxed">"{dailyQuote.text}"</p>
              <div>
                <div className="font-bold text-lg">— {dailyQuote.author}</div>
                <div className="text-zinc-400 dark:text-zinc-500 text-sm">{dailyQuote.field}</div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-400 dark:text-zinc-500">{t('failedToLoadQuote')}</p>
          )}
          <button 
            id="btn-refresh-quote"
            onClick={fetchQuote}
            className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <RefreshCw size={12} /> {t('refreshQuote')}
          </button>
        </div>
      </section>

      {/* AI Plan Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <BrainCircuit className="text-deep-space-blue dark:text-blue-400" />
              {t('aiProductivityPlan')}
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{t('aiPlanDesc')}</p>
          </div>
          <button 
            id="btn-regenerate-plan"
            onClick={fetchPlan}
            disabled={loadingPlan}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all text-zinc-500 dark:text-zinc-400 disabled:opacity-50"
            title={t('regeneratePlan')}
          >
            <RefreshCw className={`w-5 h-5 ${loadingPlan ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loadingPlan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : aiPlan ? (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 lg:p-6 rounded-2xl lg:rounded-3xl border border-black/5 dark:border-white/5 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-zinc-900 dark:text-zinc-100">{t('dailyChallengeProgress')}</div>
                <div className="text-vivid-tangerine font-black">{Math.round(progress)}%</div>
              </div>
              <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-vivid-tangerine"
                />
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Trophy size={14} className="text-sunflower-gold" />
                {completedCount} {t('of')} {totalCount} {t('challengesCompleted')}
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 lg:p-6 rounded-2xl lg:rounded-3xl border transition-all cursor-grab active:cursor-grabbing group ${
                      item.completed 
                        ? 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 opacity-75' 
                        : 'bg-white dark:bg-zinc-900 border-black/5 dark:border-white/5 shadow-sm hover:shadow-md hover:border-deep-space-blue/20 dark:border-blue-400/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => toggleItem(item.id)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            item.completed ? 'bg-green-100 text-green-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 hover:bg-deep-space-blue/10 dark:hover:bg-blue-400/10 hover:text-deep-space-blue dark:hover:text-blue-400'
                          }`}
                        >
                          {item.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <div>
                          <h3 className={`font-bold transition-colors ${item.completed ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-zinc-900 dark:text-zinc-100'}`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                            <Clock size={12} />
                            {item.startTime} - {item.endTime}
                          </div>
                        </div>
                      </div>
                      <div className="text-zinc-300 dark:text-zinc-600 cursor-grab active:cursor-grabbing">
                        <GripVertical size={20} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mt-4">
                      <div className={`p-3 rounded-xl text-xs font-medium transition-colors ${
                        item.completed ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500' : 'bg-sunflower-gold/10 text-sunflower-gold'
                      }`}>
                        <div className="uppercase tracking-widest font-black mb-1 opacity-50">{t('challenge')}</div>
                        {item.challenge}
                      </div>

                      {item.fieldToStudy && (
                        <div className={`p-3 rounded-xl text-xs font-medium transition-colors ${
                          item.completed ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          <div className="uppercase tracking-widest font-black mb-1 opacity-50">{t('fieldOfStudy')}</div>
                          <div className="flex justify-between items-center">
                            <span>{item.fieldToStudy}</span>
                            <span className="font-bold">{item.targetPercentage}% {t('target')}</span>
                          </div>
                          {item.toolsNeeded && item.toolsNeeded.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-current/10">
                              <span className="opacity-75">{t('toolsNeeded')}: </span>
                              {item.toolsNeeded.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        ) : (
          <div className="p-8 lg:p-12 text-center text-zinc-400 dark:text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl border border-black/5 dark:border-white/5">
            {t('noPlanAvailable')}
          </div>
        )}
      </section>
    </motion.div>
  );
}
