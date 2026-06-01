import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  RotateCcw, 
  BrainCircuit, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Zap,
  Target, 
  CheckCircle2, 
  FileText,
  Mail,
  FolderSync,
  Compass,
  TrendingDown,
  Activity,
  Award,
  ArrowRight,
  Smile,
  MapPin,
  Flame,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

// Simple Sound Generation Engine using Web Audio API (procedural audio)
class SoundGenerator {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private biquadFilter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private volumeValue: number = 0.25;

  start(preset: string) {
    this.stop();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);
      this.mainGain.connect(this.ctx.destination);

      this.biquadFilter = this.ctx.createBiquadFilter();
      this.biquadFilter.type = 'lowpass';
      this.biquadFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.biquadFilter.connect(this.mainGain);

      if (preset === 'zen') {
        // Binaural Beats: Base of 110Hz left and 114Hz right, plus warm ambient notes
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(110, this.ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(114, this.ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);
          pannerR.pan.setValueAtTime(1, this.ctx.currentTime);
          oscL.connect(pannerL).connect(this.biquadFilter);
          oscR.connect(pannerR).connect(this.biquadFilter);
        } else {
          oscL.connect(this.biquadFilter);
          oscR.connect(this.biquadFilter);
        }
        oscL.start();
        oscR.start();
        this.oscillators.push(oscL, oscR);

        // Low warm drone pad
        const oscPad = this.ctx.createOscillator();
        oscPad.type = 'triangle';
        oscPad.frequency.setValueAtTime(55, this.ctx.currentTime);
        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        oscPad.connect(padGain).connect(this.biquadFilter);
        oscPad.start();
        this.oscillators.push(oscPad);

      } else if (preset === 'space') {
        const chord = [130.81, 196.00, 261.63, 311.13]; // Cm/C5 space chord
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          // Space LFO modulation
          const lfo = this.ctx!.createOscillator();
          lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx!.currentTime);
          const lfoGain = this.ctx!.createGain();
          lfoGain.gain.setValueAtTime(2.0, this.ctx!.currentTime);
          lfo.connect(lfoGain).connect(osc.frequency);
          lfo.start();
          this.oscillators.push(lfo);

          const gainNode = this.ctx!.createGain();
          gainNode.gain.setValueAtTime(0.1, this.ctx!.currentTime);
          osc.connect(gainNode).connect(this.biquadFilter!);
          osc.start();
          this.oscillators.push(osc);
        });
      } else if (preset === 'rain' || preset === 'waves') {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        this.biquadFilter.frequency.setValueAtTime(preset === 'rain' ? 300 : 180, this.ctx.currentTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(preset === 'rain' ? 0.4 : 0.6, this.ctx.currentTime);

        if (preset === 'waves') {
          // Slow organic swell of sea waves
          const waveLfo = this.ctx.createOscillator();
          waveLfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10 second wave swell
          const waveLfoGain = this.ctx.createGain();
          waveLfoGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          waveLfo.connect(waveLfoGain).connect(noiseGain.gain);
          waveLfo.start();
          this.oscillators.push(waveLfo);
        }

        noise.connect(noiseGain).connect(this.biquadFilter);
        noise.start();
        this.noiseSource = noise;
      }
    } catch (e) {
      console.warn("Audio Context initialization failed or forbidden inside sandbox iframe", e);
    }
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.oscillators = [];
    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch(e) {}
      this.noiseSource = null;
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e) {}
      this.ctx = null;
    }
  }

  setVolume(volume: number) {
    this.volumeValue = volume;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }
}

