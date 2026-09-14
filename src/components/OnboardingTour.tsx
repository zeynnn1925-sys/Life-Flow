import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, X, Trophy, MessageSquare, Heart, Compass, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { View } from '../types';

interface OnboardingTourProps {
  user: any;
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface TourStep {
  view: View;
  titleId: string;
  titleEn: string;
  textId: string;
  textEn: string;
  expression: string;
  position: 'center' | 'top-right' | 'bottom-left' | 'bottom-right' | 'sidebar' | 'middle';
}

const TOUR_STEPS: TourStep[] = [
  {
    view: 'dashboard',
    titleId: "Selamat Datang di LifeFlow",
    titleEn: "Welcome to LifeFlow",
    textId: "LifeFlow mengintegrasikan pencatatan keuangan pribadi, pelacakan target kebiasaan harian, dan perencanaan produktivitas dalam satu workspace terpadu.",
    textEn: "LifeFlow integrates personal finance tracking, daily habit targets, and productivity planning into one cohesive workspace.",
    expression: "01",
    position: 'center'
  },
  {
    view: 'dashboard',
    titleId: "Dasbor Ringkasan",
    titleEn: "Core Dashboard",
    textId: "Pantau ringkasan saldo keuangan, metrik pengeluaran 7 hari terakhir, kemajuan target aktif, dan rekomendasi aksi harian Anda.",
    textEn: "Monitor balance summaries, 7-day expense trends, active target progress, and daily action recommendations.",
    expression: "02",
    position: 'middle'
  },
  {
    view: 'finance',
    titleId: "Pencatatan Keuangan",
    titleEn: "Financial Tracker",
    textId: "Catat pemasukan dan pengeluaran secara rinci menurut dompet dan kategori. Dilengkapi dukungan sinkronisasi Google Sheets dan ekspor/impor data.",
    textEn: "Record income and expenses categorized by account and type. Features Google Sheets synchronization and data import/export.",
    expression: "03",
    position: 'middle'
  },
  {
    view: 'budgets',
    titleId: "Anggaran & Tabungan",
    titleEn: "Budgets & Savings",
    textId: "Tetapkan batas pengeluaran bulanan per kategori dan pantau alokasi target tabungan untuk menjaga kedisiplinan finansial.",
    textEn: "Set monthly category spending limits and track savings target allocations to maintain financial discipline.",
    expression: "04",
    position: 'middle'
  },
  {
    view: 'visualization',
    titleId: "Visualisasi & Analitik",
    titleEn: "Visualizations & Analytics",
    textId: "Analisis tren pengeluaran bulanan, proporsi kategori pengeluaran, dan perbandingan arus kas melalui grafik interaktif.",
    textEn: "Analyze monthly spending trends, category proportions, and cash flow dynamics through interactive charts.",
    expression: "05",
    position: 'middle'
  },
  {
    view: 'schedule',
    titleId: "Jadwal & Agenda Harian",
    titleEn: "Daily Schedule & Tasks",
    textId: "Susun agenda harian dengan checklist terstruktur agar prioritas kerja dan kegiatan penting Anda tercapai tepat waktu.",
    textEn: "Organize daily agendas with structured checklists to ensure key priorities and tasks are completed on schedule.",
    expression: "06",
    position: 'middle'
  },
  {
    view: 'habits',
    titleId: "Pelacak Kebiasaan",
    titleEn: "Habit Tracker",
    textId: "Bangun konsistensi harian dengan mencatat kebiasaan positif dan melacak catatan streak pencapaian Anda secara berkala.",
    textEn: "Build daily consistency by logging positive habits and tracking your completion streaks over time.",
    expression: "07",
    position: 'middle'
  },
  {
    view: 'ai_planner',
    titleId: "Perencana Produktivitas AI",
    titleEn: "AI Productivity Planner",
    textId: "Gunakan AI untuk merancang rekomendasi jadwal fokus harian dan target belajar terstruktur sesuai kebutuhan hari Anda.",
    textEn: "Use AI to formulate daily focused schedules and structured study targets aligned with your day's priorities.",
    expression: "08",
    position: 'middle'
  },
  {
    view: 'smart_space',
    titleId: "Ruang Fokus & Pomodoro",
    titleEn: "Focus Space & Pomodoro",
    textId: "Tingkatkan konsentrasi kerja dengan timer Pomodoro, audio fokus ambient, serta panduan teknik pernapasan.",
    textEn: "Elevate your deep work sessions with a Pomodoro timer, ambient focus soundscapes, and guided breathing exercises.",
    expression: "09",
    position: 'middle'
  },
  {
    view: 'journal',
    titleId: "Jurnal Refleksi Harian",
    titleEn: "Daily Journal",
    textId: "Tulis refleksi harian, pantau suasana hati (mood), dan simpan catatan berharga Anda secara aman di cloud Firestore.",
    textEn: "Write daily reflections, log mood trends, and store meaningful personal notes securely in Firestore cloud storage.",
    expression: "10",
    position: 'middle'
  },
  {
    view: 'dashboard',
    titleId: "Workspace Siap Digunakan",
    titleEn: "Ready to Begin",
    textId: "Semua modul telah siap digunakan. Anda dapat langsung memulai dengan mencatat transaksi pertama atau menentukan target harian.",
    textEn: "All modules are configured and ready. Start by logging your first transaction or defining your targets for the day.",
    expression: "✓",
    position: 'center'
  }
];

export default function OnboardingTour({ user, activeView, setActiveView, isOpen, onClose }: OnboardingTourProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  // Reset step to 0 when reopened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Jump page when stepping through views
  useEffect(() => {
    if (isOpen) {
      const stepData = TOUR_STEPS[currentStep];
      if (stepData && activeView !== stepData.view) {
        setActiveView(stepData.view);
      }
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];
  const total = TOUR_STEPS.length;
  const isLast = currentStep === total - 1;
  const isFirst = currentStep === 0;

  const displayName = user?.displayName?.split(' ')?.[0] || (language === 'id' ? 'Sahabat' : 'Friend');
  const rawTitle = language === 'id' ? step.titleId : step.titleEn;
  const rawText = language === 'id' ? step.textId : step.textEn;

  const processedTitle = rawTitle.replace(/Zeynnn/g, displayName);
  const processedText = rawText.replace(/Zeynnn/g, displayName);

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('lifeflow_onboarding_completed', 'true');
      onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('lifeflow_onboarding_completed', 'true');
    // Also return back to dashboard
    setActiveView('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Dark Overlay with minimal backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-all" 
        onClick={handleSkip}
      />

      {/* Floating Highlight Box pointing to viewport */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative max-w-md w-full bg-[#0b0c10] border-2 border-violet-500/30 p-6 rounded-3xl shadow-2xl shadow-black/90 pointer-events-auto overflow-hidden text-slate-100"
        >
          {/* Violet Ambient Radial Glow */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-40px] left-[-40px] w-40 h-40 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

          {/* Core Layout Header */}
          <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
            <span className="text-[10px] font-bold tracking-widest text-violet-400 uppercase flex items-center gap-1.5 px-3 py-1 bg-violet-950/40 border border-violet-500/20 rounded-full">
              {language === 'id' ? `LANGKAH ${currentStep + 1} DARI ${total}` : `STEP ${currentStep + 1} OF ${total}`}
            </span>
            <button 
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title={language === 'id' ? "Lewati Panduan" : "Skip Tour"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Step Identifier */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-violet-500/30 flex items-center justify-center font-mono font-bold text-violet-400 text-lg shrink-0 shadow-sm select-none">
              {step.expression}
            </div>

            <div>
              <h4 className="text-sm font-black text-[#f7f8f8] tracking-tight">
                {processedTitle}
              </h4>
              <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                LifeFlow Guide
              </p>
            </div>
          </div>

          {/* Tour Step Description Text section */}
          <p className="text-[12.5px] text-slate-300 leading-relaxed font-normal p-4 bg-[#11131c]/60 border border-white/5 rounded-2xl mb-6">
            {processedText}
          </p>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center bg-slate-900/30 p-2 border border-white/5 rounded-2xl">
            <div className="flex gap-1.5">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl transition-all flex items-center justify-center cursor-pointer"
                  title={language === 'id' ? "Kembali" : "Back"}
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              {/* Step indicator progress bulbs */}
              <div className="hidden sm:flex items-center gap-1 px-2">
                {Array.from({ length: total }).map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentStep 
                        ? 'w-4 bg-violet-500' 
                        : idx < currentStep 
                          ? 'w-1.5 bg-violet-500/40' 
                          : 'w-1.5 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              {!isLast ? (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3.5 py-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-slate-300 font-bold text-[11px] uppercase tracking-wide transition-all cursor-pointer"
                  >
                    {language === 'id' ? 'Selesai' : 'Skip'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-[11.5px] uppercase tracking-wide rounded-xl transition-all shadow-md shadow-violet-950/45 flex items-center gap-1.5 cursor-pointer"
                  >
                    {language === 'id' ? 'Lanjut' : 'Next'}
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11.5px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white font-bold animate-pulse" />
                  {language === 'id' ? 'Mulai Sekarang!' : 'Launch LifeFlow!'}
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
