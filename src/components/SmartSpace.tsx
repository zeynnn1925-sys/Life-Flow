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
  HelpCircle,
  Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { usePomodoro } from '../contexts/PomodoroContext';

export default function SmartSpace() {
  const { language, t } = useLanguage();
  const { tasks, habits, transactions, saveTask } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'focus' | 'weather' | 'mindmap' | 'wrapup'>('focus');

  // Consume Pomodoro and Audio state globally from PomodoroContext
  const {
    pomoMinutes,
    pomoSeconds,
    pomoActive,
    pomoMode,
    selectedTaskId,
    setSelectedTaskId,
    breathingText,
    isPlayingNoise,
    noisePreset,
    volume,
    handleNoisePlayToggle,
    setVolume,
    isFloating,
    setIsFloating,
    isMinimized,
    setIsMinimized,
    resetTimer,
    selectPomoMode,
    setPomoActive
  } = usePomodoro();

  const handleLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
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
        if (language === 'id') {
          advice = "Cuaca di luar sangat luar biasa cerah! Momentum sempurna untuk melakukan olahraga outdoor Anda, melatih kedisiplinan lari pagi, dan berjemur untuk vitamin D alami.";
        } else if (language === 'es') {
          advice = "¡El clima afuera está perfectamente soleado! Excelente oportunidad para hacer ejercicio al aire libre, mantener tus rachas de caminatas y disfrutar de la luz solar natural.";
        } else if (language === 'de') {
          advice = "Das Wetter ist wunderbar sonnig! Perfekter Moment für Outdoor-Workouts, Spaziergänge und natürliches Vitamin D.";
        } else if (language === 'ar') {
          advice = "الطقس مشمس ورائع بالخارج! فرصة مثالية للتمارين الرياضية في الهواء الطلق، والمشي الصباحي، والاستمتاع بأشعة الشمس الطبيعية.";
        } else {
          advice = "The weather is perfectly sunny outside! Outstanding opportunity to tackle outdoor workouts, maintain your early walk streaks, and enjoy direct sunlight for natural health.";
        }
      } else if (weatherType === 'rainy') {
        if (language === 'id') {
          advice = "Hujan rintik di luar. Sangat direkomendasikan untuk memindahkan program lari atau perjalanan Anda ke dalam ruangan: lakukan workout rumahan (HIIT/Yoga) dan alokasikan waktu tenang ini untuk membaca buku atau belajar.";
        } else if (language === 'es') {
          advice = "Lluvia ligera afuera. Te recomendamos trasladar el ejercicio cardiovascular a casa (HIIT o yoga) y aprovechar el sonido de la lluvia para leer o estudiar.";
        } else if (language === 'de') {
          advice = "Leichter Regen fällt. Wir empfehlen Workouts im Innenbereich (HIIT/Yoga) und diese ruhige Zeit zum Lesen oder Lernen zu nutzen.";
        } else if (language === 'ar') {
          advice = "أمطار خفيفة بالخارج. ننصحك بنقل التمارين للداخل وممارسة اليوجا أو القراءة والدراسة في هذا الجو الهادئ.";
        } else {
          advice = "Light rain is falling. We advise shifting any outdoor cardio into living room workouts (HIIT, yoga), and capitalizing on this quiet ambient noise to focus on reading or workspace study.";
        }
      } else if (weatherType === 'storm') {
        if (language === 'id') {
          advice = "Hujan badai petir mendominasi. Hindari seluruh jalanan luar ruangan. Rekomendasi LifeFlow: luangkan 10 menit latihan pernapasan dalam, fokus selesaikan tugas-tugas komputer Anda di meja, dan nikmati minuman hangat rendah kalori.";
        } else if (language === 'es') {
          advice = "Tormenta eléctrica severa. Evita actividades al aire libre. Recomendación LifeFlow: dedica 10 minutos a respiración profunda, concéntrate en tus tareas digitales y disfruta de un té caliente.";
        } else if (language === 'de') {
          advice = "Gewitter draußen. Bitte Aktivitäten im Freien vermeiden. Empfehlung: 10 Minuten Atemübungen, fokussierte Arbeit am Schreibtisch und ein warmes Getränk.";
        } else if (language === 'ar') {
          advice = "عاصفة رعدية قوية. يرجى البقاء في الداخل. توصية المستشار: مارس تمارين التنفس لـ 10 دقائق، وركز على مهامك الرقمية مع مشروب دافئ.";
        } else {
          advice = "Severe thunderstorm looming. Strictly avoid any outdoor activities. LifeFlow Coach recommends: dedicate 10 minutes to deep box breathing inside, focus entirely on digital tasks, and enjoy warm healthy herbal tea.";
        }
      } else {
        if (language === 'id') {
          advice = "Angin kencang berembus sepoi-sepoi. Sangat pas untuk menyalakan playlist lo-fi Anda, berjalan santai mencari inspirasi di area dekat kantor, dan fokus menjaga konsistensi hidrasi air mineral.";
        } else if (language === 'es') {
          advice = "Viento fresco y agradable. Entorno ideal para escuchar música lo-fi, dar un paseo ligero para despejar la mente y mantenerte bien hidratado.";
        } else if (language === 'de') {
          advice = "Frische Brise draußen. Ideal für entspannende Musik, kurze Spaziergänge für neue Ideen und gute Flüssigkeitszufuhr.";
        } else if (language === 'ar') {
          advice = "رياح لطيفة ومنعشة. أجواء مثالية للاستماع للموسيقى الهادئة، والمشي القصير لتجديد التركيز مع الحفاظ على شرب الماء.";
        } else {
          advice = "Breezy and fast wind speed. Ideal environment to loop relax vibes playlist, take a refreshing walk around local parks for focus calibration, and stick closely to healthy hydration targets.";
        }
      }
      setWeatherRecommendation(advice);
      setIsSyncingWeatherPlan(false);
    }, 600);
  };

  useEffect(() => {
    updateWeatherRecommendation();
  }, [weatherType, selectedCity, language]);

  // 3. LIFE FLOW MIND MAP DATA
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const correlations = useMemo(() => {
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const cafeExpenses = transactions.filter(t => t.type === 'expense' && (t.category.toLowerCase().includes('food') || t.category.toLowerCase().includes('entertainment') || t.category.toLowerCase().includes('social'))).reduce((sum, t) => sum + t.amount, 0);
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
      label: language === 'id' ? 'Pengeluaran Kafe & Sosial' : language === 'es' ? 'Gastos en Café y Social' : language === 'de' ? 'Kaffee- & Sozialausgaben' : language === 'ar' ? 'نفقات المقاهي والاجتماعيات' : 'Social & Cafe Spending', 
      desc: language === 'id' ? 'Membeli kopi premium berlebih' : language === 'es' ? 'Compras frecuentes de café premium' : language === 'de' ? 'Kauf von Premium-Kaffees' : language === 'ar' ? 'شراء القهوة والمشروبات المتكرر' : 'Purchasing premium boutique coffee',
      metric: `Rp ${correlations.cafeExpenses.toLocaleString()}`, 
      color: '#d62828', 
      x: 150, 
      y: 120 
    },
    { 
      id: 'focus_completed', 
      label: language === 'id' ? 'Tugas Sesuai Rencana' : language === 'es' ? 'Tareas Completadas' : language === 'de' ? 'Erledigte Aufgaben' : language === 'ar' ? 'المهام المنجزة' : 'Tasks Completed', 
      desc: language === 'id' ? 'Rencana & tugas harian selesai' : language === 'es' ? 'Tareas diarias ejecutadas con éxito' : language === 'de' ? 'Tagesaufgaben erfolgreich umgesetzt' : language === 'ar' ? 'تنفيذ مهام اليوم بنجاح' : 'Daily tasks successfully executed',
      metric: `${correlations.completedTaskCount} ${language === 'id' ? 'Selesai' : language === 'es' ? 'Completadas' : language === 'de' ? 'Erledigt' : language === 'ar' ? 'مكتمل' : 'Completed'}`, 
      color: '#5e6ad2', 
      x: 500, 
      y: 120 
    },
    { 
      id: 'habit_streaks', 
      label: language === 'id' ? 'Kesehatan Kebiasaan' : language === 'es' ? 'Racha de Hábitos Saludables' : language === 'de' ? 'Gewohnheiten-Status' : language === 'ar' ? 'العادات الصحية' : 'Healthy Habit Tracker', 
      desc: language === 'id' ? 'Jumlah kebiasaan baik dipantau' : language === 'es' ? 'Rutinas saludables monitoreadas' : language === 'de' ? 'Verfolgte gesunde Gewohnheiten' : language === 'ar' ? 'متابعة العادات الإيجابية' : 'Healthy lifestyle routines traced',
      metric: `${correlations.activeHabitsChecked} ${language === 'id' ? 'Habits Aktif' : language === 'es' ? 'Hábitos Activos' : language === 'de' ? 'Aktive Gewohnheiten' : language === 'ar' ? 'عادات نشطة' : 'Active Habits'}`, 
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
      title: language === 'id' ? 'Efek Pembengkakan Kocek' : language === 'es' ? 'La Paradoja del Costo de Dopamina' : language === 'de' ? 'Fokus- & Ausgaben-Dynamik' : language === 'ar' ? 'مفارقة نفقات التركيز' : 'The Dopamine Cost Paradox',
      explain: language === 'id' 
        ? `Secara riil, Anda mengalokasikan Rp ${correlations.cafeExpenses.toLocaleString()} pada makanan & cafe. AI menyimpulkan pola: Pengeluaran cafe tinggi di sela hari kerja biasanya berkejaran dengan penyelesaian ${correlations.completedTaskCount} tugas. Mengganti kafein komersil dengan air mineral di meja akan memulihkan fokus stabil tanpa fluktuasi adrenalin!` 
        : language === 'es'
        ? `Analizando registros: has asignado Rp ${correlations.cafeExpenses.toLocaleString()} a gastos sociales/café. Se observa una tendencia a comprar café en momentos de alta carga para completar ${correlations.completedTaskCount} tareas. Te sugerimos preparar café en casa o beber agua fresca para proteger tus ahorros y mantener un enfoque constante.`
        : language === 'de'
        ? `Auswertung: Du hast Rp ${correlations.cafeExpenses.toLocaleString()} für Café/Gastronomie ausgegeben. Dieses Muster tritt häufig bei intensiven Arbeitsphasen auf (${correlations.completedTaskCount} Aufgaben). Selbstgemachte Heißgetränke schonen das Budget bei gleicher Produktivität.`
        : language === 'ar'
        ? `تحليل البيانات: تم إنفاق Rp ${correlations.cafeExpenses.toLocaleString()} في المقاهي والمطاعم. يرتبط هذا بإنهاء ${correlations.completedTaskCount} مهام. إعداد مشروباتك بنفسك يحمي ميزانيتك ويحافظ على تركيزك الثابت.`
        : `Analyzing records: you have allocated Rp ${correlations.cafeExpenses.toLocaleString()} towards culinary/social spending. Pattern indicates buying coffee on intense task periods to complete ${correlations.completedTaskCount} tasks. We recommend shifting to warm home-brews to buffer your visual focus and protect savings rate.`
    },
    { 
      from: 'habit_streaks', 
      to: 'spend_coffee', 
      labelId: 'habit_spend',
      title: language === 'id' ? 'Sinergi Disiplin Finansial' : language === 'es' ? 'Correlación de Hábitos y Control de Gastos' : language === 'de' ? 'Gewohnheiten & Impulskontrolle' : language === 'ar' ? 'العادات وضبط النفقات' : 'Habit & Impulsive Control Correlation',
      explain: language === 'id' 
        ? `Saat modular pelacak kebiasaan Anda aktif (${correlations.activeHabitsChecked} Habits), tingkat rasionalitas belanja juga meningkat. Setiap habit baik yang tercentang harian secara otomatis menahan impuls belanja berlebih karena peningkatan kepuasan mental/dopamin organik!` 
        : language === 'es'
        ? `Nuestro índice revela que mantener rachas altas de hábitos (${correlations.activeHabitsChecked} activos) disminuye las compras por impulso. Las pausas conscientes y la meditación actúan como recompensas naturales para tu cerebro.`
        : language === 'de'
        ? `Gute Gewohnheits-Routinen (${correlations.activeHabitsChecked} aktiv) reduzieren Spontanausgaben deutlich. Bewusste Pausen stärken die Willenskraft für gesunde Finanzen.`
        : language === 'ar'
        ? `الحفاظ على سلسلة العادات الإيجابية (${correlations.activeHabitsChecked} عادات) يقلل بشكل ملحوظ من الشراء الاندفاعي ويعزز الانضباط المالي الذاتي.`
        : `Our core index reveals high habit streaks (${correlations.activeHabitsChecked} active) decreases dopamine-seeking retail purchases. Engaging in mental meditations or physical stretches acts as natural mental rewards!`
    }
  ];

  // 4. WEEKLY AUTO-WRAP CENTER
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
      let generated = "";
      if (language === 'es') {
        generated = `★★★ INFORME SEMANAL DE RESUMEN LIFEFLOW ★★★
Generado para: ${user?.displayName || 'Usuario'} (${user?.email || 'Guest@lifeflow.app'})
Fecha: ${new Date().toLocaleDateString('es-ES')}

1. FINANZAS Y PRESUPUESTO
---------------------------------------
• Ingresos Totales    : Rp ${totalIncome.toLocaleString()}
• Gastos Totales      : Rp ${totalExpense.toLocaleString()}
• Ahorro Neto         : Rp ${netSavings.toLocaleString()}
• Estado              : ${netSavings >= 0 ? "Superávit Saludable" : "Alerta de Déficit"}

2. PRODUCTIVIDAD Y HÁBITOS
---------------------------------------
• Tareas Completadas  : ${tasks.filter(t => t.completed).length} de ${tasks.length}
• Hábitos Activos     : ${habits.length} hábitos monitoreados
• Tasa de Cumplimiento: ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. RECOMENDACIONES DEL ASESOR LIFEFLOW AI
---------------------------------------
"¡Excelente trabajo manteniendo la consistencia! Continúa utilizando las sesiones de enfoque con regularidad, optimiza tus gastos diarios y guarda este reporte en tu nube personal."`;
      } else if (language === 'id') {
        generated = `★★★ LIFEFLOW SYSTEM WEEKLY WRAP-UP REPORT ★★★
Generated for: ${user?.displayName || 'User'} (${user?.email || 'Guest@lifeflow.app'})
Date: ${new Date().toLocaleDateString('id-ID')}

1. KEUANGAN & ANGGARAN (FINANCES)
---------------------------------------
• Total Pendapatan  : Rp ${totalIncome.toLocaleString()}
• Total Pengeluaran : Rp ${totalExpense.toLocaleString()}
• Simpanan Bersih   : Rp ${netSavings.toLocaleString()}
• Status            : ${netSavings >= 0 ? "Surplus Sehat" : "Dilema Defisit"}

2. PRODUKTIVITAS & KEBIASAAN (PRODUCTIVITY)
---------------------------------------
• Tugas Terselesaikan : ${tasks.filter(t => t.completed).length} dari ${tasks.length}
• Kebiasaan Aktif     : ${habits.length} kebiasaan baik terdokumentasi
• Rasio Fokus         : ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. REKOMENDASI SISTEM LIFEFLOW AI COACH
---------------------------------------
"Kerja hebat mempertahankan stabilitas rutinitas! Optimalkan fokus harian Anda melalui Focus Room secara disiplin, batasi pengeluaran instan di kedai kopi, dan simpan laporan ringkas otomatis ini ke media cloud pribadi Anda."`;
      } else {
        generated = `★★★ LIFEFLOW SYSTEM WEEKLY WRAP-UP REPORT ★★★
Generated for: ${user?.displayName || 'User'} (${user?.email || 'Guest@lifeflow.app'})
Date: ${new Date().toLocaleDateString('en-US')}

1. FINANCES & BUDGETING
---------------------------------------
• Total Income      : Rp ${totalIncome.toLocaleString()}
• Total Expense     : Rp ${totalExpense.toLocaleString()}
• Net Savings       : Rp ${netSavings.toLocaleString()}
• Health Status     : ${netSavings >= 0 ? "Healthy Surplus" : "Deficit Alert"}

2. PRODUCTIVITY & ROUTINES
---------------------------------------
• Tasks Completed   : ${tasks.filter(t => t.completed).length} of ${tasks.length}
• Active Habits     : ${habits.length} healthy habits monitored
• Focus Ratio       : ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. LIFEFLOW AI COACH RECOMMENDATION
---------------------------------------
"Outstanding work maintaining routine stability! Optimize your daily focus via the Focus Chamber, keep impulsive cafe sprees guarded, and sync your weekly summary to your personal cloud."`;
      }

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
      const emailSubject = encodeURIComponent(
        language === 'es' ? "LifeFlow - Mi Resumen Semanal de Rendimiento" :
        language === 'id' ? "LifeFlow - Ringkasan Laporan Mingguan Saya" :
        "LifeFlow - My Automated Weekly Performance Wrap-up"
      );
      const emailBody = encodeURIComponent(recapText);
      const mailtoLink = `mailto:${user?.email || ''}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');
      setGmailStatus(language === 'es' ? "¡Borrador abierto en tu aplicación de correo!" : language === 'id' ? "Berhasil membuka draf aplikasi email!" : "Succesfully initialized local email program!");
    } catch (e) {
      setGmailStatus(language === 'es' ? "Borrador preparado. Puedes copiar el texto a continuación." : language === 'id' ? "Draf berhasil disiapkan. Anda dapat menyalin teks laporan di bawah." : "Draft processed safely! Feel free to copy output below.");
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
              {language === 'es' 
                ? "Espacio de hiperproductividad: Sonidos de enfoque, sincronización del clima con hábitos, mapa mental y resúmenes semanales."
                : language === 'id' 
                ? "Optimalisasi cerdas: Audio Fokus, Perencana Cuaca, Peta Pola Korelasi, dan Sinkronisasi Wrap-Up."
                : language === 'de'
                ? "Fokus-Audio, wetterbasierte Gewohnheiten, interaktive Mindmap und automatische Wochenübersichten."
                : language === 'ar'
                ? "مساحة إنتاجية فائقة: أصوات التركيز، مواءمة الطقس والعادات، خريطة الترابط الذهنية، والملخص الأسبوعي."
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
          { id: 'focus', label: language === 'es' ? 'Sesión de Enfoque' : language === 'id' ? 'Sesi Fokus & Audio' : language === 'de' ? 'Fokus-Raum' : language === 'ar' ? 'جلسة التركيز' : 'Focus Space', icon: Compass },
          { id: 'weather', label: language === 'es' ? 'Planificador de Clima' : language === 'id' ? 'Perencana Cuaca Pintar' : language === 'de' ? 'Wetter-Planer' : language === 'ar' ? 'مخطط الطقس' : 'Weather Habit Coach', icon: CloudSun },
          { id: 'mindmap', label: language === 'es' ? 'Mapa Mental de Hábitos' : language === 'id' ? 'Peta Pikiran Korelasi' : language === 'de' ? 'Interaktive Mindmap' : language === 'ar' ? 'الخريطة الذهنية' : 'Interactive Mind Map', icon: Activity },
          { id: 'wrapup', label: language === 'es' ? 'Resumen Semanal Auto' : language === 'id' ? 'Weekly Auto-Wrap' : language === 'de' ? 'Wochenabschluss' : language === 'ar' ? 'الملخص الأسبوعي' : 'Automated Weekly Wrap', icon: FileText }
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
                  {language === 'es' ? 'Cámara de Enfoque Pomodoro' : language === 'id' ? 'Fokus Cerdas Pomodoro' : 'Aesthetic Smart Pomodoro Chamber'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'es' 
                    ? "Sincroniza tus tareas diarias con temporizadores Pomodoro y ondas sonoras binaurales generadas en tu navegador."
                    : language === 'id' 
                    ? "Integrasikan tugas harian Anda langsung dengan pewaktu Pomodoro diiringi frekuensi gelombang ambient prosedural dari browser Anda."
                    : "Directly sync calendar agenda tasks with visual Pomodoro timers layered with procedural, client-side synthesized binaural waves."}
                </p>
              </div>

              {/* Linked Task Selector */}
              <div className="bg-slate-950/80 p-4 border border-white/5 rounded-xl flex flex-col gap-3">
                <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Target size={12} />
                  {language === 'es' ? 'Vincular Tarea del Horario' : language === 'id' ? 'Hubungkan Agenda Tugas' : 'Link Active Daily Task'}
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-slate-900 border border-white/10 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                >
                  <option value="">
                    {language === 'es' ? '-- Seleccionar Tarea para Enfocarte --' : language === 'id' ? '-- Pilih Tugas untuk Difokuskan --' : '-- Choose Task to Focus On --'}
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
                    {language === 'es' ? '¡Al terminar el temporizador, la tarea seleccionada pasará a Completada automáticamente!' : language === 'id' ? 'Setelah beres, tugas terpilih akan otomatis beralih ke status Selesai di sistem!' : 'When timer finishes, this selected task will auto-transition to Completed status!'}
                  </div>
                )}
              </div>

              {/* Procedural Preset Audio Board */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-2">
                  <Volume2 size={12} />
                  {language === 'es' ? "Paisajes Sonoros de Concentración (En Vivo)" : language === 'id' ? "Aliran Audio Soundscape (Klik Untuk Aktifkan)" : "Choose Procedural Focus Soundscape (Plays live!)"}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'zen', name: language === 'es' ? 'Templo Zen' : language === 'id' ? 'Kuil Zen' : 'Zen Ancient', desc: '110Hz Binaural' },
                    { id: 'space', name: language === 'es' ? 'Espacio Profundo' : language === 'id' ? 'Cyber Space' : 'Deep Spacey', desc: 'LFO Tri Drone' },
                    { id: 'rain', name: language === 'es' ? 'Lluvia en Cabaña' : language === 'id' ? 'Rintik Kafe' : 'Rain Cabin', desc: 'Warm Lowpass' },
                    { id: 'waves', name: language === 'es' ? 'Olas del Océano' : language === 'id' ? 'Debur Ombak' : 'Ocean Wave', desc: 'Slow Swell Noise' }
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
                          {activeNoise ? (language === 'es' ? '● ACTIVO' : language === 'id' ? '● AKTIF' : '● ACTIVE') : (language === 'es' ? 'APAGADO' : language === 'id' ? 'MATI' : 'OFF')}
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
                  {language === 'es' ? 'Enfoque (25m)' : 'Focus (25m)'}
                </button>
                <button 
                  onClick={() => selectPomoMode('short_break')}
                  className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider ${pomoMode === 'short_break' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}
                >
                  {language === 'es' ? 'Pausa (5m)' : 'Break (5m)'}
                </button>
                <button 
                  onClick={() => selectPomoMode('long_break')}
                  className={`px-3 py-1 rounded-md transition-all font-bold uppercase tracking-wider ${pomoMode === 'long_break' ? 'bg-violet-500 text-white' : 'text-slate-400'}`}
                >
                  {language === 'es' ? 'Pausa Larga (15m)' : 'Long Break (15m)'}
                </button>
              </div>

              {/* Clock face */}
              <div className="relative w-44 h-44 rounded-full border-2 border-dashed border-violet-500/20 flex flex-col items-center justify-center my-4 overflow-hidden bg-slate-950/40">
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
                  title={pomoActive ? (language === 'es' ? "Pausar" : "Pause") : (language === 'es' ? "Iniciar" : "Start")}
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
                <button
                  onClick={() => setIsFloating(!isFloating)}
                  className={`w-12 h-12 border rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isFloating
                      ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500 hover:shadow-md'
                      : 'bg-slate-900 border-white/5 hover:border-slate-700 text-slate-300'
                  }`}
                  title={language === 'es' ? "Flotar temporizador" : "Float Timer on Screen"}
                >
                  <Pin size={16} className={isFloating ? "rotate-45 text-violet-200 animate-pulse" : ""} />
                </button>
              </div>

              <div className="text-[10px] text-slate-500 mt-4 text-center font-mono max-w-[200px]">
                {language === 'es' ? 'La calma y la disciplina construyen grandes logros.' : language === 'id' ? 'Fokus yang terarah bermula dari satu tarikan pernapasan.' : 'Calm minds build great empires. Match breathing to the guide.'}
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
                  {language === 'es' ? 'Coordinador Inteligente de Hábitos y Clima' : language === 'id' ? 'Asisten Perencana Aktivitas Berbasis Cuaca' : 'Smart Weather & Habit Coordinator'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'es' 
                    ? "Sincroniza tus rutinas de ejercicio al aire libre y hábitos diarios según el pronóstico meteorológico."
                    : language === 'id' 
                    ? "Menghubungkan kalender olahraga dan habit kebiasaan Anda dengan sistem perkiraan cuaca geolokasi."
                    : "Dynamically synchronizes outdoor fitness routines and daily habits with forecast indices."}
                </p>
              </div>

              {/* Set simulated params */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <MapPin size={11} />
                  {language === 'es' ? 'Simular:' : 'Simulation:'}
                </span>
                <select
                  value={weatherType}
                  onChange={(e) => setWeatherType(e.target.value as any)}
                  className="bg-slate-900 border border-white/10 rounded-lg py-1 px-3 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="sunny">{language === 'es' ? '☀️ Soleado y Templado' : '☀️ Sunny & Soft'}</option>
                  <option value="rainy">{language === 'es' ? '🌧️ Lluvia Ligera' : '🌧️ Drizzle Rain'}</option>
                  <option value="storm">{language === 'es' ? '⛈️ Tormenta Eléctrica' : '⛈️ Thunderstorm'}</option>
                  <option value="windy">{language === 'es' ? '🍃 Viento Fresco' : '🍃 High Breeze Wind'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 bg-slate-950/60 p-6 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider font-mono">
                  {language === 'es' ? 'Pronóstico Actual' : 'Current Forecast'}
                </span>
                <h4 className="text-base font-bold text-slate-200 mt-1 mb-4 flex items-center gap-1.5">
                  <MapPin size={14} className="text-violet-400" />
                  {selectedCity}
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
                  {weatherType === 'sunny' ? (language === 'es' ? 'Soleado y Despejado' : 'Sunny') : weatherType === 'rainy' ? (language === 'es' ? 'Lluvia Moderada' : 'Rainy') : weatherType === 'storm' ? (language === 'es' ? 'Tormenta' : 'Storm') : (language === 'es' ? 'Brisa Fresca' : 'Windy')}
                </span>
              </div>

              {/* Coach Advisory */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="bg-gradient-to-r from-violet-600/10 to-transparent p-5 border border-violet-500/20 rounded-2xl">
                  <label className="text-[11px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={12} className="animate-bounce" />
                    AI Habit Planner Recommendations
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

                {/* Active Habits List */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {language === 'es' ? 'Análisis de Impacto en Hábitos' : language === 'id' ? 'Status Penyelarasan Kebiasaan' : 'Habits Impact Analysis'}
                  </span>
                  <div className="space-y-2">
                    {activeHabits.length === 0 ? (
                      <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-center text-xs text-slate-500">
                        {language === 'es' ? 'No hay hábitos activos para analizar. ¡Añade uno en el Rastreador!' : language === 'id' ? 'Tidak ada kebiasaan aktif untuk diselaraskan.' : 'No active habits inside tracking. Go to Habit Tracker to add!'}
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
                                  {isOutdoor ? (language === 'es' ? 'Tipo: Físico al aire libre' : language === 'id' ? 'Tipe: Luar Ruangan' : 'Type: Outdoor physical') : (language === 'es' ? 'Tipo: Interior / Flexible' : language === 'id' ? 'Tipe: Dalam Ruang' : 'Type: Indoor / Flexible')}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${statusColor}`}>
                              {weatherType === 'sunny' || !isOutdoor 
                                ? (language === 'es' ? 'ÓPTIMO' : 'OPTIMAL') 
                                : (language === 'es' ? 'ALTERNATIVA SUGERIDA' : 'RECOMMEND ALTERNATIVE')}
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
                {language === 'es' ? 'Mapa Mental de Correlaciones y Gastos' : language === 'id' ? 'Peta Korelasi Kehidupan Cerdas & Pengeluaran' : 'Life-Flow Cross Correlation Mind Map'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'es' 
                  ? "Visualiza las relaciones de causa y efecto entre tus gastos cotidianos y tu rendimiento en los objetivos."
                  : language === 'id' 
                  ? "Sistem memetakan relasi sebab-akibat kebiasaan belanja dengan tingkat ketercapaian fokus kalender Anda."
                  : "Conceptual network visualizing direct cause-effect correlation indices between social spends and calendar executions."}
              </p>
            </div>

            <div className="relative w-full min-h-[300px] bg-slate-950 rounded-2xl border border-white/5 p-4 flex flex-col md:flex-row gap-6 overflow-hidden">
              <div className="flex-1 min-h-[220px] relative">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 150 120 Q 320 280 500 120" fill="none" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="2" strokeDasharray="5,5" />
                  <path d="M 150 120 L 320 280" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="2" />
                  <path d="M 320 280 L 500 120" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="2" />
                </svg>

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
                          ? (language === 'es' ? 'Los altos gastos en café boutique indican fatiga y búsqueda de gratificación rápida.' : language === 'id' ? 'Belanja kafe instan tinggi mengindikasikan lonjakan korelasi tingkat kelelahan mental atau kebosanan rutinitas pagi.' : 'High boutique caffeine spends indicate micro-stress fatigue cycles, pushing you into immediate instant-gratification spending.')
                          : selectedNode === 'focus_completed'
                          ? (language === 'es' ? 'El cumplimiento constante de tareas se relaciona estrechamente con un buen descanso y alta energía.' : language === 'id' ? 'Konsistensi penyelesaian agenda berkaitan erat dengan stabilitas kualitas istirahat malam dan hidrasi seluler.' : 'Consistently completed scheduled lists correlate tightly with deep recovery cycles and lower screen times.')
                          : (language === 'es' ? 'Las rachas de hábitos estables protegen tu concentración y previenen impulsos innecesarios.' : language === 'id' ? 'Modular streak kebiasaan menstabilkan detak fokus harian Anda, bertindak sebagai jangkar emosional penolak stres belanja.' : 'Strict habit streaks buffer cognitive stamina, shielding user from retail spending surges.')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                    <HelpCircle size={28} className="text-slate-600 mb-2" />
                    <p className="text-[11px] leading-relaxed">
                      {language === 'es' ? 'Haz clic en cualquier nodo del mapa para ver el análisis de correlación del Asesor IA.' : language === 'id' ? 'Klik salah satu node penghubung di peta kiri untuk menelaah relasi korelasi kehidupan dari AI Coach!' : 'Select any connected lifestyle node in the mind map left to reveal deep correlation analysis.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Correlations lists */}
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
                {language === 'es' ? 'Centro de Resumen Semanal Automatizado y Nube' : language === 'id' ? 'Pusat Rangkuman Mingguan Otomatis & Google Drive' : 'Automated Email Wrap & Cloud Sync Center'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'es' 
                  ? "La IA recopila resúmenes completos combinando finanzas, productividad y hábitos en un reporte unificado."
                  : language === 'id' 
                  ? "Sistem menyusun ringkasan mendalam dari kombinasi perolehan target keuangan dan kebiasaan Anda untuk draf email otomatis."
                  : "AI compiles complete weekly summaries combining finance streams, task rates, and saves directly to cloud folders."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 bg-slate-950/60 border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                    Cloud Compilation Engine
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'es' ? 'Agrupa saldos, cumplimiento de agenda y metas en un archivo de informe conciso.' : language === 'id' ? 'Menyatukan audit total saldo tabungan, penyelesaian tugas, dan kebiasaan ke dokumen ringkas.' : 'Aggregates transactions balance, completed habit counters, and updates into single text rapport files.'}
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
                        {language === 'es' ? "Generar Resumen" : language === 'id' ? "Kompilasi Laporan" : "Compile Weekly Wrap"}
                      </>
                    )}
                  </button>
                  {wrapupGenerated && (
                    <button
                      onClick={handleDriveSync}
                      className="w-full h-10 bg-slate-900 border border-white/5 hover:border-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FolderSync size={14} className={driveSyncStatus === 'syncing' ? 'animate-spin' : ''} />
                      {driveSyncStatus === 'idle' && (language === 'es' ? "Sincronizar con Drive" : language === 'id' ? "Sinkr. Google Drive" : "Sync Google Drive")}
                      {driveSyncStatus === 'syncing' && (language === 'es' ? "Conectando..." : language === 'id' ? "Menghubungkan..." : "Syncing to Cloud...")}
                      {driveSyncStatus === 'completed' && (language === 'es' ? "¡Guardado en Drive!" : language === 'id' ? "Berhasil Disimpan!" : "Saved in Drive!")}
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

                      <button
                        onClick={handleGmailDraft}
                        className="text-xs text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1.5 focus:outline-none"
                      >
                        <Mail size={13} />
                        {language === 'es' ? "Borrador en Gmail" : language === 'id' ? "Salurkan ke Gmail" : "Draft in Gmail"}
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
                      {language === 'es' 
                        ? "Haz clic en 'Generar Resumen' para agregar las estadísticas reales de tus finanzas y productividad."
                        : language === 'id' 
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
