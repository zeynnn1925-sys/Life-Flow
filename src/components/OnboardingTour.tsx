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
    titleId: "👋 Halo Zeynnn! Selamat Datang!",
    titleEn: "👋 Welcome Zeynnn!",
    textId: "Aku Flo, peri pelindung kesadaran mental dan kedamaianmu! Senang sekali bisa bertemu denganmu. Ayo, aku temani jalan-jalan singkat untuk mencicipi semua fitur ajaib di Life Flow! 🌸✨",
    textEn: "I'm Flo, your personal mindfulness and peace guardian! So happy to meet you. Permit me to show you around all the magical capabilities of Life Flow! 🌸✨",
    expression: "(o^◇^o)✨",
    position: 'center'
  },
  {
    view: 'dashboard',
    titleId: "📊 Dashboard Utama",
    titleEn: "📊 Core Dashboard",
    textId: "Ini adalah panel pusat kedamaianmu. Kamu bisa mengintip ringkasan finansial, sisa saldo, persentase proyek selesai, serta kutipan inspirasi harian yang menyegarkan jiwa. 🌟",
    textEn: "This is your mindfulness control center. Peek at your balance sheet, completed daily checklists, goal progressions, and daily uplifting quotes to fuel your day! 🌟",
    expression: "(◕‿◕✿)🍃",
    position: 'middle'
  },
  {
    view: 'finance',
    titleId: "💰 Dompet & Pengeluaran",
    titleEn: "💰 Wallet & Expenses",
    textId: "Pantau setiap rupiah/dolar yang kamu miliki di Tracker Keuangan! Di sini kamu bisa mencatatkan pendapatan, beban pengeluaran, menyinkronkan data langsung ke Google Sheets, atau mengimpor file! 💸",
    textEn: "Track all your coins and cash flow inside the Financial Tracker! Easily list your dynamic income and utilities, sync directly to Google Sheets database, or upload invoices! 💸",
    expression: "(•◡•)💭",
    position: 'middle'
  },
  {
    view: 'budgets',
    titleId: "📈 Anggaran & Rencana Tabungan",
    titleEn: "📈 Budgets & Savings Goal",
    textId: "Jangan biarkan uangmu menguap begitu saja! Di menu Budgets & Savings, kamu bisa menjatah batas pengeluaran kategori bulanan dan membuat target tabungan mimpi dengan diagram progres yang asri! 🚀",
    textEn: "Don't let your funds vanish into thin air! In the Budgets page, you can assign category limits and define dream savings goals adorned with responsive visual elements! 🚀",
    expression: "(✿◠‿◠)🏆",
    position: 'middle'
  },
  {
    view: 'visualization',
    titleId: "📊 Analisis & Diagram d3",
    titleEn: "📊 Analytics & d3 Diagnostics",
    textId: "Mari melihat kemajuan finansialmu dipajang secara interaktif! Dengan visualisasi diagram d3 profesional, kamu bisa membaca tren arus kas secara instan dan cermat. 📈🔍",
    textEn: "Admire your money progress beautifully rendered! Embedded with customizable, responsive d3 visual components, you can decipher cash dynamics with extreme precision. 📈🔍",
    expression: "(o^◇^o)✨",
    position: 'middle'
  },
  {
    view: 'schedule',
    titleId: "📅 Agenda & Kalender Harian",
    titleEn: "📅 Daily Planner & Calendars",
    textId: "Atur agenda harianmu agar terstruktur rapi! Kamu bisa menjadwalkan tugas harian, memantau agenda mendatang, dan menyelesaikan checkpoint aktivitasmu kapan saja secara instan! 🕒",
    textEn: "Plan your day with zero friction! You can schedule chores, list your upcoming checklists, and tick off your completed items in a single view! 🕒",
    expression: "(•◡•)💭",
    position: 'middle'
  },
  {
    view: 'habits',
    titleId: "⚡ Habit Tracker (Kebiasaan Baik)",
    titleEn: "⚡ Intentional Habit Tracker",
    textId: "Rutinitas kecil akan melahirkan buah besar. Catat kebiasaan olahragamu, minum air, atau meditasi di sini. Jaga rantai streak harianmu agar tidak putus ya! 🔥🥛",
    textEn: "Incredible lives are stacked on micro habits! Log your daily exercises, reading time, or meditation. Keep your heat streak burning bright! 🔥🥛",
    expression: "(✿◠‿◠)🏆",
    position: 'middle'
  },
  {
    view: 'ai_planner',
    titleId: "🤖 Perencana Bertenaga AI",
    titleEn: "🤖 Smart AI Study Planner",
    textId: "Lelah mengatur jadwal sendiri? Biarkan asisten kecerdasan AI kami merumuskan rincian belajar dan prioritas belanjamu secara presisi dalam hitungan detik! ⚡🏎️",
    textEn: "Exhausted from compiling calendars manually? Let our intelligent AI parse your parameters and generate personalized Study & Budget goals instantly! ⚡🏎️",
    expression: "(•◡•)💭",
    position: 'middle'
  },
  {
    view: 'smart_space',
    titleId: "🎧 AI Smart Space & Pomodoro",
    titleEn: "🎧 AI Smart Focus Room",
    textId: "Ruang fokus terbaik! Pasang earphone-mu, nyalakan visualizer bernapas, dan nikmati musik sintesis binaural beats yang melahirkan ketenangan mendalam untuk sesi belajarmu. 🧘🏽‍♂️⏳",
    textEn: "The ultimate focus sanctuary! Pop in your earphones, initiate our deep-breathing visualizer, and let procedurally synthesized binaural ambient loops elevate your focus. 🧘🏽‍♂️⏳",
    expression: "(◕‿◕✿)🍃",
    position: 'middle'
  },
  {
    view: 'journal',
    titleId: "📝 JURNAL REFLEKSI BARU!",
    titleEn: "📝 EXPERIMENT DISCOVERY!",
    textId: "✨ FITUR BARU KITA! Di sini kamu bisa mencurahkan emosi, melampiaskan kegundahan, dan merangkum harimu. Aku akan menemanimu di halaman ini memberikan prompt kejutan seru setiap hari! Serta tersimpan di cloud Firebase! 📓🦄",
    textEn: "✨ NEW HIGHLIGHT! This is your mental sanctuary. Reflect on your thoughts, select energetic mood emojis, and get customized ideas from me. Upgraded with persistent cloud databases! 📓🦄",
    expression: "🏆(✿◠‿◠)🏆",
    position: 'middle'
  },
  {
    view: 'dashboard',
    titleId: "✨ Ayo Berprogres Bersama!",
    titleEn: "✨ Ready for Lift-off!",
    textId: "Yuraaa! Perjalanan perkenalan kita sudah selesai. Kini kamu siap menata hidup, keuangan, dan kedamaian pikiran. Luapkan keluh kesahmu denganku di lembar Jurnal kapan pun ya! Selamat mencoba! 🎉🚀",
    textEn: "Hurrah! Our introductory stroll is complete. Next, align your finances, complete tasks, and log experiences. I'll always be waiting in your Daily Journal room! 🚀🎉",
    expression: "(o^◇^o)✨",
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
            <span className="text-[10px] font-black tracking-widest text-[#7c3aed] uppercase flex items-center gap-1.5 px-3 py-1 bg-violet-950/40 border border-violet-500/10 rounded-full">
              <Sparkles className="w-3 h-3 text-violet-400" />
              {language === 'id' ? `FITUR ${currentStep} DARI ${total - 1}` : `FEATURE ${currentStep} OF ${total - 1}`}
            </span>
            <button 
              onClick={handleSkip}
              className="text-slate-500 hover:text-slate-300 p-1.5 hover:bg-white/5 rounded-full transition-all cursor-pointer"
              title={language === 'id' ? "Lewati Panduan" : "Skip Tour"}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Animated mascot character illustration */}
          <div className="flex items-center gap-4 mb-4">
            <motion.div
              animate={{ 
                y: [0, -6, 0],
                rotate: [0, 1.5, -1.5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 border-2 border-violet-500/40 flex items-center justify-center text-xl font-bold shrink-0 shadow-lg relative cursor-pointer"
            >
              <span className="drop-shadow tracking-tighter select-none">{step.expression}</span>
              <div className="absolute -top-1 -right-1 bg-yellow-400 w-2 h-2 rounded-full animate-ping" />
            </motion.div>

            <div>
              <h4 className="text-sm font-black text-[#f7f8f8] tracking-tight">
                {processedTitle}
              </h4>
              <p className="text-[11px] text-[#62666d] uppercase font-mono tracking-wider font-semibold">
                Flo Companion
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
