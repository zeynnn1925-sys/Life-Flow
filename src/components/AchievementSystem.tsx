import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Star, Award, Zap, Target, CheckCircle2, Lock } from 'lucide-react';
import { Achievement, Target as TargetType, Transaction, Task } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { LampContainer } from './ui/lamp';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_target',
    title: 'first_step_title',
    description: 'first_step_desc',
    icon: 'Target',
    points: 100,
    requirement: { type: 'target_complete', value: 1 }
  },
  {
    id: 'target_master',
    title: 'goal_crusher_title',
    description: 'goal_crusher_desc',
    icon: 'Zap',
    points: 500,
    requirement: { type: 'target_complete', value: 5 }
  },
  {
    id: 'saver_pro',
    title: 'smart_saver_title',
    description: 'smart_saver_desc',
    icon: 'Award',
    points: 300,
    requirement: { type: 'finance_balance', value: 1000000 }
  },
  {
    id: 'task_warrior',
    title: 'productivity_king_title',
    description: 'productivity_king_desc',
    icon: 'Trophy',
    points: 1000,
    requirement: { type: 'task_streak', value: 10 }
  }
];

export default function AchievementSystem() {
  const { t } = useLanguage();
  const { unlockedAchievements, saveUnlockedAchievement, targets, transactions, tasks } = useData();

  // ... (stats useMemo unchanged)

  const stats = useMemo(() => {
    const completedTargets = targets.filter(t => t.currentValue >= t.targetValue).length;
    const balance = transactions.reduce((acc, t) => t.type === 'income' ? acc + t.amount : acc - t.amount, 0);
    const completedTasks = tasks.filter(t => t.completed).length;

    return { completedTargets, balance, completedTasks };
  }, [targets, transactions, tasks]);

  useEffect(() => {
    const newUnlocked = [...unlockedAchievements];
    let changed = false;

    INITIAL_ACHIEVEMENTS.forEach(achievement => {
      if (newUnlocked.some(a => a.id === achievement.id)) return;

      let met = false;
      if (achievement.requirement.type === 'target_complete' && stats.completedTargets >= achievement.requirement.value) met = true;
      if (achievement.requirement.type === 'finance_balance' && stats.balance >= achievement.requirement.value) met = true;
      if (achievement.requirement.type === 'task_streak' && stats.completedTasks >= achievement.requirement.value) met = true;

      if (met) {
        newUnlocked.push({ id: achievement.id, unlockedAt: new Date().toISOString() });
        changed = true;
        saveUnlockedAchievement(achievement.id, new Date().toISOString());
      }
    });
  }, [stats, unlockedAchievements, saveUnlockedAchievement]);

  const totalPoints = INITIAL_ACHIEVEMENTS
    .filter(a => unlockedAchievements.some(ua => ua.id === a.id))
    .reduce((acc, a) => acc + a.points, 0);

  const getIcon = (iconName: string, unlocked: boolean) => {
    const props = { className: `w-8 h-8 ${unlocked ? 'text-accent' : 'text-ink-tertiary opacity-40'}` };
    switch (iconName) {
      case 'Target': return <Target {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      default: return <Star {...props} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950">
        <LampContainer className="h-[25rem] w-full pt-10">
          <motion.div
            initial={{ opacity: 0.5, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              ease: "easeInOut",
            }}
            className="flex flex-col items-center"
          >
            <Trophy className="w-16 h-16 text-accent mb-6 drop-shadow-glow" />
            <h2 className="bg-gradient-to-br from-slate-100 to-slate-400 py-4 bg-clip-text text-center text-5xl font-black tracking-tight text-transparent md:text-7xl uppercase">
              {t('yourAchievements')}
            </h2>
            <div className="flex items-baseline gap-4 mt-4">
              <span className="text-6xl font-black text-accent font-mono tracking-tighter drop-shadow-sm">{totalPoints}</span>
              <span className="text-eyebrow font-black uppercase tracking-widest text-slate-400">{t('totalPoints')}</span>
            </div>
          </motion.div>
        </LampContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_ACHIEVEMENTS.map((achievement, index) => {
          const isUnlocked = unlockedAchievements.some(ua => ua.id === achievement.id);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-8 rounded-lg border transition-all relative overflow-hidden group ${
                isUnlocked 
                  ? 'bg-surface-1 border-hairline shadow-card hover:border-accent hover:shadow-glow-accent' 
                  : 'bg-surface-2 border-hairline opacity-60'
              }`}
            >
              {isUnlocked && (
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              )}
              
              <div className="flex items-start justify-between mb-8">
                <div className={`w-14 h-14 rounded-md flex items-center justify-center border shadow-sm transition-all group-hover:scale-110 ${
                  isUnlocked ? 'bg-surface-2 border-hairline-strong shadow-glow-accent/10' : 'bg-surface-3 border-hairline'
                }`}>
                  {isUnlocked ? getIcon(achievement.icon, true) : <Lock className="w-5 h-5 text-ink-tertiary" />}
                </div>
                <div className={`text-eyebrow font-black px-3 py-1.5 rounded-md border tracking-widest shadow-sm ${
                  isUnlocked ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-surface-3 border-hairline text-ink-tertiary'
                }`}>
                  {achievement.points} PTS
                </div>
              </div>
              
              <h3 className={`text-heading-sm font-black transition-colors ${isUnlocked ? 'text-ink' : 'text-ink-tertiary'}`}>
                {t(achievement.title as any).toUpperCase()}
              </h3>
              <p className={`text-body-sm mt-2 font-medium ${isUnlocked ? 'text-ink-subtle' : 'text-ink-tertiary'}`}>
                {t(achievement.description as any)}
              </p>

              {isUnlocked && (
                <div className="mt-8 flex items-center gap-2 text-accent text-eyebrow font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  {t('unlocked')}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
