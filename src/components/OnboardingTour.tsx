import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, CheckCircle, Compass } from '@phosphor-icons/react';
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
    textId: "Pantau ringkasan saldo keuangan, tren pengeluaran, kemajuan target aktif, dan prioritas aksi harian Anda secara terpusat.",
    textEn: "Monitor balance summaries, spending patterns, active target progress, and daily action priorities in one central view.",
    expression: "02",
    position: 'middle'
  },
  {
    view: 'finance',
    titleId: "Pencatatan Keuangan",
    titleEn: "Financial Tracker",
    textId: "Catat pemasukan dan pengeluaran secara rinci menurut dompet dan kategori. Dilengkapi sinkronisasi data aman.",
    textEn: "Record income and expenses categorized by account and type. Features seamless data import and export.",
    expression: "03",
    position: 'middle'
  },
  {
    view: 'budgets',
    titleId: "Anggaran & Tabungan",
    titleEn: "Budgets & Savings",
    textId: "Tetapkan batas alokasi bulanan per kategori dan pantau target tabungan untuk menjaga kedisiplinan finansial.",
    textEn: "Set monthly category spending limits and track savings target allocations to maintain financial discipline.",
    expression: "04",
    position: 'middle'
  },
  {
    view: 'visualization',
    titleId: "Visualisasi & Analitik",
    titleEn: "Visualizations & Analytics",
    textId: "Analisis tren pengeluaran bulanan, proporsi kategori belanja, dan perbandingan arus kas melalui grafik visual.",
    textEn: "Analyze monthly spending trends, category proportions, and cash flow dynamics through clean visual charts.",
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
    textId: "Bangun konsistensi harian dengan mencatat kebiasaan positif dan melacak catatan streak pencapaian Anda secara teratur.",
    textEn: "Build daily consistency by logging positive habits and tracking your completion streaks over time.",
    expression: "07",
    position: 'middle'
  },
  {
    view: 'ai_planner',
    titleId: "Rencana Fokus Hari Ini",
    titleEn: "Daily Focus Plan",
    textId: "Susun alokasi waktu dan urutan tugas harian secara otomatis agar ritme kerja terstruktur tanpa kelelahan kognitif.",
    textEn: "Organize your daily time blocks and task sequence smoothly to keep deep work structured and sustainable.",
    expression: "08",
    position: 'middle'
  },
  {
    view: 'smart_space',
    titleId: "Ruang Fokus & Pomodoro",
    titleEn: "Focus Space & Pomodoro",
    textId: "Tingkatkan konsentrasi kerja dengan timer Pomodoro, audio fokus ambient, serta panduan teknik pernapasan terarah.",
    textEn: "Elevate your deep work sessions with a Pomodoro timer, ambient focus soundscapes, and guided breathing exercises.",
    expression: "09",
    position: 'middle'
  },
  {
    view: 'journal',
    titleId: "Jurnal Refleksi Harian",
    titleEn: "Daily Journal",
    textId: "Tulis refleksi harian, pantau suasana hati (mood), dan simpan catatan berharga Anda secara aman.",
    textEn: "Write daily reflections, log mood trends, and store meaningful personal notes securely.",
    expression: "10",
    position: 'middle'
  },
  {
    view: 'dashboard',
    titleId: "Workspace Siap Digunakan",
    titleEn: "Ready to Begin",
    textId: "Semua modul telah siap digunakan. Anda dapat langsung memulai dengan mencatat transaksi pertama atau menentukan target hari ini.",
    textEn: "All modules are configured and ready. Start by logging your first transaction or setting up today's key targets.",
    expression: "11",
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
      const targetView = TOUR_STEPS[currentStep]?.view;
      if (targetView && targetView !== activeView) {
        setActiveView(targetView);
      }
    }
  }, [currentStep, isOpen, activeView, setActiveView]);

  if (!isOpen) return null;

  const total = TOUR_STEPS.length;
  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === total - 1;

  const processedTitle = language === 'id' ? step.titleId : step.titleEn;
  const processedText = language === 'id' ? step.textId : step.textEn;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem('lifeflow_onboarding_completed', 'true');
      setActiveView('dashboard');
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
    setActiveView('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Absolute Dark Overlay with minimal backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-[4px] transition-all" 
        onClick={handleSkip}
      />

      {/* Floating Highlight Box */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative max-w-md w-full bg-[#14161b] border border-white/[0.08] p-6 rounded-2xl shadow-2xl pointer-events-auto overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5 border-b border-white/[0.06] pb-3">
            <span className="text-[11px] font-mono tracking-wider text-[#C8A27C] flex items-center gap-1.5 px-2.5 py-1 bg-white/[0.03] border border-white/[0.06] rounded-md">
              <Compass size={13} weight="regular" />
              <span>{language === 'id' ? `Langkah ${currentStep + 1} dari ${total}` : `Step ${currentStep + 1} of ${total}`}</span>
            </span>
            <button 
              onClick={handleSkip}
              className="text-white/40 hover:text-white/80 p-1.5 hover:bg-white/[0.04] rounded-lg transition-all cursor-pointer"
              title={language === 'id' ? "Lewati Panduan" : "Skip Tour"}
            >
              <X size={16} weight="light" />
            </button>
          </div>

          {/* Clean Step Identifier */}
          <div className="flex items-center gap-3.5 mb-4">
            <div className="w-11 h-11 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-center font-mono font-medium text-[#C8A27C] text-sm shrink-0 select-none">
              {step.expression}
            </div>

            <div>
              <h4 className="text-sm font-medium text-white/95 tracking-normal">
                {processedTitle}
              </h4>
              <p className="text-[11px] text-white/40 font-mono tracking-wide">
                LifeFlow Workspace
              </p>
            </div>
          </div>

          {/* Tour Step Description Text */}
          <p className="text-[12.5px] text-white/70 leading-relaxed font-normal p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl mb-6">
            {processedText}
          </p>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              {!isFirst && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] text-white/60 hover:text-white rounded-lg transition-all flex items-center justify-center cursor-pointer"
                  title={language === 'id' ? "Kembali" : "Back"}
                >
                  <ArrowLeft size={14} weight="regular" />
                </button>
              )}

              {/* Step indicator progress pills */}
              <div className="hidden sm:flex items-center gap-1 px-1">
                {Array.from({ length: total }).map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-200 ${
                      idx === currentStep 
                        ? 'w-4 bg-[#C8A27C]' 
                        : idx < currentStep 
                          ? 'w-1 bg-[#C8A27C]/40' 
                          : 'w-1 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isLast ? (
                <>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="px-3 py-1.5 hover:bg-white/[0.04] rounded-lg text-white/40 hover:text-white/70 font-normal text-xs transition-colors cursor-pointer"
                  >
                    {language === 'id' ? 'Lewati' : 'Skip'}
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-1.5 bg-[#C8A27C] hover:bg-[#d8b28c] text-stone-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>{language === 'id' ? 'Lanjut' : 'Next'}</span>
                    <ArrowRight size={13} weight="regular" />
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 bg-[#C8A27C] hover:bg-[#d8b28c] text-stone-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle size={15} weight="regular" />
                  <span>{language === 'id' ? 'Mulai Sekarang' : 'Start Flowing'}</span>
                </button>
              )}
            </div>
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
