import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Bell, Clock, Info, Target, Plus, Search, Calendar, ChevronRight, Trash2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Habit, HabitCategory, HabitFrequency, HabitTimeOfDay, HabitDifficulty } from '../../types/habits';
import { Timestamp } from 'firebase/firestore';
import { useLanguage } from '../../contexts/LanguageContext';
import { ConfirmationModal } from '../ConfirmationModal';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habit: Habit) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  initialHabit?: Habit;
}

const CATEGORIES: { id: HabitCategory; labelEn: string; labelId: string; labelEs: string; labelDe: string; labelAr: string; icon: string; color: string }[] = [
  { id: 'health', labelEn: 'Health', labelId: 'Kesehatan', labelEs: 'Salud', labelDe: 'Gesundheit', labelAr: 'صحة', icon: 'Heart', color: '#ef4444' },
  { id: 'mind', labelEn: 'Mind', labelId: 'Pikiran', labelEs: 'Mente', labelDe: 'Geist', labelAr: 'عقل', icon: 'Brain', color: '#8b5cf6' },
  { id: 'fitness', labelEn: 'Fitness', labelId: 'Kebugaran', labelEs: 'Fitness', labelDe: 'Fitness', labelAr: 'لياقة', icon: 'Dumbbell', color: '#f97316' },
  { id: 'finance', labelEn: 'Finance', labelId: 'Keuangan', labelEs: 'Finanzas', labelDe: 'Finanzen', labelAr: 'مالية', icon: 'Wallet', color: '#10b981' },
  { id: 'social', labelEn: 'Social', labelId: 'Sosial', labelEs: 'Social', labelDe: 'Sozial', labelAr: 'اجتماعي', icon: 'Users', color: '#3b82f6' },
  { id: 'creativity', labelEn: 'Creativity', labelId: 'Kreativitas', labelEs: 'Creatividad', labelDe: 'Kreativität', labelAr: 'إبداع', icon: 'Palette', color: '#ec4899' },
  { id: 'learning', labelEn: 'Learning', labelId: 'Belajar', labelEs: 'Aprendizaje', labelDe: 'Lernen', labelAr: 'تعلم', icon: 'BookOpen', color: '#f59e0b' },
  { id: 'custom', labelEn: 'Custom', labelId: 'Kustom', labelEs: 'Personalizado', labelDe: 'Benutzerdef.', labelAr: 'مخصص', icon: 'Plus', color: '#6366f1' },
];

