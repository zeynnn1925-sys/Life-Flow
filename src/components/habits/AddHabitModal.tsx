import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Bell, Clock, Info, Target, Plus, Search, Calendar, ChevronRight } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Habit, HabitCategory, HabitFrequency, HabitTimeOfDay, HabitDifficulty } from '../../types/habits';
import { Timestamp } from 'firebase/firestore';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => Promise<void>;
  initialHabit?: Habit;
}

const CATEGORIES: { id: HabitCategory; label: string; icon: string; color: string }[] = [
  { id: 'health', label: 'Health', icon: 'Heart', color: '#ef4444' },
  { id: 'mind', label: 'Mind', icon: 'Brain', color: '#8b5cf6' },
  { id: 'fitness', label: 'Fitness', icon: 'Dumbbell', color: '#f97316' },
  { id: 'finance', label: 'Finance', icon: 'Wallet', color: '#10b981' },
  { id: 'social', label: 'Social', icon: 'Users', color: '#3b82f6' },
  { id: 'creativity', label: 'Creativity', icon: 'Palette', color: '#ec4899' },
  { id: 'learning', label: 'Learning', icon: 'BookOpen', color: '#f59e0b' },
  { id: 'custom', label: 'Custom', icon: 'Plus', color: '#6366f1' },
];

const ICONS = ['Activity', 'Book', 'Coffee', 'Code', 'Dumbbell', 'Heart', 'Moon', 'Music', 'Sun', 'Smile', 'Star', 'Target', 'Zap', 'Waves'];

export function AddHabitModal({ isOpen, onClose, onSave, initialHabit }: AddHabitModalProps) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Habit>>(initialHabit || {
    title: '',
    category: 'health',
    icon: 'Activity',
    color: '#ef4444',
    frequency: 'daily',
    timeOfDay: 'anytime',
    difficulty: 'medium',
    targetCount: 1,
    unit: 'kali',
    reminderTime: '09:00',
    isArchived: false,
    order: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);
    try {
      const habit: Habit = {
        id: initialHabit?.id || `habit_${Date.now()}`,
        title: formData.title || '',
        description: formData.description,
        icon: formData.icon || 'Activity',
        color: formData.color || '#3b82f6',
        category: formData.category as HabitCategory || 'health',
        frequency: formData.frequency as HabitFrequency || 'daily',
        timeOfDay: formData.timeOfDay as HabitTimeOfDay || 'anytime',
        difficulty: formData.difficulty as HabitDifficulty || 'medium',
        targetCount: formData.targetCount || 1,
        unit: formData.unit || 'kali',
        reminderTime: formData.reminderTime,
        isArchived: formData.isArchived || false,
        createdAt: initialHabit?.createdAt || Timestamp.now(),
        order: formData.order || 0,
        currentStreak: initialHabit?.currentStreak || 0,
        longestStreak: initialHabit?.longestStreak || 0,
        totalCompletions: initialHabit?.totalCompletions || 0
      };
      await onSave(habit);
      onClose();
    } catch (error) {
      console.error('Failed to save habit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {initialHabit ? 'Edit Kebiasaan' : 'Tambah Kebiasaan Baru'}
                </h2>
                <p className="text-sm text-zinc-500">Langkah {step} dari 2</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                id="close-habit-modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Nama Kebiasaan</label>
                      <input
                        autoFocus
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Misal: Minum Air Putih"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Kategori</label>
                      <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.map((cat) => {
                          const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Circle;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.id, color: cat.color })}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                                formData.category === cat.id 
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                                  : 'border-transparent bg-zinc-50 dark:bg-zinc-800 hover:border-zinc-200'
                              }`}
                            >
                              <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                                <Icon size={18} />
                              </div>
                              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Target Harian</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={formData.targetCount}
                            onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                            className="w-20 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                          <input
                            type="text"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="flex-1 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="Unit (kali, gelas, dll)"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Waktu Pengingat</label>
                        <div className="relative">
                          <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="time"
                            value={formData.reminderTime}
                            onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Frekuensi</label>
                      <div className="flex gap-2">
                        {['daily', 'weekdays', 'weekends'].map((freq) => (
                          <button
                            key={freq}
                            type="button"
                            onClick={() => setFormData({ ...formData, frequency: freq as HabitFrequency })}
                            className={`flex-1 py-2 px-4 rounded-xl border-2 transition-all font-bold text-sm ${
                              formData.frequency === freq 
                                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' 
                                : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-10 flex gap-3">
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-2xl hover:bg-zinc-200 transition-colors"
                  >
                    Kembali
                  </button>
                )}
                
                {step === 1 ? (
                  <button
                    type="button"
                    disabled={!formData.title}
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Lanjut
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={20} />}
                    Simpan
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