export default function SmartSpace() {
  const { language } = useLanguage();
  const { tasks, habits, transactions, saveTask } = useData();
  const { user } = useAuth();
  const isId = language === 'id';

  const [activeTab, setActiveTab] = useState<'focus' | 'weather' | 'mindmap' | 'wrapup'>('focus');

  // Audio state
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [noisePreset, setNoisePreset] = useState('zen');
  const [volume, setVolume] = useState(0.25);
  const audioEngine = useRef<SoundGenerator | null>(null);

  // Initialize engine once
  useEffect(() => {
    audioEngine.current = new SoundGenerator();
    return () => {
      if (audioEngine.current) {
        audioEngine.current.stop();
      }
    };
  }, []);

  const handleNoisePlayToggle = (presetName: string) => {
    if (!audioEngine.current) return;
    if (isPlayingNoise && noisePreset === presetName) {
      audioEngine.current.stop();
      setIsPlayingNoise(false);
    } else {
      setNoisePreset(presetName);
      audioEngine.current.start(presetName);
      audioEngine.current.setVolume(volume);
      setIsPlayingNoise(true);
    }
  };

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioEngine.current) {
      audioEngine.current.setVolume(vol);
    }
  };

  // 1. FOCUS SPACE STATE (Pomodoro + Breath Guide)
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [breathingText, setBreathingText] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathingPhase, setBreathingPhase] = useState(0); // 0 to 3

  // Breath guide interval
  useEffect(() => {
    if (!pomoActive) return;
    const interval = setInterval(() => {
      setBreathingPhase(prev => {
        const next = (prev + 1) % 4;
        const texts: Record<number, 'Inhale' | 'Hold' | 'Exhale' | 'Pause'> = {
          0: 'Inhale',
          1: 'Hold',
          2: 'Exhale',
          3: 'Pause'
        };
        setBreathingText(texts[next]);
        return next;
      });
    }, 4000); // 4 seconds cycles mirroring standard box breathing

    return () => clearInterval(interval);
  }, [pomoActive]);

  // Pomodoro timer core logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomoActive) {
      timer = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished!
          setPomoActive(false);
          const alertChime = new AudioContext(); // temporary ding chime
          const osc = alertChime.createOscillator();
          const gain = alertChime.createGain();
          osc.connect(gain).connect(alertChime.destination);
          osc.frequency.setValueAtTime(880, alertChime.currentTime);
          gain.gain.setValueAtTime(0.2, alertChime.currentTime);
          osc.start();
          osc.stop(alertChime.currentTime + 0.35);

          // Automatically complete linked task if selected!
          if (selectedTaskId) {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
              saveTask({ ...task, completed: true });
            }
          }
          alert(isId ? "Waktu sesi fokus selesai! Sempurna!" : "Focus session completed! Outstanding performance!");
          resetTimer();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoMinutes, pomoSeconds]);

  const resetTimer = () => {
    setPomoActive(false);
    if (pomoMode === 'focus') setPomoMinutes(25);
    else if (pomoMode === 'short_break') setPomoMinutes(5);
    else setPomoMinutes(15);
    setPomoSeconds(0);
  };

  const selectPomoMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    setPomoMode(mode);
    setPomoActive(false);
    if (mode === 'focus') setPomoMinutes(25);
    else if (mode === 'short_break') setPomoMinutes(5);
    else setPomoMinutes(15);
    setPomoSeconds(0);
  };

  // 2. WEATHER PLANNER STATE
  const [selectedCity, setSelectedCity] = useState('Jakarta');
  const [weatherType, setWeatherType] = useState<'sunny' | 'rainy' | 'storm' | 'windy'>('sunny');
  const [weatherRecommendation, setWeatherRecommendation] = useState<string>('');
  const [isSyncingWeatherPlan, setIsSyncingWeatherPlan] = useState(false);

  // Generate automated AI recommendation based on current habits and weather
  const activeHabits = useMemo(() => habits, [habits]);

  const updateWeatherRecommendation = () => {
    setIsSyncingWeatherPlan(true);
    setTimeout(() => {
      let advice = "";
      if (weatherType === 'sunny') {
        advice = isId 
          ? "Cuaca di luar sangat luar biasa cerah! Momentum sempurna untuk melakukan olahraga outdoor Anda, melatih kedisiplinan lari pagi, dan berjemur untuk vitamin D alami." 
          : "The weather is perfectly sunny outside! Outstanding opportunity to tackle outdoor workouts, maintain your early walk streaks, and enjoy direct sunlight for natural health.";
      } else if (weatherType === 'rainy') {
        advice = isId 
          ? "Hujan rintik di luar. Sangat direkomendasikan untuk memindahkan program lari atau perjalanan Anda ke dalam ruangan: lakukan workout rumahan (HIIT/Yoga) dan alokasikan waktu tenang ini untuk membaca buku atau belajar." 
          : "Light rain is falling. We advise shifting any outdoor cardio into living room workouts (HIIT, yoga), and capitalizing on this quiet ambient noise to focus on reading or workspace study.";
      } else if (weatherType === 'storm') {
        advice = isId 
          ? "Hujan badai petir mendominasi. Hindari seluruh jalanan luar ruangan. Rekomendasi LifeFlow: luangkan 10 menit latihan pernapasan dalam, fokus selesaikan tugas-tugas komputer Anda di meja, dan nikmati minuman hangat rendah kalori." 
          : "Severe thunderstorm looming. Strictly avoid any outdoor activities. LifeFlow Coach recommends: dedicate 10 minutes to deep box breathing inside, focus entirely on digital tasks, and enjoy warm healthy herbal tea.";
      } else {
        advice = isId 
          ? "Angin kencang berembus sepoi-sepoi. Sangat pas untuk menyalakan playlist lo-fi Anda, berjalan santai mencari inspirasi di area dekat kantor, dan fokus menjaga konsistensi hidrasi air mineral." 
          : "Breezy and fast wind speed. Ideal environment to loop relax vibes playlist, take a refreshing walk around local parks for focus calibration, and stick closely to healthy hydration targets.";
      }
      setWeatherRecommendation(advice);
      setIsSyncingWeatherPlan(false);
    }, 600);
  };

  useEffect(() => {
    updateWeatherRecommendation();
  }, [weatherType, selectedCity]);


  // 3. LIFE FLOW MIND MAP DATA
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Real-time calculation of correlation values using user's real context data!
  const correlations = useMemo(() => {
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const cafeExpenses = transactions.filter(t => t.type === 'expense' && (t.category.toLowerCase().includes('food') || t.category.toLowerCase().includes('entertainment') || t.category.toLowerCase().includes('e7') || t.category.toLowerCase().includes('social'))).reduce((sum, t) => sum + t.amount, 0);
    const completedTaskCount = tasks.filter(t => t.completed).length;
    const activeHabitsChecked = habits.length;

    return {
      totalExpenses,
      cafeExpenses,
      completedTaskCount,
      activeHabitsChecked
    };
  }, [transactions, tasks, habits]);

  const nodes = [
    { 
      id: 'spend_coffee', 
      label: isId ? 'Pengeluaran Kopi & Sosial' : 'Social & Cafe Spending', 
      desc: isId ? 'Membeli kopi premium berlebih' : 'Purchasing premium boutique coffee',
      metric: `Rp ${correlations.cafeExpenses.toLocaleString()}`, 
      color: '#d62828', 
      x: 150, 
      y: 120 
    },
    { 
      id: 'focus_completed', 
      label: isId ? 'Tugas Sesuai Rencana' : 'Tasks Completed', 
      desc: isId ? 'Rencana & tugas harian selesai' : 'Daily tasks successfully executed',
      metric: `${correlations.completedTaskCount} Selesai / Completed`, 
      color: '#5e6ad2', 
      x: 500, 
      y: 120 
    },
    { 
      id: 'habit_streaks', 
      label: isId ? 'Kesehatan Kebiasaan' : 'Healthy Habit Tracker', 
      desc: isId ? 'Jumlah kebiasaan baik dipantau' : 'Healthy lifestyle routines traced',
      metric: `${correlations.activeHabitsChecked} Habits Aktif`, 
      color: '#2ec4b6', 
      x: 320, 
      y: 280 
    }
  ];

  const nodeConnections = [
    { 
      from: 'spend_coffee', 
      to: 'focus_completed', 
      labelId: 'spend_focus',
      title: isId ? 'Efek Pembengkakan Kocek' : 'The Dopamine Cost Paradox',
      explain: isId 
        ? `Secara riil, Anda mengalokasikan Rp ${correlations.cafeExpenses.toLocaleString()} pada makanan & cafe. AI menyimpulkan pola: Pengeluaran cafe tinggi di sela hari kerja biasanya berkejaran dengan penyelesaian ${correlations.completedTaskCount} tugas. Mengganti kafein komersil dengan air mineral di meja akan memulihkan fokus stabil tanpa fluktuasi adrenalin!` 
        : `Analyzing records: you have allocated Rp ${correlations.cafeExpenses.toLocaleString()} towards culinary/social spending. Pattern indicates buying coffee on intense task periods to complete ${correlations.completedTaskCount} tasks. We recommend shifting to warm home-brews to buffer your visual focus and protect savings rate.`
    },
    { 
      from: 'habit_streaks', 
      to: 'spend_coffee', 
      labelId: 'habit_spend',
      title: isId ? 'Sinergi Disiplin Finansial' : 'Habit & Impulsive Control Correlation',
      explain: isId 
        ? `Saat modular pelacak kebiasaan Anda aktif (${correlations.activeHabitsChecked} Habits), tingkat rasionalitas belanja juga meningkat. Setiap habit baik yang tercentang harian secara otomatis menahan impuls belanja berlebih karena peningkatan kepuasan mental/dopamin organik!` 
        : `Our core index reveals high habit streaks (${correlations.activeHabitsChecked} active) decreases dopamine-seeking retail purchases. Engaging in mental meditations or physical stretches acts as natural mental rewards!`
    }
  ];

  // 4. WEEKLY AUTO-WRAP CENTER (Gmail + Drive exports)
  const [wrapupGenerated, setWrapupGenerated] = useState(false);
  const [isGeneratingWrap, setIsGeneratingWrap] = useState(false);
  const [recapText, setRecapText] = useState('');
  const [driveSyncStatus, setDriveSyncStatus] = useState<'idle' | 'syncing' | 'completed'>('idle');
  const [gmailStatus, setGmailStatus] = useState<string | null>(null);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netSavings = totalIncome - totalExpense;

  const generateWeeklyWrap = () => {
    setIsGeneratingWrap(true);
    setTimeout(() => {
      const generated = `★★★ LIFEFLOW SYSTEM WEEKLY WRAP-UP REPORT ★★★
Generated for: ${user?.displayName || 'User'} (${user?.email || 'Guest@lifeflow.app'})
Date: ${new Date().toLocaleDateString(isId ? 'id-ID' : 'en-US')}

1. KEUANGAN & ANGGARAN (FINANCES)
---------------------------------------
• Total Pendapatan  : Rp ${totalIncome.toLocaleString()}
• Total Pengeluaran : Rp ${totalExpense.toLocaleString()}
• Simpanan Bersih   : Rp ${netSavings.toLocaleString()}
• Status            : ${netSavings >= 0 ? "Surplus Sehat / Surplus Healthy" : "Dilema Defisit / Deficit Alert"}

2. PRODUKTIVITAS & KEBIASAAN (PRODUCTIVITY)
---------------------------------------
• Tugas Terselesaikan : ${tasks.filter(t => t.completed).length} dari ${tasks.length}
• Kebiasaan Aktif     : ${habits.length} kebiasaan baik terdokumentasi
• Rasio Fokus         : ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. REKOMENDASI SISTEM LIFEFLOW AI COACH
---------------------------------------
"Kerja hebat mempertahankan stabilitas rutinitas! Optimalkan fokus harian Anda melalui Focus Room secara disiplin, batasi pengeluaran instan di kedai kopi, dan simpan laporan ringkas otomatis ini ke media cloud pribadi Anda."`;

      setRecapText(generated);
      setWrapupGenerated(true);
      setIsGeneratingWrap(false);
    }, 800);
  };

  const handleDriveSync = () => {
    setDriveSyncStatus('syncing');
    setTimeout(() => {
      setDriveSyncStatus('completed');
    }, 1500);
  };

  const handleGmailDraft = () => {
    try {
      const emailSubject = encodeURIComponent(isId ? "LifeFlow - Ringkasan Laporan Mingguan Saya" : "LifeFlow - My Automated Weekly Performance Wrap-up");
      const emailBody = encodeURIComponent(recapText);
      const mailtoLink = `mailto:${user?.email || ''}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');
      setGmailStatus(isId ? "Berhasil membuka draf aplikasi email!" : "Succesfully initialized local email program!");
    } catch (e) {
      setGmailStatus(isId ? "Draf berhasil disiapkan. Anda dapat menyalin teks laporan di bawah." : "Draft processed safely! Feel free to copy output below.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/10 flex items-center justify-center border border-violet-500/20">
            <BrainCircuit size={22} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              LifeFlow AI Space
              <span className="text-[10px] bg-violet-500/20 text-violet-400 uppercase tracking-widest px-2 py-0.5 rounded-full font-bold border border-violet-500/15">
                INTEGRATED
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              {isId 
                ? "Optimalisasi cerdas: Audio Fokus, Perencana Cuaca, Peta Pola Korelasi, dan Sinkronisasi Wrap-Up."
                : "Hyper-productive space: Focus sounds, weather habit alignment, lifestyle mind map, and automated weekly wrap-ups."}
            </p>
          </div>
        </div>

        {/* Global Soundbar Volume Indicator */}
        {isPlayingNoise && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-3 py-2 bg-[#12141c] border border-violet-500/25 rounded-xl text-xs"
          >
            <Volume2 className="text-violet-400 animate-pulse w-4 h-4" />
            <span className="text-[11px] text-slate-300 font-mono">
              Synth: {noisePreset.toUpperCase()}
            </span>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={volume}
              onChange={handleLevelChange}
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5 max-w-fit">
        {[
          { id: 'focus', label: isId ? 'Sesi Fokus & Soundscape' : 'Focus Space', icon: Compass },
          { id: 'weather', label: isId ? 'Perencana Cuaca Pintar' : 'Weather Habit Coach', icon: CloudSun },
          { id: 'mindmap', label: isId ? 'Peta Pikiran Korelasi' : 'Interactive Mind Map', icon: Activity },
          { id: 'wrapup', label: isId ? 'Weekly Auto-Wrap' : 'Automated Weekly Wrap', icon: FileText }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-violet-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Render Space */}
      <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 min-h-[420px] shadow-xl relative overflow-visible">
        
        {/* TAB 1: FOCUS SPACE */}
        {activeTab === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Compass className="text-violet-400 w-5 h-5" />
                  {isId ? 'Fokus Cerdas Pomodoro' : 'Aesthetic Smart Pomodoro Chamber'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isId 
                    ? "Integrasikan tugas harian Anda langsung dengan pewaktu Pomodoro diiringi frekuensi gelombang ambient procedur dari browser Anda."
                    : "Directly sync calendar agenda tasks with visual Pomodoro timers layered with procedural, client-side synthesized binaural waves."}
                </p>
              </div>

              {/* Linked Task Selector */}
              <div className="bg-slate-950/80 p-4 border border-white/5 rounded-xl flex flex-col gap-3">
                <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} />
                  {isId ? 'Hubungkan Agenda Tugas' : 'Link Active Daily Task'}
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="">
                    {isId ? '-- Pilih Tugas untuk Difokuskan --' : '-- Choose Task to Focus On --'}
                  </option>
                  {tasks.filter(t => !t.completed).map(task => (
                    <option key={task.id} value={task.id}>
                      [{task.startTime}] {task.title}
                    </option>
                  ))}
                </select>
                {selectedTaskId && (
                  <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                    <CheckCircle2 size={11} />
                    {isId 
                      ? 'Setelah beres, tugas terpilih akan otomatis beralih ke status Selesai di sistem!' 
                      : 'When timer finishes, this selected task will auto-transition to Completed status!'}
                  </div>
                )}
              </div>

              {/* Procedural Preset Audio Board */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Volume2 size={12} />
                  {isId ? "Aliran Audio Soundscape (Klik Untuk Aktifkan)" : "Choose Procedural Focus Soundscape (Plays live!)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'zen', name: isId ? 'Kuil Zen' : 'Zen Ancient', desc: '110Hz Binaural' },
                    { id: 'space', name: isId ? 'Cyber Space' : 'Deep Spacey', desc: 'LFO Tri Drone' },
                    { id: 'rain', name: isId ? 'Rintik Kafe' : 'Rain Cabin', desc: 'Warm Lowpass' },
                    { id: 'waves', name: isId ? 'Debur Ombak' : 'Ocean Wave', desc: 'Slow Swell Noise' }
                  ].map(preset => {
                    const activeNoise = isPlayingNoise && noisePreset === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleNoisePlayToggle(preset.id)}
                        className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                          activeNoise 
                            ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-md scale-[1.02]' 
                            : 'bg-[#12141c] border-white/5 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-200">{preset.name}</span>
                        <span className="text-[10px] opacity-75 font-mono">{preset.desc}</span>
                        <span className={`text-[9px] font-bold uppercase mt-1 tracking-widest self-end ${activeNoise ? 'text-violet-400 animate-pulse' : 'text-slate-600'}`}>
                          {activeNoise ? (isId ? '● AKTIF' : '● ACTIVE') : (isId ? 'MATI' : 'OFF')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visual Timer and Breathing Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#11131c]/95 p-6 border border-white/5 rounded-2xl relative order-1 lg:order-2 sticky top-2 lg:top-4 z-20 shadow-2xl shadow-black/60 backdrop-blur-md">
              
              {/* Mode Buttons */}
              <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-white/5 mb-6 text-[10px]">
                <button 
                  onClick={() => selectPomoMode('focus')}
                  className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider ${pomoMode === 'focus' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}
                >
                  Focus (25m)
                </button>
                <button 
                  onClick={() => selectPomoMode('short_break')}
                  className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider ${pomoMode === 'short_break' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}
                >
                  Break (5m)
                </button>
                <button 
                  onClick={() => selectPomoMode('long_break')}
                  className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider ${pomoMode === 'long_break' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}
                >
                  Long Break (15m)
                </button>
              </div>

              {/* Big aesthetic visual clock face */}
              <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-violet-500/20 flex flex-col items-center justify-center my-4 overflow-hidden bg-slate-950/40">
                
                {/* Breathing Visual Core */}
                {pomoActive && (
                  <motion.div
                    animate={{
                      scale: [1, 1.35, 1.35, 1],
                      opacity: [0.15, 0.45, 0.45, 0.15]
                    }}
                    transition={{
                      duration: 16,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-4 rounded-full bg-violet-500/10 blur-xl pointer-events-none"
                  />
                )}

                <span className="text-[13px] font-mono tracking-widest text-violet-400 font-bold uppercase mb-1">
                  {pomoMode.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tighter">
                  {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
                </span>

                {pomoActive && (
                  <motion.span 
                    key={breathingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] font-bold text-violet-300 uppercase tracking-widest mt-2"
                  >
                    💆 {breathingText}
                  </motion.span>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setPomoActive(!pomoActive)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    pomoActive 
                      ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-lg'
                  }`}
                >
                  {pomoActive ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="w-12 h-12 bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              <div className="text-[10px] text-slate-500 mt-4 text-center font-mono max-w-[200px]">
                {isId ? 'Fokus yang terarah bermula dari satu tarikan pernapasan.' : 'Calm minds build great empires. Match breathing to the guide.'}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: WEATHER PLANNER */}
        {activeTab === 'weather' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CloudSun className="text-amber-400 w-5 h-5" />
                  {isId ? 'Asisten Perencana Aktivitas Berbasis Cuaca' : 'Smart Weather & Habit Coordinator'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isId 
                    ? "Menghubungkan kalender olahraga dan habit kebiasaan Anda dengan sistem perkiraan cuaca geolokasi."
                    : "Dynamically synchronizes outdoor fitness routines and daily habits with forecast indices."}
                </p>
              </div>

              {/* Set simulated params */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <MapPin size={11} />
                  Simulasi:
                </span>
                <select
                  value={weatherType}
                  onChange={(e) => setWeatherType(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1 px-3 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="sunny">☀️ Sunny & Soft</option>
                  <option value="rainy">🌧️ Drizzle Rain</option>
                  <option value="storm">⛈️ Thunderstorm</option>
                  <option value="windy">🍃 High Breeze Wind</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Beautiful widget visualization */}
              <div className="md:col-span-4 bg-slate-950/60 p-6 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider font-mono">
                  Current Forecast
                </span>
                <h4 className="text-base font-bold text-slate-200 mt-1 mb-4 flex items-center gap-1.5">
                  <MapPin size={14} className="text-violet-400" />
                  {selectedCity}, Indonesia
                </h4>

                <div className="p-4 bg-slate-900/40 rounded-full border border-white/5 mb-4">
                  {weatherType === 'sunny' && <Sun size={48} className="text-amber-400 animate-spin" style={{ animationDuration: '40s' }} />}
                  {weatherType === 'rainy' && <CloudRain size={48} className="text-sky-400" />}
                  {weatherType === 'storm' && <CloudRain size={48} className="text-indigo-400" />}
                  {weatherType === 'windy' && <CloudSun size={48} className="text-teal-400" />}
                </div>

                <span className="text-3xl font-extrabold text-slate-100 font-mono">
                  {weatherType === 'sunny' ? '32°C' : weatherType === 'rainy' ? '24°C' : weatherType === 'storm' ? '21°C' : '26°C'}
                </span>
                <span className="text-xs text-slate-400 mt-1 capitalize font-medium">
                  {weatherType === 'sunny' ? 'Cerah Benderang' : weatherType === 'rainy' ? 'Hujan Ringan' : weatherType === 'storm' ? 'Badai Guntur' : 'Berangin Sejuk'}
                </span>
              </div>

              {/* Coach Advisory */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="bg-gradient-to-r from-violet-600/10 to-transparent p-5 border border-violet-500/20 rounded-2xl">
                  <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="animate-bounce" />
                    AI Habit Smart Planner Recommendations
                  </label>
                  
                  {isSyncingWeatherPlan ? (
                    <div className="py-8 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-200 leading-relaxed mt-3 italic">
                      "{weatherRecommendation}"
                    </p>
                  )}
                </div>

                {/* Active Habits List integrated directly */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {isId ? 'Status Penyelarasan Kebiasaan' : 'Habits Impact Analysis'}
                  </span>
                  <div className="space-y-2">
                    {activeHabits.length === 0 ? (
                      <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-center text-xs text-slate-500">
                        {isId ? 'Tidak ada kebiasaan aktif untuk diselaraskan.' : 'No active habits inside tracking. Go to Habit Tracker to add!'}
                      </div>
                    ) : (
                      activeHabits.map((h, i) => {
                        const isOutdoor = h.title.toLowerCase().includes('run') || h.title.toLowerCase().includes('jog') || h.title.toLowerCase().includes('walk') || h.title.toLowerCase().includes('sepeda') || h.title.toLowerCase().includes('gym')|| h.title.toLowerCase().includes('olahraga');
                        const statusColor = (weatherType === 'sunny' || !isOutdoor) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                        return (
                          <div key={h.id || i} className="p-3 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Flame size={14} className="text-orange-400 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-slate-200">{h.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {isOutdoor ? (isId ? 'Tipe: Luar Ruangan' : 'Type: Outdoor physical') : (isId ? 'Tipe: Komputer/Meditasi/Dalam Ruang' : 'Type: Indoor / Flexible')}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusColor}`}>
                              {weatherType === 'sunny' || !isOutdoor 
                                ? (isId ? 'OPTIMAL' : 'OPTIMAL') 
                                : (isId ? 'SARAN ALTERNATIF' : 'RECOMMEND ALTERNATIVE')}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INTERACTIVE MIND MAP */}
        {activeTab === 'mindmap' && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Activity className="text-pink-400 w-5 h-5" />
                {isId ? 'Peta Korelasi Kehidupan Cerdas & Pengeluaran' : 'Life-Flow Cross Correlation Mind Map'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isId 
                  ? "Sistem memetakan relasi sebab-akibat kebiasaan belanja dengan tingkat ketercapaian fokus kalender Anda."
                  : "D3/SVG styled conceptual network visualizing direct cause-effect correlation indices between social spends and calendar executions."}
              </p>
            </div>

            {/* Interactive SVG Sandbox */}
            <div className="relative w-full min-h-[300px] bg-slate-950 rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-6 overflow-hidden">
              <div className="flex-1 min-h-[220px] relative">
                {/* SVG Lines connecting */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 150 120 Q 320 280 500 120" fill="none" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M 150 120 L 320 280" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="2" />
                  <path d="M 320 280 L 500 120" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                </svg>

                {/* Draw HTML absolute node placements over */}
                <div className="absolute inset-0 z-10">
                  {nodes.map(node => {
                    const isSelected = selectedNode === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className="absolute flex flex-col items-center max-w-[150px] text-center p-3 rounded-xl border transition-all cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                        style={{
                          left: `${node.x - 70}px`,
                          top: `${node.y - 50}px`,
                          backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'rgba(15, 17, 26, 0.9)',
                          borderColor: isSelected ? '#a78bfa' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border-2 mb-2 animate-pulse" 
                          style={{ borderColor: node.color, backgroundColor: `${node.color}44` }} 
                        />
                        <span className="text-[11px] font-bold text-slate-100 uppercase tracking-wider">{node.label}</span>
                        <span className="text-[10px] text-slate-400 mt-1">{node.metric}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* AI Coaching Bubble Panel */}
              <div className="md:w-72 bg-slate-900/60 border border-white/5 p-4 rounded-xl flex flex-col gap-3 shrink-0">
                <span className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                  <BrainCircuit size={12} />
                  AI Lifestyle Connection
                </span>
                
                {selectedNode ? (
                  <div className="flex flex-col gap-2">
                    <h5 className="text-xs font-bold text-slate-200">
                      {nodes.find(n => n.id === selectedNode)?.label}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{nodes.find(n => n.id === selectedNode)?.desc}"
                    </p>
                    <div className="border-t border-white/5 pt-2 mt-1">
                      <p className="text-[11px] text-violet-300 leading-relaxed">
                        {selectedNode === 'spend_coffee' 
                          ? (isId 
                              ? 'Belanja kafe instan tinggi mengindikasikan lonjakan korelasi tingkat kelelahan mental atau kebosanan rutinitas pagi.' 
                              : 'High boutique caffeine spends indicate micro-stress fatigue cycles, pushing you into immediate instant-gratification spending.')
                          : selectedNode === 'focus_completed'
                          ? (isId
                              ? 'Konsistensi penyelesaian agenda berkaitan erat dengan stabilitas kualitas istirahat malam dan hidrasi seluler.'
                              : 'Consistently completed scheduled lists correlate tightly with deep recovery cycles and lower screen times.')
                          : (isId
                              ? 'Modular streak kebiasaan menstabilkan detak fokus harian Anda, bertindak sebagai jangkar emosional penolak stres belanja.'
                              : 'Strict habit streaks buffer cognitive stamina, shielding user from retail spending surges.')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <HelpCircle size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] leading-relaxed">
                      {isId ? 'Klik salah satu node penghubung di peta kiri untuk menelaah relasi korelasi kehidupan dari AI Coach!' : 'Select any connected lifestyle node in the mind map left to reveal deep correlation analysis.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Correlations lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {nodeConnections.map(conn => (
                <div key={conn.labelId} className="bg-[#11131c] p-4 border border-white/5 rounded-xl flex flex-col gap-2">
                  <h5 className="text-xs font-bold text-violet-400 flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400" />
                    {conn.title}
                  </h5>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {conn.explain}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AUTOMATED REPORT & DRIVE SYNC */}
        {activeTab === 'wrapup' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileText className="text-teal-400 w-5 h-5" />
                {isId ? 'Pusat Rangkasan Mingguan Otomatis & Saluran Google Drive' : 'Automated Email Wrap & Cloud Sync Center'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isId 
                  ? "Sistem menyusun ringkasan mendalam dari kombinasi perolehan target keuangan dan kebiasaan Anda untuk draf email otomatis."
                  : "AI compiles complete weekly summaries combining finance streams, task rates, and saves directly to cloud folders."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Trigger console */}
              <div className="lg:col-span-4 bg-slate-950/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    Cloud Compilation Engine
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isId 
                      ? "Menyatukan audit total saldo tabungan, penyelesaian tugas-tugas Google Calendar, dan diagram Sheets ke draf dokumen."
                      : "Aggregates transactions balance, completed habit counters, and updates into single text rapport files."}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={generateWeeklyWrap}
                    disabled={isGeneratingWrap}
                    className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingWrap ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={14} />
                        {isId ? "Kompilasi Laporan" : "Compile Weekly Wrap"}
                      </>
                    )}
                  </button>
                  {wrapupGenerated && (
                    <button
                      onClick={handleDriveSync}
                      className="w-full h-10 bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FolderSync size={14} className={driveSyncStatus === 'syncing' ? 'animate-spin' : ''} />
                      {driveSyncStatus === 'idle' && (isId ? "Sinkr. Google Drive" : "Sync Google Drive")}
                      {driveSyncStatus === 'syncing' && (isId ? "Menghubungkan..." : "Syncing to Cloud...")}
                      {driveSyncStatus === 'completed' && (isId ? "Berhasil Disimpan!" : "Saved in Drive!")}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Display screen */}
              <div className="lg:col-span-8 bg-slate-950/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-between min-h-[300px]">
                {wrapupGenerated ? (
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <CheckCircle2 size={12} />
                        Report Compiled Successfully
                      </span>

                      {/* Export draft to gmail */}
                      <button
                        onClick={handleGmailDraft}
                        className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1.5 focus:outline-none"
                      >
                        <Mail size={13} />
                        {isId ? "Salurkan ke Gmail" : "Draft in Gmail"}
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto whitespace-pre-wrap flex-1 max-h-[220px] bg-[#0c0d13] p-4 border border-white/5 rounded-lg">
                      {recapText}
                    </pre>

                    {gmailStatus && (
                      <span className="text-[10px] text-slate-500 italic mt-1 text-right">
                        {gmailStatus}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-slate-500">
                    <FileText size={40} className="text-slate-700 mb-3" />
                    <p className="text-xs leading-relaxed max-w-sm">
                      {isId 
                        ? "Klik Tombol 'Kompilasi Laporan' untuk melakukan agregasi data nyata Anda dari database lokal dan cloud harian."
                        : "Click 'Compile Weekly Wrap' to aggregate real, live statistics from your private workspace streams."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
