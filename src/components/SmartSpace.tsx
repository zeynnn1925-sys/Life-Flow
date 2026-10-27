import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  SpeakerHigh, 
  SpeakerSlash, 
  Play, 
  Pause, 
  ArrowsCounterClockwise, 
  Headphones, 
  CloudSun, 
  CloudRain, 
  Sun, 
  Lightning,
  Target, 
  CheckCircle, 
  FileText,
  EnvelopeSimple,
  ArrowsClockwise,
  Compass,
  TrendDown,
  Pulse,
  Trophy,
  ArrowRight,
  Smiley,
  MapPin,
  Fire,
  Question,
  PushPin
} from '@phosphor-icons/react';
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

  // Generate automated recommendation based on current habits and weather
  const activeHabits = useMemo(() => habits, [habits]);

  const updateWeatherRecommendation = () => {
    setIsSyncingWeatherPlan(true);
    setTimeout(() => {
      let advice = "";
      if (weatherType === 'sunny') {
        if (language === 'id') {
          advice = "Cuaca di luar sangat cerah. Momentum yang baik untuk melakukan olahraga outdoor Anda, melatih kedisiplinan jalan pagi, dan berjemur.";
        } else if (language === 'es') {
          advice = "El clima afuera está despejado. Excelente oportunidad para hacer ejercicio al aire libre y mantener tus rutinas de caminata.";
        } else if (language === 'de') {
          advice = "Das Wetter ist sonnig. Guter Moment für Outdoor-Workouts und Spaziergänge.";
        } else if (language === 'ar') {
          advice = "الطقس مشمس بالخارج. فرصة جيدة للتمارين الرياضية في الهواء الطلق والمشي الصباحي.";
        } else {
          advice = "The weather is sunny outside. A great opportunity to tackle outdoor workouts and maintain your morning walk routine.";
        }
      } else if (weatherType === 'rainy') {
        if (language === 'id') {
          advice = "Hujan rintik di luar. Sangat direkomendasikan untuk memindahkan aktivitas ke dalam ruangan: lakukan yoga atau latihan di rumah, dan gunakan waktu tenang ini untuk membaca.";
        } else if (language === 'es') {
          advice = "Lluvia ligera afuera. Recomendamos trasladar el ejercicio a casa y aprovechar el ambiente tranquilo para leer o estudiar.";
        } else if (language === 'de') {
          advice = "Leichter Regen fällt. Nutzen Sie diese ruhige Zeit für Übungen im Innenbereich oder zum Lesen.";
        } else if (language === 'ar') {
          advice = "أمطار خفيفة بالخارج. ننصحك بممارسة التمارين في الداخل واستغلال الهدوء للقراءة والدراسة.";
        } else {
          advice = "Light rain is falling. Recommended to shift exercise indoors with yoga or home workouts, and use this quiet atmosphere to focus on reading.";
        }
      } else if (weatherType === 'storm') {
        if (language === 'id') {
          advice = "Hujan lebat di luar. Hindari perjalanan yang tidak mendesak. Luangkan waktu untuk latihan pernapasan dan fokus selesaikan tugas-tugas meja Anda.";
        } else if (language === 'es') {
          advice = "Tormenta afuera. Evita salidas innecesarias, practica respiración consciente y enfócate en tus tareas de escritorio.";
        } else if (language === 'de') {
          advice = "Gewitter draußen. Bitte im Innenbereich bleiben, Atemübungen machen und konzentriert am Schreibtisch arbeiten.";
        } else if (language === 'ar') {
          advice = "عاصفة بالخارج. يرجى البقاء في الداخل والتركيز على مهامك المكتبية مع تمارين تنفس مهدئة.";
        } else {
          advice = "Heavy thunderstorm outside. Avoid non-essential outdoor trips, take moments for breathing exercises, and focus on desk priorities.";
        }
      } else {
        if (language === 'id') {
          advice = "Angin sepoi-sepoi berembus. Suasana nyaman untuk menyalakan audio fokus, berjalan santai sejenak untuk menyegarkan pikiran, dan menjaga hidrasi air mineral.";
        } else if (language === 'es') {
          advice = "Brisa agradable. Ideal para activar sonidos de enfoque, dar un paseo breve para despejar la mente y mantenerte hidratado.";
        } else if (language === 'de') {
          advice = "Frische Brise draußen. Ideal für Fokus-Audio, kurze Spaziergänge und gute Flüssigkeitszufuhr.";
        } else if (language === 'ar') {
          advice = "رياح لطيفة. أجواء مثالية لتشغيل صوت التركيز، والمشي القصير لتجديد النشاط مع شرب الماء.";
        } else {
          advice = "Gentle breeze outside. Ideal condition to turn on ambient focus audio, take a short refreshing stroll, and stay well hydrated.";
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
      color: '#C8A27C', 
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
      title: language === 'id' ? 'Efek Pembengkakan Pengeluaran' : language === 'es' ? 'Dinámica de Gastos y Enfoque' : language === 'de' ? 'Fokus- & Ausgaben-Dynamik' : language === 'ar' ? 'نفقات التركيز' : 'Focus and Spending Dynamics',
      explain: language === 'id' 
        ? `Secara riil, Anda mengalokasikan Rp ${correlations.cafeExpenses.toLocaleString()} pada makanan & cafe. Pengeluaran kafe yang tinggi sering bertepatan dengan penyelesaian ${correlations.completedTaskCount} tugas. Menyiapkan minuman di rumah membantu menjaga anggaran tetap terkendali tanpa mengurangi produktivitas.` 
        : language === 'es'
        ? `Analizando registros: has asignado Rp ${correlations.cafeExpenses.toLocaleString()} a gastos sociales/café. Se observa compras en momentos de alta carga para completar ${correlations.completedTaskCount} tareas. Preparar bebidas en casa protege tus ahorros y mantiene un ritmo constante.`
        : language === 'de'
        ? `Auswertung: Du hast Rp ${correlations.cafeExpenses.toLocaleString()} für Café/Gastronomie ausgegeben. Dieses Muster tritt häufig bei intensiven Arbeitsphasen auf (${correlations.completedTaskCount} Aufgaben). Selbstgemachte Getränke schonen das Budget bei gleicher Produktivität.`
        : language === 'ar'
        ? `تحليل البيانات: تم إنفاق Rp ${correlations.cafeExpenses.toLocaleString()} في المقاهي والمطاعم بالتزامن مع إنهاء ${correlations.completedTaskCount} مهام. إعداد مشروباتك بنفسك يحمي ميزانيتك.`
        : `Analyzing records: you have allocated Rp ${correlations.cafeExpenses.toLocaleString()} towards cafe and dining during execution of ${correlations.completedTaskCount} tasks. Preparing beverages at your workspace helps manage budget effectively.`
    },
    { 
      from: 'habit_streaks', 
      to: 'spend_coffee', 
      labelId: 'habit_spend',
      title: language === 'id' ? 'Sinergi Disiplin Rutinitas' : language === 'es' ? 'Correlación de Hábitos y Control de Gastos' : language === 'de' ? 'Gewohnheiten & Impulskontrolle' : language === 'ar' ? 'العادات وضبط النفقات' : 'Routine & Spending Correlation',
      explain: language === 'id' 
        ? `Saat modular pelacak kebiasaan Anda aktif (${correlations.activeHabitsChecked} kebiasaan), tingkat keteraturan harian meningkat. Kebiasaan yang teratur membantu menekan pengeluaran spontan.` 
        : language === 'es'
        ? `Mantener rutinas altas de hábitos (${correlations.activeHabitsChecked} activos) disminuye las compras por impulso.`
        : language === 'de'
        ? `Gute Gewohnheits-Routinen (${correlations.activeHabitsChecked} aktiv) reduzieren Spontanausgaben deutlich.`
        : language === 'ar'
        ? `الحفاظ على سلسلة العادات الإيجابية (${correlations.activeHabitsChecked} عادات) يقلل من الشراء الاندفاعي.`
        : `Maintaining strong habit consistency (${correlations.activeHabitsChecked} active) correlates with reduced impulsive spending.`
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
        generated = `INFORME SEMANAL DE RENDIMIENTO LIFEFLOW
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

3. RESUMEN DE ENFOQUE
---------------------------------------
"Continúa utilizando las sesiones de enfoque con regularidad, optimiza tus gastos diarios y mantén este reporte para tu archivo personal."`;
      } else if (language === 'id') {
        generated = `LAPORAN RINGKASAN MINGGUAN LIFEFLOW
Dibuat untuk: ${user?.displayName || 'User'} (${user?.email || 'Guest@lifeflow.app'})
Tanggal: ${new Date().toLocaleDateString('id-ID')}

1. KEUANGAN & ANGGARAN
---------------------------------------
• Total Pendapatan  : Rp ${totalIncome.toLocaleString()}
• Total Pengeluaran : Rp ${totalExpense.toLocaleString()}
• Simpanan Bersih   : Rp ${netSavings.toLocaleString()}
• Status            : ${netSavings >= 0 ? "Surplus Sehat" : "Perhatian Defisit"}

2. PRODUKTIVITAS & KEBIASAAN
---------------------------------------
• Tugas Selesai       : ${tasks.filter(t => t.completed).length} dari ${tasks.length}
• Kebiasaan Aktif     : ${habits.length} kebiasaan terpantau
• Rasio Penyelesaian  : ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. CATATAN KONSISTENSI
---------------------------------------
"Kerja terarah mempertahankan ritme rutinitas. Gunakan ruang fokus secara konsisten, jaga rasionalitas pengeluaran, dan simpan catatan mingguan ini untuk evaluasi berkala."`;
      } else {
        generated = `LIFEFLOW WEEKLY PERFORMANCE SUMMARY
Generated for: ${user?.displayName || 'User'} (${user?.email || 'Guest@lifeflow.app'})
Date: ${new Date().toLocaleDateString('en-US')}

1. FINANCES & BUDGETING
---------------------------------------
• Total Income      : Rp ${totalIncome.toLocaleString()}
• Total Expense     : Rp ${totalExpense.toLocaleString()}
• Net Savings       : Rp ${netSavings.toLocaleString()}
• Status            : ${netSavings >= 0 ? "Healthy Surplus" : "Deficit Warning"}

2. PRODUCTIVITY & ROUTINES
---------------------------------------
• Tasks Completed   : ${tasks.filter(t => t.completed).length} of ${tasks.length}
• Active Habits     : ${habits.length} healthy habits monitored
• Focus Ratio       : ${tasks.length > 0 ? ((tasks.filter(t => t.completed).length / tasks.length) * 100).toFixed(0) : 0}%

3. CONSISTENCY SUMMARY
---------------------------------------
"Consistent progress across your weekly milestones. Keep utilizing quiet focus sessions and preserve your savings pace."`;
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
        language === 'es' ? "LifeFlow - Resumen Semanal de Rendimiento" :
        language === 'id' ? "LifeFlow - Ringkasan Laporan Mingguan" :
        "LifeFlow - Weekly Performance Summary"
      );
      const emailBody = encodeURIComponent(recapText);
      const mailtoLink = `mailto:${user?.email || ''}?subject=${emailSubject}&body=${emailBody}`;
      window.open(mailtoLink, '_blank');
      setGmailStatus(language === 'es' ? "Borrador abierto en tu aplicación de correo." : language === 'id' ? "Draf email berhasil dibuka." : "Email draft initialized.");
    } catch (e) {
      setGmailStatus(language === 'es' ? "Borrador preparado. Puedes copiar el texto a continuación." : language === 'id' ? "Draf berhasil disiapkan. Anda dapat menyalin teks laporan di bawah." : "Draft processed safely.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center border border-hairline text-[#C8A27C]">
            <Headphones size={20} weight="regular" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              {language === 'id' ? 'Ruang Fokus & Kinerja' : 'Focus & Performance Space'}
            </h1>
            <p className="text-xs text-slate-400">
              {language === 'es' 
                ? "Espacio de trabajo calmado: Sonidos de enfoque, sincronización del clima con hábitos, mapa de correlación y resúmenes semanales."
                : language === 'id' 
                ? "Alat bantu fokus: Audio konsentrasi, penyelarasan aktivitas cuaca, korelasi pola, dan ringkasan mingguan."
                : language === 'de'
                ? "Fokus-Audio, wetterbasierte Gewohnheiten, interaktive Mindmap und Wochenübersichten."
                : language === 'ar'
                ? "مساحة التركيز والإنتاجية: أصوات التركيز، مواءمة الطقس، خريطة الترابط، والملخص الأسبوعي."
                : "Focused workspace: Concentration sounds, weather habit alignment, lifestyle correlations, and weekly summaries."}
            </p>
          </div>
        </div>

        {/* Global Soundbar Volume Indicator */}
        {isPlayingNoise && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 px-3 py-2 bg-[#12141c] border border-hairline rounded-lg text-xs"
          >
            <SpeakerHigh size={16} weight="regular" className="text-[#C8A27C]" />
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
              className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#C8A27C]"
            />
          </motion.div>
        )}
      </div>

      {/* Tabs */}
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-surface-2/60 rounded-lg border border-hairline max-w-fit">
        {[
          { id: 'focus', label: language === 'es' ? 'Sesión de Enfoque' : language === 'id' ? 'Sesi Fokus & Audio' : language === 'de' ? 'Fokus-Raum' : language === 'ar' ? 'جلسة التركيز' : 'Focus Space', icon: Compass },
          { id: 'weather', label: language === 'es' ? 'Planificador de Clima' : language === 'id' ? 'Penyelarasan Cuaca' : language === 'de' ? 'Wetter-Planer' : language === 'ar' ? 'مخطط الطقس' : 'Weather Habit Coach', icon: CloudSun },
          { id: 'mindmap', label: language === 'es' ? 'Mapa Mental de Hábitos' : language === 'id' ? 'Peta Korelasi' : language === 'de' ? 'Interaktive Mindmap' : language === 'ar' ? 'الخريطة الذهنية' : 'Interactive Mind Map', icon: Pulse },
          { id: 'wrapup', label: language === 'es' ? 'Resumen Semanal' : language === 'id' ? 'Ringkasan Mingguan' : language === 'de' ? 'Wochenabschluss' : language === 'ar' ? 'الملخص الأسبوعي' : 'Weekly Summary', icon: FileText }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                isSelected 
                  ? 'bg-white/10 text-white border border-white/10' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={15} weight={isSelected ? 'regular' : 'light'} className={isSelected ? 'text-[#C8A27C]' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Tab Render Space */}
      <div className="bg-[#0b0c10] border border-hairline rounded-xl p-6 min-h-[420px] shadow-sm relative overflow-visible">
        
        {/* TAB 1: FOCUS SPACE */}
        {activeTab === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
              <div>
                <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                  <Compass size={18} weight="regular" className="text-[#C8A27C]" />
                  {language === 'es' ? 'Cámara de Enfoque Pomodoro' : language === 'id' ? 'Ruang Fokus Pomodoro' : 'Focus Pomodoro Chamber'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'es' 
                    ? "Sincroniza tus tareas diarias con temporizadores Pomodoro y ondas sonoras generadas en tu navegador."
                    : language === 'id' 
                    ? "Integrasikan tugas harian Anda langsung dengan pewaktu Pomodoro diiringi frekuensi gelombang ambient dari browser Anda."
                    : "Directly sync calendar agenda tasks with visual Pomodoro timers layered with synthesized ambient waves."}
                </p>
              </div>

              {/* Linked Task Selector */}
              <div className="bg-surface-2 p-4 border border-hairline rounded-lg flex flex-col gap-3">
                <label className="text-[11px] font-semibold text-[#C8A27C] uppercase tracking-wider flex items-center gap-2">
                  <Target size={14} weight="regular" />
                  {language === 'es' ? 'Vincular Tarea del Horario' : language === 'id' ? 'Hubungkan Agenda Tugas' : 'Link Active Daily Task'}
                </label>
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="bg-surface-1 border border-hairline rounded-md p-2 text-xs text-slate-300 focus:outline-none focus:border-[#C8A27C]"
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
                    <CheckCircle size={13} weight="regular" />
                    {language === 'es' ? 'Al terminar el temporizador, la tarea seleccionada pasará a Completada automáticamente.' : language === 'id' ? 'Setelah waktu selesai, tugas terpilih akan otomatis berstatus Selesai.' : 'When timer finishes, this selected task will auto-transition to Completed status.'}
                  </div>
                )}
              </div>

              {/* Procedural Preset Audio Board */}
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-semibold text-[#C8A27C] uppercase tracking-wider flex items-center gap-2">
                  <SpeakerHigh size={14} weight="regular" />
                  {language === 'es' ? "Paisajes Sonoros de Concentración" : language === 'id' ? "Pilihan Audio Ambien Fokus" : "Focus Soundscapes"}
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
                            ? 'bg-white/10 border-white/20 text-white' 
                            : 'bg-surface-2 border-hairline hover:border-hairline-strong text-slate-400'
                        }`}
                      >
                        <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{preset.desc}</span>
                        <span className={`text-[9px] font-medium uppercase mt-1 tracking-wider self-end ${activeNoise ? 'text-[#C8A27C]' : 'text-slate-600'}`}>
                          {activeNoise ? (language === 'es' ? 'Aktif' : language === 'id' ? 'Aktif' : 'Active') : (language === 'es' ? 'Mati' : language === 'id' ? 'Mati' : 'Off')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Visual Timer and Breathing Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center bg-surface-2 p-6 border border-hairline rounded-xl relative order-1 lg:order-2 sticky top-2 lg:top-4 z-20 shadow-md">
              
              {/* Mode Buttons */}
              <div className="flex gap-1 bg-surface-1 p-1 rounded-md border border-hairline mb-6 text-[10px]">
                <button 
                  onClick={() => selectPomoMode('focus')}
                  className={`px-3 py-1 rounded transition-all font-medium uppercase tracking-wider ${pomoMode === 'focus' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                >
                  {language === 'es' ? 'Enfoque (25m)' : 'Focus (25m)'}
                </button>
                <button 
                  onClick={() => selectPomoMode('short_break')}
                  className={`px-3 py-1 rounded transition-all font-medium uppercase tracking-wider ${pomoMode === 'short_break' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                >
                  {language === 'es' ? 'Pausa (5m)' : 'Break (5m)'}
                </button>
                <button 
                  onClick={() => selectPomoMode('long_break')}
                  className={`px-3 py-1 rounded transition-all font-medium uppercase tracking-wider ${pomoMode === 'long_break' ? 'bg-white/10 text-white' : 'text-slate-400'}`}
                >
                  {language === 'es' ? 'Pausa Larga (15m)' : 'Long Break (15m)'}
                </button>
              </div>

              {/* Clock face */}
              <div className="relative w-44 h-44 rounded-full border border-hairline flex flex-col items-center justify-center my-4 overflow-hidden bg-surface-1">
                <span className="text-[12px] font-mono tracking-widest text-[#C8A27C] font-semibold uppercase mb-1">
                  {pomoMode.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-4xl font-extrabold text-slate-100 font-mono tracking-tighter tabular-nums">
                  {String(pomoMinutes).padStart(2, '0')}:{String(pomoSeconds).padStart(2, '0')}
                </span>

                {pomoActive && (
                  <motion.span 
                    key={breathingText}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-2"
                  >
                    {breathingText}
                  </motion.span>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setPomoActive(!pomoActive)}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    pomoActive 
                      ? 'bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:bg-rose-500/25' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm'
                  }`}
                  title={pomoActive ? (language === 'es' ? "Pausar" : "Pause") : (language === 'es' ? "Iniciar" : "Start")}
                >
                  {pomoActive ? <Pause size={18} weight="regular" /> : <Play size={18} weight="regular" className="ml-0.5" />}
                </button>
                <button
                  onClick={resetTimer}
                  className="w-11 h-11 bg-surface-1 border border-hairline hover:border-slate-700 text-slate-300 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  title="Reset Timer"
                >
                  <ArrowsCounterClockwise size={16} weight="regular" />
                </button>
                <button
                  onClick={() => setIsFloating(!isFloating)}
                  className={`w-11 h-11 border rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isFloating
                      ? 'bg-[#C8A27C] border-[#C8A27C] text-stone-950'
                      : 'bg-surface-1 border-hairline hover:border-slate-700 text-slate-300'
                  }`}
                  title={language === 'es' ? "Flotar temporizador" : "Float Timer on Screen"}
                >
                  <PushPin size={16} weight="regular" className={isFloating ? "rotate-45" : ""} />
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
                  <CloudSun size={18} weight="regular" className="text-amber-400" />
                  {language === 'es' ? 'Coordinador de Hábitos y Clima' : language === 'id' ? 'Penyelarasan Aktivitas dan Cuaca' : 'Weather & Routine Coordinator'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {language === 'es' 
                    ? "Sincroniza tus rutinas de ejercicio al aire libre y hábitos diarios según el pronóstico meteorológico."
                    : language === 'id' 
                    ? "Menyelaraskan agenda kebiasaan Anda dengan perkiraan kondisi cuaca."
                    : "Synchronizes outdoor routines and daily habits with forecast conditions."}
                </p>
              </div>

              {/* Set simulated params */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <MapPin size={13} weight="light" />
                  {language === 'es' ? 'Simulación:' : 'Simulation:'}
                </span>
                <select
                  value={weatherType}
                  onChange={(e) => setWeatherType(e.target.value as any)}
                  className="bg-surface-1 border border-hairline rounded-md py-1 px-3 text-xs text-slate-300 focus:outline-none focus:border-[#C8A27C]"
                >
                  <option value="sunny">{language === 'es' ? 'Soleado y Templado' : language === 'id' ? 'Cerah' : 'Sunny'}</option>
                  <option value="rainy">{language === 'es' ? 'Lluvia Ligera' : language === 'id' ? 'Hujan Ringan' : 'Light Rain'}</option>
                  <option value="storm">{language === 'es' ? 'Tormenta' : language === 'id' ? 'Hujan Badai' : 'Thunderstorm'}</option>
                  <option value="windy">{language === 'es' ? 'Viento Fresco' : language === 'id' ? 'Berangin' : 'Breezy'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-4 bg-surface-2 p-6 border border-hairline rounded-xl flex flex-col items-center justify-center text-center">
                <span className="text-xs uppercase font-medium text-slate-400 tracking-wider font-mono">
                  {language === 'es' ? 'Pronóstico Actual' : 'Current Forecast'}
                </span>
                <h4 className="text-base font-semibold text-slate-200 mt-1 mb-4 flex items-center gap-1.5">
                  <MapPin size={15} weight="light" className="text-[#C8A27C]" />
                  {selectedCity}
                </h4>

                <div className="p-4 bg-surface-1 rounded-full border border-hairline mb-4">
                  {weatherType === 'sunny' && <Sun size={40} weight="light" className="text-amber-400" />}
                  {weatherType === 'rainy' && <CloudRain size={40} weight="light" className="text-sky-400" />}
                  {weatherType === 'storm' && <CloudRain size={40} weight="light" className="text-indigo-400" />}
                  {weatherType === 'windy' && <CloudSun size={40} weight="light" className="text-teal-400" />}
                </div>

                <span className="text-3xl font-extrabold text-slate-100 font-mono tabular-nums">
                  {weatherType === 'sunny' ? '32°C' : weatherType === 'rainy' ? '24°C' : weatherType === 'storm' ? '21°C' : '26°C'}
                </span>
                <span className="text-xs text-slate-400 mt-1 capitalize font-medium">
                  {weatherType === 'sunny' ? (language === 'es' ? 'Soleado y Despejado' : language === 'id' ? 'Cerah' : 'Sunny') : weatherType === 'rainy' ? (language === 'es' ? 'Lluvia Moderada' : language === 'id' ? 'Hujan Ringan' : 'Rainy') : weatherType === 'storm' ? (language === 'es' ? 'Tormenta' : language === 'id' ? 'Hujan Badai' : 'Storm') : (language === 'es' ? 'Brisa Fresca' : language === 'id' ? 'Berangin' : 'Windy')}
                </span>
              </div>

              {/* Coach Advisory */}
              <div className="md:col-span-8 flex flex-col gap-4">
                <div className="bg-surface-2 p-5 border border-hairline rounded-xl">
                  <label className="text-[11px] font-semibold text-[#C8A27C] uppercase tracking-wider flex items-center gap-1.5">
                    <CloudSun size={14} weight="regular" />
                    {language === 'id' ? 'Saran Penyelarasan Aktivitas' : 'Routine Alignment Suggestions'}
                  </label>
                  
                  {isSyncingWeatherPlan ? (
                    <div className="py-6 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-[#C8A27C]/30 border-t-[#C8A27C] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <p className="text-xs text-slate-200 leading-relaxed mt-3">
                      "{weatherRecommendation}"
                    </p>
                  )}
                </div>

                {/* Active Habits List */}
                <div className="flex flex-col gap-3">
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {language === 'es' ? 'Análisis de Hábitos' : language === 'id' ? 'Daftar Kebiasaan Terkait' : 'Habits Overview'}
                  </span>
                  <div className="space-y-2">
                    {activeHabits.length === 0 ? (
                      <div className="p-3 bg-surface-2 border border-hairline rounded-lg text-center text-xs text-slate-500">
                        {language === 'es' ? 'No hay hábitos activos para analizar.' : language === 'id' ? 'Tidak ada kebiasaan aktif untuk diselaraskan.' : 'No active habits inside tracking.'}
                      </div>
                    ) : (
                      activeHabits.map((h, i) => {
                        const isOutdoor = h.title.toLowerCase().includes('run') || h.title.toLowerCase().includes('jog') || h.title.toLowerCase().includes('walk') || h.title.toLowerCase().includes('sepeda') || h.title.toLowerCase().includes('gym')|| h.title.toLowerCase().includes('olahraga');
                        const statusColor = (weatherType === 'sunny' || !isOutdoor) ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20';
                        return (
                          <div key={h.id || i} className="p-3 bg-surface-2 border border-hairline rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Fire size={15} weight="light" className="text-amber-400 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-xs font-medium text-slate-200">{h.title}</span>
                                <span className="text-[10px] text-slate-400">
                                  {isOutdoor ? (language === 'es' ? 'Tipo: Físico al aire libre' : language === 'id' ? 'Tipe: Luar Ruangan' : 'Type: Outdoor physical') : (language === 'es' ? 'Tipo: Interior / Flexible' : language === 'id' ? 'Tipe: Dalam Ruang' : 'Type: Indoor / Flexible')}
                                </span>
                              </div>
                            </div>
                            <span className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded border ${statusColor}`}>
                              {weatherType === 'sunny' || !isOutdoor 
                                ? (language === 'es' ? 'ÓPTIMO' : 'OPTIMAL') 
                                : (language === 'es' ? 'SUGERENCIA' : 'ALTERNATIVE')}
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
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Pulse size={18} weight="regular" className="text-[#C8A27C]" />
                {language === 'es' ? 'Mapa de Correlaciones y Gastos' : language === 'id' ? 'Peta Korelasi Kebiasaan & Pengeluaran' : 'Lifestyle & Spending Correlation Map'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'es' 
                  ? "Visualiza las relaciones entre tus gastos cotidianos y tu rendimiento en los objetivos."
                  : language === 'id' 
                  ? "Memetakan hubungan pola belanja harian dengan tingkat penyelesaian agenda tugas Anda."
                  : "Visual map of correlations between daily spending patterns and agenda completion."}
              </p>
            </div>

            <div className="relative w-full min-h-[300px] bg-surface-1 rounded-xl border border-hairline p-4 flex flex-col md:flex-row gap-6 overflow-hidden">
              <div className="flex-1 min-h-[220px] relative">
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 150 120 Q 320 280 500 120" fill="none" stroke="rgba(200, 162, 124, 0.25)" strokeWidth="1.5" strokeDasharray="4,4" />
                  <path d="M 150 120 L 320 280" fill="none" stroke="rgba(244, 63, 94, 0.2)" strokeWidth="1.5" />
                  <path d="M 320 280 L 500 120" fill="none" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" />
                </svg>

                <div className="absolute inset-0 z-10">
                  {nodes.map(node => {
                    const isSelected = selectedNode === node.id;
                    return (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(node.id)}
                        className="absolute flex flex-col items-center max-w-[150px] text-center p-3 rounded-lg border transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
                        style={{
                          left: `${node.x - 70}px`,
                          top: `${node.y - 50}px`,
                          backgroundColor: isSelected ? 'rgba(200, 162, 124, 0.12)' : 'rgba(15, 17, 26, 0.9)',
                          borderColor: isSelected ? '#C8A27C' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full border mb-1.5" 
                          style={{ borderColor: node.color, backgroundColor: `${node.color}44` }} 
                        />
                        <span className="text-[11px] font-medium text-slate-100">{node.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono tabular-nums mt-0.5">{node.metric}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle Connection Panel */}
              <div className="md:w-72 bg-surface-2 border border-hairline p-4 rounded-lg flex flex-col gap-3 shrink-0">
                <span className="text-[11px] font-semibold text-[#C8A27C] uppercase tracking-wider flex items-center gap-1.5">
                  <Pulse size={14} weight="regular" />
                  {language === 'id' ? 'Catatan Korelasi' : 'Correlation Note'}
                </span>
                
                {selectedNode ? (
                  <div className="flex flex-col gap-2">
                    <h5 className="text-xs font-semibold text-slate-200">
                      {nodes.find(n => n.id === selectedNode)?.label}
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                      "{nodes.find(n => n.id === selectedNode)?.desc}"
                    </p>
                    <div className="border-t border-hairline pt-2 mt-1">
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {selectedNode === 'spend_coffee' 
                          ? (language === 'es' ? 'Los altos gastos en café boutique indican fatiga y búsqueda de gratificación rápida.' : language === 'id' ? 'Pengeluaran kafe yang tinggi sering berkorelasi dengan momen beban kerja intensif.' : 'High boutique cafe spending indicates micro-stress cycles during intense work.')
                          : selectedNode === 'focus_completed'
                          ? (language === 'es' ? 'El cumplimiento constante de tareas se relaciona estrechamente con un buen descanso y alta energía.' : language === 'id' ? 'Konsistensi penyelesaian agenda berkaitan erat dengan stabilitas rutinitas harian.' : 'Completed scheduled tasks correlate tightly with steady daily routines.')
                          : (language === 'es' ? 'Las rachas de hábitos estables protegen tu concentración y previenen impulsos innecesarios.' : language === 'id' ? 'Keteraturan kebiasaan harian membantu menstabilkan fokus dan mencegah belanja spontan.' : 'Consistent habits help buffer attention and prevent impulsive purchases.')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500">
                    <Question size={24} weight="light" className="text-slate-600 mb-2" />
                    <p className="text-[11px] leading-relaxed">
                      {language === 'es' ? 'Haz clic en cualquier nodo del mapa para ver el análisis de correlación.' : language === 'id' ? 'Pilih salah satu simpul pada peta untuk menelaah catatan korelasi.' : 'Select any connected node in the map to see correlation insights.'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Correlations lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {nodeConnections.map(conn => (
                <div key={conn.labelId} className="bg-surface-2 p-4 border border-hairline rounded-lg flex flex-col gap-2">
                  <h5 className="text-xs font-semibold text-[#C8A27C] flex items-center gap-2">
                    <Lightning size={14} weight="regular" />
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
              <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <FileText size={18} weight="regular" className="text-[#C8A27C]" />
                {language === 'es' ? 'Centro de Resumen Semanal' : language === 'id' ? 'Pusat Ringkasan Mingguan' : 'Weekly Summary Center'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'es' 
                  ? "Agrupa balances de finanzas, productividad y hábitos en un reporte conciso."
                  : language === 'id' 
                  ? "Kompilasi ringkas yang menggabungkan perkembangan keuangan, tugas, dan kebiasaan mingguan."
                  : "Concise compilation combining weekly financial, task, and habit progress."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-4 bg-surface-2 border border-hairline p-6 rounded-xl flex flex-col justify-between gap-6">
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                    Agregasi Data Mingguan
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'es' ? 'Agrupa saldos, cumplimiento de agenda y metas en un archivo de informe conciso.' : language === 'id' ? 'Menyatukan ringkasan transaksi, penyelesaian tugas harian, dan kebiasaan ke dokumen teks terstruktur.' : 'Aggregates transaction totals, task completion, and habit streaks into a structured text report.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={generateWeeklyWrap}
                    disabled={isGeneratingWrap}
                    className="w-full h-10 bg-white/10 hover:bg-white/15 text-white font-medium text-xs rounded-md border border-white/10 transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGeneratingWrap ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FileText size={14} weight="regular" />
                        {language === 'es' ? "Generar Resumen" : language === 'id' ? "Kompilasi Laporan" : "Compile Weekly Wrap"}
                      </>
                    )}
                  </button>
                  {wrapupGenerated && (
                    <button
                      onClick={handleDriveSync}
                      className="w-full h-10 bg-surface-1 border border-hairline hover:border-slate-700 text-slate-300 font-medium text-xs rounded-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ArrowsClockwise size={14} weight="regular" className={driveSyncStatus === 'syncing' ? 'animate-spin' : ''} />
                      {driveSyncStatus === 'idle' && (language === 'es' ? "Sincronizar con Drive" : language === 'id' ? "Sinkr. Google Drive" : "Sync Google Drive")}
                      {driveSyncStatus === 'syncing' && (language === 'es' ? "Conectando..." : language === 'id' ? "Menghubungkan..." : "Syncing to Cloud...")}
                      {driveSyncStatus === 'completed' && (language === 'es' ? "Guardado en Drive" : language === 'id' ? "Berhasil Disimpan" : "Saved in Drive")}
                    </button>
                  )}
                </div>
              </div>

              {/* Live Preview Display screen */}
              <div className="lg:col-span-8 bg-surface-1 border border-hairline rounded-xl p-6 flex flex-col justify-between min-h-[300px]">
                {wrapupGenerated ? (
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div className="flex items-center justify-between border-b border-hairline pb-3">
                      <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                        <CheckCircle size={14} weight="regular" />
                        Laporan Berhasil Disusun
                      </span>

                      <button
                        onClick={handleGmailDraft}
                        className="text-xs text-[#C8A27C] hover:opacity-80 font-medium flex items-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <EnvelopeSimple size={14} weight="regular" />
                        {language === 'es' ? "Borrador en Gmail" : language === 'id' ? "Buka Draf Email" : "Draft in Email"}
                      </button>
                    </div>

                    <pre className="text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto whitespace-pre-wrap flex-1 max-h-[220px] bg-surface-2 p-4 border border-hairline rounded-md">
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
                    <FileText size={36} weight="light" className="text-slate-600 mb-2" />
                    <p className="text-xs leading-relaxed max-w-sm">
                      {language === 'es' 
                        ? "Haz clic en 'Generar Resumen' para agregar las estadísticas de tus finanzas y productividad."
                        : language === 'id' 
                        ? "Klik 'Kompilasi Laporan' untuk merangkum perkembangan tugas, kebiasaan, dan transaksi mingguan Anda."
                        : "Click 'Compile Weekly Wrap' to aggregate summary statistics from your workspace."}
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