export function AddHabitModal({ isOpen, onClose, onSave, onDelete, initialHabit }: AddHabitModalProps) {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<Habit>>(initialHabit || {
    title: '',
    category: 'health',
    icon: 'Activity',
    color: '#ef4444',
    frequency: 'daily',
    timeOfDay: 'anytime',
    difficulty: 'medium',
    targetCount: 1,
    unit: language === 'id' ? 'kali' : language === 'es' ? 'veces' : language === 'de' ? 'mal' : language === 'ar' ? 'مرات' : 'times',
    reminderTime: '09:00',
    isArchived: false,
    order: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalCompletions: 0
  });

  const getCategoryLabel = (cat: typeof CATEGORIES[0]) => {
    switch (language) {
      case 'id': return cat.labelId;
      case 'es': return cat.labelEs;
      case 'de': return cat.labelDe;
      case 'ar': return cat.labelAr;
      default: return cat.labelEn;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    
    setLoading(true);
    try {
      const habit: Habit = {
        id: initialHabit?.id || `habit_${Date.now()}`,
        title: formData.title || '',
        description: formData.description || '',
        icon: formData.icon || 'Activity',
        color: formData.color || '#3b82f6',
        category: formData.category as HabitCategory || 'health',
        frequency: formData.frequency as HabitFrequency || 'daily',
        timeOfDay: formData.timeOfDay as HabitTimeOfDay || 'anytime',
        difficulty: formData.difficulty as HabitDifficulty || 'medium',
        targetCount: formData.targetCount || 1,
        unit: formData.unit || (language === 'id' ? 'kali' : 'times'),
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
            className="relative w-full max-w-xl bg-surface-1 rounded-lg shadow-modal overflow-hidden border border-hairline"
          >
            <div className="p-8 border-b border-hairline flex items-center justify-between bg-surface-1/50 backdrop-blur-md">
              <div>
                <h2 className="text-heading-sm font-black text-ink uppercase tracking-tight">
                  {initialHabit 
                    ? (language === 'id' ? 'Edit Kebiasaan' : language === 'es' ? 'Editar Hábito' : language === 'de' ? 'Gewohnheit bearbeiten' : language === 'ar' ? 'تعديل العادة' : 'Edit Habit')
                    : (language === 'id' ? 'Tambah Kebiasaan Baru' : language === 'es' ? 'Agregar Nuevo Hábito' : language === 'de' ? 'Neue Gewohnheit hinzufügen' : language === 'ar' ? 'إضافة عادة جديدة' : 'Add New Habit')}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">
                    {language === 'id' ? `Langkah ${step} dari 2` : language === 'es' ? `Paso ${step} de 2` : language === 'de' ? `Schritt ${step} von 2` : language === 'ar' ? `الخطوة ${step} من 2` : `Step ${step} of 2`}
                  </p>
                  <div className="w-12 h-1 bg-surface-2 rounded-pill overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: step === 1 ? '50%' : '100%' }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center hover:bg-surface-2 rounded-md transition-all text-ink-tertiary hover:text-accent"
                id="close-habit-modal"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-8"
                  >
                    <div>
                      <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-3">
                        {language === 'id' ? 'Nama Kebiasaan' : language === 'es' ? 'Nombre del Hábito' : language === 'de' ? 'Name der Gewohnheit' : language === 'ar' ? 'اسم العادة' : 'Habit Name'}
                      </label>
                      <input
                        autoFocus
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full h-14 px-6 bg-surface-2 border border-hairline rounded-md outline-none focus:border-accent font-black text-ink text-body-lg transition-all placeholder:font-medium placeholder:text-ink-tertiary/20"
                        placeholder={language === 'id' ? 'Misal: Minum Air Putih' : language === 'es' ? 'Ej: Beber 2L de agua' : language === 'de' ? 'z.B.: 2L Wasser trinken' : language === 'ar' ? 'مثال: شرب الماء' : 'e.g. Drink 2L Water'}
                      />
                    </div>

                    <div>
                      <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-4">
                        {language === 'id' ? 'Kategori' : language === 'es' ? 'Categoría' : language === 'de' ? 'Kategorie' : language === 'ar' ? 'الفئة' : 'Category'}
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {CATEGORIES.map((cat) => {
                          const Icon = (LucideIcons as any)[cat.icon] || LucideIcons.Circle;
                          const isSelected = formData.category === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, category: cat.id, color: cat.color })}
                              className={`group flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all active:scale-95 ${
                                isSelected 
                                  ? 'border-accent bg-surface-2 shadow-sm' 
                                  : 'border-transparent bg-surface-2 hover:border-hairline-strong'
                              }`}
                            >
                              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-inner transition-transform group-hover:scale-110" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                <Icon size={24} />
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-accent' : 'text-ink-tertiary'}`}>{getCategoryLabel(cat)}</span>
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
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-3">
                          {language === 'id' ? 'Target Harian' : language === 'es' ? 'Meta Diaria' : language === 'de' ? 'Tagesziel' : language === 'ar' ? 'الهدف اليومي' : 'Daily Target'}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={formData.targetCount}
                            onChange={(e) => setFormData({ ...formData, targetCount: parseInt(e.target.value) })}
                            className="w-24 h-14 px-4 bg-surface-2 border border-hairline rounded-md outline-none focus:border-accent text-center font-mono font-black text-ink text-body-lg shadow-inner"
                          />
                          <input
                            type="text"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            className="flex-1 h-14 px-6 bg-surface-2 border border-hairline rounded-md outline-none focus:border-accent font-black text-ink text-body-lg shadow-inner"
                            placeholder={language === 'id' ? 'Unit (gelas, jam...)' : language === 'es' ? 'Unidad (vasos, horas...)' : language === 'de' ? 'Einheit (Gläser, Std...)' : language === 'ar' ? 'الوحدة (أكواب، ساعات...)' : 'Unit (glasses, hours...)'}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-3">
                          {language === 'id' ? 'Waktu Pengingat' : language === 'es' ? 'Hora del Recordatorio' : language === 'de' ? 'Erinnerungszeit' : language === 'ar' ? 'وقت التذكير' : 'Reminder Time'}
                        </label>
                        <div className="relative group/input">
                          <Clock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary group-hover/input:text-accent transition-colors" />
                          <input
                            type="time"
                            value={formData.reminderTime}
                            onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                            className="w-full h-14 pl-12 pr-4 bg-surface-2 border border-hairline rounded-md outline-none focus:border-accent font-mono font-black text-ink text-body-lg shadow-inner transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mb-4">
                        {language === 'id' ? 'Frekuensi' : language === 'es' ? 'Frecuencia' : language === 'de' ? 'Häufigkeit' : language === 'ar' ? 'التكرار' : 'Frequency'}
                      </label>
                      <div className="flex gap-4">
                        {['daily', 'weekdays', 'weekends'].map((freq) => {
                          const isSelected = formData.frequency === freq;
                          const label = freq === 'weekdays' 
                            ? (language === 'id' ? 'Hari Kerja' : language === 'es' ? 'Días Laborables' : language === 'de' ? 'Werktage' : language === 'ar' ? 'أيام العمل' : 'Weekdays')
                            : freq === 'weekends'
                            ? (language === 'id' ? 'Akhir Pekan' : language === 'es' ? 'Fines de Semana' : language === 'de' ? 'Wochenende' : language === 'ar' ? 'عطلة نهاية الأسبوع' : 'Weekends')
                            : (language === 'id' ? 'Setiap Hari' : language === 'es' ? 'Todos los Días' : language === 'de' ? 'Täglich' : language === 'ar' ? 'يوميًا' : 'Every Day');
                          return (
                            <button
                              key={freq}
                              type="button"
                              onClick={() => setFormData({ ...formData, frequency: freq as HabitFrequency })}
                              className={`flex-1 h-14 rounded-md border-2 transition-all font-black text-eyebrow uppercase tracking-widest active:scale-[0.98] ${
                                isSelected 
                                  ? 'border-accent bg-accent text-white' 
                                  : 'border-hairline bg-surface-2 text-ink-tertiary hover:border-hairline-strong shadow-sm'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-12 flex flex-col gap-3">
                <div className="flex gap-4">
                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 h-14 bg-surface-2 text-ink-tertiary font-black text-button uppercase tracking-widest rounded-pill border border-hairline hover:bg-surface-3 transition-colors"
                    >
                      {language === 'id' ? 'Kembali' : language === 'es' ? 'Atrás' : language === 'de' ? 'Zurück' : language === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button
                      type="button"
                      disabled={!formData.title}
                      onClick={() => setStep(2)}
                      className="flex-1 h-14 bg-accent text-white font-black text-button uppercase tracking-widest rounded-pill hover:bg-accent-hover transition-all shadow-glow-accent disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {language === 'id' ? 'Lanjut' : language === 'es' ? 'Siguiente' : language === 'de' ? 'Weiter' : language === 'ar' ? 'التالي' : 'Next'}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-14 bg-accent text-white font-black text-button uppercase tracking-widest rounded-pill hover:bg-accent-hover transition-all shadow-glow-accent disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                    >
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={24} />}
                      {t('save')}
                    </button>
                  )}
                </div>

                {initialHabit && onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full h-12 bg-danger/10 text-danger hover:bg-danger hover:text-white font-black text-button uppercase tracking-widest rounded-pill transition-all flex items-center justify-center gap-2 border border-danger/20"
                  >
                    <Trash2 size={16} />
                    {language === 'id' ? 'Hapus Kebiasaan' : language === 'es' ? 'Eliminar Hábito' : language === 'de' ? 'Gewohnheit löschen' : language === 'ar' ? 'حذف العادة' : 'Delete Habit'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title={language === 'id' ? 'Hapus Kebiasaan' : language === 'es' ? 'Eliminar Hábito' : language === 'de' ? 'Gewohnheit löschen' : language === 'ar' ? 'حذف العادة' : 'Delete Habit'}
        message={language === 'id' ? 'Apakah Anda yakin ingin menghapus kebiasaan ini? Semua riwayat dan statistik kebiasaan ini akan hilang.' : language === 'es' ? '¿Estás seguro de que deseas eliminar este hábito? Se perderán todos sus historiales y estadísticas.' : language === 'de' ? 'Möchtest du diese Gewohnheit wirklich löschen? Alle Verläufe gehen verloren.' : language === 'ar' ? 'هل أنت متأكد من رغبتك في حذف هذه العادة؟ سيتم مسح السجل والإحصائيات.' : 'Are you sure you want to delete this habit? All history and statistics for this habit will be lost.'}
        confirmText={language === 'id' ? 'Hapus' : language === 'es' ? 'Eliminar' : language === 'de' ? 'Löschen' : language === 'ar' ? 'حذف' : 'Delete'}
        cancelText={language === 'id' ? 'Batal' : language === 'es' ? 'Cancelar' : language === 'de' ? 'Abbrechen' : language === 'ar' ? 'إلغاء' : 'Cancel'}
        type="danger"
        onConfirm={async () => {
          if (initialHabit && onDelete) {
            await onDelete(initialHabit.id);
          }
          setShowDeleteConfirm(false);
          onClose();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </AnimatePresence>
  );
}
