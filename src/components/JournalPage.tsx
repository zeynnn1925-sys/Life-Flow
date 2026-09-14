import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Trash2, 
  Search, 
  Calendar, 
  Heart, 
  Smile, 
  Brain, 
  PenTool, 
  Filter, 
  RefreshCw, 
  Check, 
  HelpCircle,
  Clock,
  Compass,
  Lightbulb,
  Trophy,
  Bot
} from 'lucide-react';
import { db } from '../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  mood: string;
  userId: string;
  createdAt?: string;
}

const MOODS = [
  { id: 'happy', labelEn: 'Happy', labelId: 'Bahagia', labelEs: 'Feliz', labelDe: 'Glücklich', labelAr: 'سعيد', emoji: '🌟', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { id: 'productive', labelEn: 'Productive', labelId: 'Produktif', labelEs: 'Productivo', labelDe: 'Produktiv', labelAr: 'منتج', emoji: '🚀', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  { id: 'calm', labelEn: 'Calm', labelId: 'Tenang', labelEs: 'Tranquilo', labelDe: 'Ruhig', labelAr: 'هادئ', emoji: '🍃', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { id: 'proud', labelEn: 'Proud', labelId: 'Bangga', labelEs: 'Orgulloso', labelDe: 'Stolz', labelAr: 'فخور', emoji: '🏆', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { id: 'anxious', labelEn: 'Anxious', labelId: 'Cemas', labelEs: 'Ansioso', labelDe: 'Ängstlich', labelAr: 'قلق', emoji: '💭', color: 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20' },
  { id: 'restless', labelEn: 'Restless', labelId: 'Lelah', labelEs: 'Cansado', labelDe: 'Rastlos', labelAr: 'مرهق', emoji: '🌀', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
];

const PROMPTS = {
  id: [
    "Apa satu hal kecil yang membuatmu tersenyum hari ini?",
    "Sebutkan pencapaian terkecil yang membuatmu bangga hari ini.",
    "Bagaimana suasana hatimu hari ini, dan apa penyebab utamanya?",
    "Tuliskan tiga hal yang paling kamu syukuri saat ini.",
    "Apa rintangan terbesar hari ini dan bagaimana kamu mengatasinya?",
    "Jika kamu bisa memberi saran untuk dirimu sendiri hari ini, apa itu?",
    "Apa satu pelajaran penting yang kamu dapatkan hari ini?",
    "Bagaimana kamu meluangkan waktu untuk dirimu sendiri hari ini?"
  ],
  es: [
    "¿Qué pequeño detalle te hizo sonreír hoy?",
    "Menciona una pequeña victoria de la que estés orgulloso hoy.",
    "¿Cómo fue tu estado mental hoy y qué lo provocó?",
    "Escribe tres cosas por las que estés más agradecido ahora mismo.",
    "¿Cuál fue el mayor obstáculo hoy y cómo lo superaste?",
    "Si pudieras darte un consejo hoy, ¿cuál sería?",
    "¿Qué lección valiosa aprendiste hoy?",
    "¿Cómo te cuidaste o recargaste tus energías hoy?"
  ],
  de: [
    "Was ist eine kleine Sache, die dich heute zum Lächeln gebracht hat?",
    "Nenne einen kleinen Erfolg, auf den du heute stolz bist.",
    "Wie war deine Stimmung heute und was war der Hauptgrund?",
    "Schreibe drei Dinge auf, für die du gerade besonders dankbar bist.",
    "Was war heute das größte Hindernis und wie hast du es gemeistert?",
    "Wenn du deinem heutigen Ich einen Rat geben könntest, welcher wäre das?",
    "Welche wertvolle Lektion hast du heute gelernt?",
    "Wie hast du dir heute Zeit für dich selbst genommen?"
  ],
  ar: [
    "ما هو الشيء الصغير الذي جعلك تبتسم اليوم؟",
    "اذكر إنجازًا صغيرًا تشعر بالفخر تجاهه اليوم.",
    "كيف كانت حالتك المزاجية اليوم، وما السبب الرئيسي؟",
    "اكتب ثلاثة أشياء تشعر بالامتنان لها الآن.",
    "ما هو أكبر تحدٍ واجهته اليوم وكيف تعاملت معه؟",
    "لو استطعت تقديم نصيحة لنفسك اليوم، فماذا ستكون؟",
    "ما الدرس المهم الذي تعلمته اليوم؟",
    "كيف خصصت وقتًا لنفسك واعتنيت بصحتك النفسية اليوم؟"
  ],
  en: [
    "What is one small thing that made you smile today?",
    "Mention a tiny victory that made you proud today.",
    "How was your overall headspace today, and what triggered it?",
    "Write down three things you are most grateful for right now.",
    "What was the biggest obstacle today and how did you navigate it?",
    "If you could give your today-self some advice, what would it be?",
    "What is one valuable lesson you learned today?",
    "How did you practice self-care or recharge your batteries today?"
  ]
};

export default function JournalPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const langKey = (language as keyof typeof PROMPTS) || 'en';

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // New entry form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState('calm');
  const [customPromptIdx, setCustomPromptIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Mascot dynamic quotes/reactions based on actions or state
  const [mascotBubble, setMascotBubble] = useState('');
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'proud' | 'calm'>('happy');

  const prompts = PROMPTS[langKey] || PROMPTS.en;

  const getMoodLabel = (m: typeof MOODS[0]) => {
    switch (language) {
      case 'id': return m.labelId;
      case 'es': return m.labelEs;
      case 'de': return m.labelDe;
      case 'ar': return m.labelAr;
      default: return m.labelEn;
    }
  };

  // Initialize companion text
  useEffect(() => {
    switch (language) {
      case 'id':
        setMascotBubble("Selamat datang di jurnal pribadimu. Luangkan sejenak waktu untuk mencatat refleksi hari ini.");
        break;
      case 'es':
        setMascotBubble("Bienvenido a tu diario personal. Tómate un momento para registrar tus reflexiones de hoy.");
        break;
      case 'de':
        setMascotBubble("Willkommen in deinem persönlichen Journal. Nimm dir einen Moment für deine tägliche Reflexion.");
        break;
      case 'ar':
        setMascotBubble("مرحبًا بك في يومياتك الخاصة. خذ دقيقة لكتابة تأملاتك وأفكارك لليوم.");
        break;
      default:
        setMascotBubble("Welcome to your personal journal. Take a moment to capture your thoughts and reflections today.");
        break;
    }
  }, [language]);

  // Load entries from Firestore
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, 'users', user.uid, 'journals'),
      orderBy('date', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalList: JournalEntry[] = [];
      snapshot.forEach((doc) => {
        journalList.push({ id: doc.id, ...doc.data() } as JournalEntry);
      });
      setEntries(journalList);
      setLoading(false);
    }, (error) => {
      console.error("Error loading journals:", error);
      try {
        const local = localStorage.getItem(`journals_${user.uid}`);
        if (local) {
          setEntries(JSON.parse(local));
        }
      } catch (e) {
        console.error("Local storage fallback journal fetch failed", e);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Save entry handler
  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    const entryId = `journal_${Date.now()}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const defaultTitle = language === 'id' ? 'Refleksi' : language === 'es' ? 'Reflexión' : language === 'de' ? 'Reflexion' : language === 'ar' ? 'تأمل' : 'Reflection';
    const finalTitle = title.trim() || `${defaultTitle} - ${todayStr}`;

    const newEntry: JournalEntry = {
      id: entryId,
      title: finalTitle,
      content: content.trim(),
      date: todayStr,
      mood: selectedMood,
      userId: user.uid,
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'journals', entryId), newEntry);
      const updatedEntries = [newEntry, ...entries];
      localStorage.setItem(`journals_${user.uid}`, JSON.stringify(updatedEntries));

      setTitle('');
      setContent('');
      
      setMascotMood('proud');
      if (language === 'id') {
        setMascotBubble(`Luar biasa! Refleksi harianmu sudah tersimpan aman. Menulis jurnal adalah langkah baik menjaga pikiran tetap tenang! 🎒💖`);
      } else if (language === 'es') {
        setMascotBubble(`¡Magnífico! Tu reflexión se ha guardado de forma segura. ¡Escribir un diario mantiene tu mente en paz! 🎒💖`);
      } else if (language === 'de') {
        setMascotBubble(`Großartig! Deine Reflexion wurde sicher gespeichert. Journaling sorgt für Klarheit und Ruhe! 🎒💖`);
      } else if (language === 'ar') {
        setMascotBubble(`رائع جدًا! تم حفظ تأملك اليومي بأمان. كتابة اليوميات خطوة ممتازة لصفاء الذهن! 🎒💖`);
      } else {
        setMascotBubble(`Splendid! Your reflection has been saved securely. Journaling is a stellar habit for a calm and intentional mind! 🎒💖`);
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);

    } catch (err) {
      console.error("Error saving journal to firestore:", err);
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem(`journals_${user.uid}`, JSON.stringify(updatedEntries));
      
      setTitle('');
      setContent('');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;
    
    const confirmMsg = language === 'id' 
      ? "Apakah kamu yakin ingin menghapus jurnal ini?" 
      : language === 'es'
      ? "¿Estás seguro de que deseas eliminar esta entrada del diario?"
      : language === 'de'
      ? "Möchtest du diesen Journaleintrag wirklich löschen?"
      : language === 'ar'
      ? "هل أنت متأكد أنك تريد حذف هذه اليومية؟"
      : "Are you sure you want to delete this journal entry?";

    if (confirm(confirmMsg)) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'journals', id));
        const filtered = entries.filter(e => e.id !== id);
        localStorage.setItem(`journals_${user.uid}`, JSON.stringify(filtered));

        setMascotMood('thinking');
        if (language === 'id') {
          setMascotBubble("Jurnal telah dihapus. Tak apa, ingatan hangatnya akan selalu ada bersamamu.");
        } else if (language === 'es') {
          setMascotBubble("Entrada eliminada. Los aprendizajes y recuerdos siempre permanecerán contigo.");
        } else if (language === 'de') {
          setMascotBubble("Eintrag gelöscht. Deine Erkenntnisse bleiben in deinem Herzen.");
        } else if (language === 'ar') {
          setMascotBubble("تم حذف اليومية. ستبقى الدروس والعبر معك دائمًا.");
        } else {
          setMascotBubble("Journal deleted. It's okay, the warm insights will always remain inside your heart.");
        }
      } catch (err) {
        console.error("Error deleting journal", err);
      }
    }
  };

  const changePrompt = () => {
    const nextIdx = (customPromptIdx + 1) % prompts.length;
    setCustomPromptIdx(nextIdx);
    setMascotMood('thinking');
    if (language === 'id') {
      setMascotBubble(`Coba jawab pertanyaan ini: "${prompts[nextIdx]}" 😊 Aku rasa ini sangat cocok untukmu hari ini.`);
    } else if (language === 'es') {
      setMascotBubble(`¿Qué tal reflexionar sobre esto?: "${prompts[nextIdx]}" 😊 ¡Creo que es perfecto para hoy!`);
    } else if (language === 'de') {
      setMascotBubble(`Wie wäre es damit: "${prompts[nextIdx]}" 😊 Das passt heute perfekt zu dir.`);
    } else if (language === 'ar') {
      setMascotBubble(`ما رأيك في التفكير في هذا السؤال: "${prompts[nextIdx]}" 😊`);
    } else {
      setMascotBubble(`How about reflecting on this: "${prompts[nextIdx]}" 😊 I feel this fits perfectly today.`);
    }
  };

  const usePromptInJournal = () => {
    const currentPrompt = prompts[customPromptIdx];
    setContent(prev => {
      const spacing = prev ? '\n\n' : '';
      return `${prev}${spacing}*${currentPrompt}*\n`;
    });
    if (language === 'id') {
      setMascotBubble("Pertanyaan telah dimasukkan ke editor. Selamat merenung dan menulis! 📝");
    } else if (language === 'es') {
      setMascotBubble("La pregunta se ha añadido al editor. ¡Disfruta escribiendo! 📝");
    } else if (language === 'de') {
      setMascotBubble("Frage wurde in den Editor eingefügt. Viel Freude beim Schreiben! 📝");
    } else if (language === 'ar') {
      setMascotBubble("تمت إضافة السؤال إلى المحرر. كتابة موفقة! 📝");
    } else {
      setMascotBubble("Prompt inserted directly to editor. Happy reflecting! 📝");
    }
  };

  const renderMascotVisual = () => {
    switch (mascotMood) {
      case 'proud':
        return <Trophy className="w-9 h-9 text-amber-400" />;
      case 'thinking':
        return <Lightbulb className="w-9 h-9 text-amber-500" />;
      case 'calm':
        return <Compass className="w-9 h-9 text-emerald-400" />;
      default:
        return <Bot className="w-9 h-9 text-accent" />;
    }
  };

  // Filter & Search Logic
  const filteredEntries = useMemo(() => {
    return entries.filter(entry => {
      const matchSearch = 
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        entry.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMood = filterMood === 'all' || entry.mood === filterMood;
      return matchSearch && matchMood;
    });
  }, [entries, searchQuery, filterMood]);

  const activePrompt = prompts[customPromptIdx];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pb-20">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#12141c] border-2 border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-3 shadow-lg shadow-black/80"
          >
            <Check className="w-5 h-5 bg-emerald-500/20 text-emerald-400 p-1 rounded-full stroke-[3]" />
            <div className="text-xs font-semibold">
              {language === 'id' ? 'Merenung Berhasil Diarsipkan!' : language === 'es' ? '¡Reflexión guardada con éxito!' : language === 'de' ? 'Reflexion erfolgreich gespeichert!' : language === 'ar' ? 'تم حفظ التأمل بنجاح!' : 'Reflection Archived Successfully!'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Left: Mascot & Prompt Card */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Animated Mascot Companion Card */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            
            {/* Mascot Visual container */}
            <motion.div 
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center border-2 border-accent/30 relative shadow-inner mb-4 cursor-pointer"
              onClick={() => {
                setMascotMood('happy');
                const reactions = language === 'id' 
                  ? ["Yeay! Terima kasih telah menyapaku!", "Hari ini adalah hari yang indah untuk tumbuh bersama!", "Tetap bernafas dengan tenang ya. Aku di sini!"] 
                  : language === 'es'
                  ? ["¡Hurra! ¡Gracias por saludarme!", "¡Hoy es un día hermoso para crecer juntos!", "Recuerda respirar hondo. ¡Aquí estoy contigo!"]
                  : language === 'de'
                  ? ["Yay! Danke fürs Vorbeischauen!", "Heute ist ein wunderbarer Tag zum Wachsen!", "Atme tief durch. Ich bin bei dir!"]
                  : language === 'ar'
                  ? ["يا للروعة! شكرًا لتحيتي!", "اليوم يوم رائع للنمو والتطور!", "تذكر دائمًا أن تتنفس بعمق. أنا هنا معك!"]
                  : ["Yay! Thank you for tapping me!", "Today is a beautiful day to grow together!", "Remember to breathe deeply. I've got your back!"];
                setMascotBubble(reactions[Math.floor(Math.random() * reactions.length)]);
              }}
            >
              {renderMascotVisual()}
            </motion.div>

            {/* Title & Speech Bubble */}
            <h3 className="text-xs font-bold text-slate-300 tracking-wider uppercase mb-3 flex items-center gap-1.5 bg-surface-2 px-3 py-1 rounded-md border border-white/5">
              <Brain className="w-3.5 h-3.5 text-accent" />
              Journal Companion
            </h3>

            <div className="w-full bg-[#11131c] border border-white/5 rounded-xl p-4 text-[12px] text-slate-300 leading-relaxed mb-4 relative min-h-[70px] flex items-center">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#11131c]" />
              <p className="text-center w-full">{mascotBubble}</p>
            </div>

            {/* Quick Companion Actions */}
            <div className="flex gap-2 w-full justify-center">
              <button 
                type="button"
                onClick={() => {
                  setMascotMood('calm');
                  if (language === 'id') {
                    setMascotBubble("Luangkan waktu sejenak untuk menenangkan pikiran. Tulis apa yang paling melegakan hari ini.");
                  } else if (language === 'es') {
                    setMascotBubble("Tómate un breve momento para calmar la mente. Escribe qué te ha dado tranquilidad hoy.");
                  } else if (language === 'de') {
                    setMascotBubble("Nimm dir einen Moment für innere Ruhe. Notiere, was dir heute gutgetan hat.");
                  } else if (language === 'ar') {
                    setMascotBubble("خذ لحظة هادئة لترتيب أفكارك. اكتب ما تشعر بالامتنان تجاهه اليوم.");
                  } else {
                    setMascotBubble("Take a brief pause to center yourself. Note down what brought peace to your day.");
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/10 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                {language === 'id' ? 'Refleksi Singkat' : language === 'es' ? 'Reflexión' : language === 'de' ? 'Reflexion' : language === 'ar' ? 'تأمل' : 'Pause & Reflect'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setMascotMood('thinking');
                  const prompts = language === 'id' 
                    ? [
                        "Apa 1 keputusan terbaik yang kamu buat hari ini?",
                        "Apa tantangan terbesar yang berhasil kamu selesaikan?",
                        "Hal apa yang ingin kamu tingkatkan besok?"
                      ]
                    : language === 'es'
                    ? [
                        "¿Cuál fue la mejor decisión que tomaste hoy?",
                        "¿Qué obstáculo lograste superar?",
                        "¿Qué aspecto te gustaría mejorar mañana?"
                      ]
                    : language === 'de'
                    ? [
                        "Was war deine beste Entscheidung heute?",
                        "Welche Herausforderung hast du gemeistert?",
                        "Was möchtest du morgen verbessern?"
                      ]
                    : language === 'ar'
                    ? [
                        "ما هو أفضل قرار اتخذته اليوم؟",
                        "ما هو التحدي الذي تمكنت من تجاوزه؟",
                        "ما الذي تود تحسينه يوم غد؟"
                      ]
                    : [
                        "What was the single best decision you made today?",
                        "What key obstacle did you navigate through?",
                        "What is one thing you want to improve tomorrow?"
                      ];
                  setMascotBubble(`Prompt: "${prompts[Math.floor(Math.random() * prompts.length)]}"`);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-slate-100 border border-white/10 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5 text-accent" />
                {language === 'id' ? 'Ide Menulis' : language === 'es' ? 'Ideas' : language === 'de' ? 'Ideen' : language === 'ar' ? 'أفكار' : 'Writing Prompts'}
              </button>
            </div>

          </div>
        </div>

        {/* Guided Reflections Prompts card */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-accent" />
              {language === 'id' ? 'Ide Refleksi Harian' : language === 'es' ? 'Idea de Reflexión Diaria' : language === 'de' ? 'Tägliche Reflexionsidee' : language === 'ar' ? 'فكرة تأمل يومية' : 'Reflection Prompt Idea'}
            </h4>
            <button 
              type="button"
              onClick={changePrompt}
              className="p-1.5 bg-[#12141c] hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 border border-white/5 transition-all cursor-pointer"
              title={language === 'id' ? "Ganti Pertanyaan" : language === 'es' ? "Cambiar Pregunta" : "Next Prompt"}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#12141c] rounded-xl p-4 border border-white/5 text-[12.5px] italic text-slate-300 mb-4 min-h-[70px] flex items-center justify-center text-center">
            "{activePrompt}"
          </div>

          <button 
            type="button"
            onClick={usePromptInJournal}
            className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded-xl text-xs transition-all tracking-wide shadow-glow-accent cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            {language === 'id' ? 'Ketik Dengan Ide Ini' : language === 'es' ? 'Escribir con esta idea' : language === 'de' ? 'Mit dieser Idee schreiben' : language === 'ar' ? 'الكتابة باستخدام هذا السؤال' : 'Write with This Idea'}
          </button>
        </div>

      </div>

      {/* Grid Right: Rich Editor & Entries */}
      <div className="xl:col-span-8 flex flex-col gap-6">

        {/* Main Jurnal Entry Editor Form */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 shadow-xl relative">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
            <BookOpen className="text-accent w-5 h-5" />
            {language === 'id' ? 'Tulis Refleksi Harianmu' : language === 'es' ? 'Escribe tu Reflexión Diaria' : language === 'de' ? 'Tägliche Reflexion verfassen' : language === 'ar' ? 'اكتب تأملك اليومي' : 'Write Daily Reflection'}
          </h2>
          <p className="text-[12px] text-slate-400 mb-6 font-mono">
            {language === 'id' ? 'Tuangkan emosi, progres produktivitas, dan catatan keuanganmu hari ini.' : language === 'es' ? 'Expresa tus emociones, progreso de productividad y notas financieras de hoy.' : language === 'de' ? 'Halte deine Gefühle, Produktivitätsfortschritte und Finanzen fest.' : language === 'ar' ? 'سجل مشاعرك، وإنجازاتك اليومية، وملاحظاتك المالية.' : 'Pour down your emotions, productivity progress, and financial logs today.'}
          </p>

          <form onSubmit={handleSaveEntry} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                {language === 'id' ? 'Judul (Opsional)' : language === 'es' ? 'Título (Opcional)' : language === 'de' ? 'Titel (Optional)' : language === 'ar' ? 'العنوان (اختياري)' : 'Title (Optional)'}
              </label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Hari yang Super Produktif! 🚀' : language === 'es' ? 'Ejemplo: ¡Un día súper productivo! 🚀' : language === 'de' ? 'z.B.: Ein super produktiver Tag! 🚀' : language === 'ar' ? 'مثال: يوم عالي الإنتاجية! 🚀' : 'e.g., A Super Productive Mindset! 🚀'}
                className="w-full bg-[#11131c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-accent transition-all font-medium"
              />
            </div>

            {/* Mood selector component */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                {language === 'id' ? 'Bagaimana Mood-mu Saat Ini?' : language === 'es' ? '¿Cómo está tu estado de ánimo ahora?' : language === 'de' ? 'Wie ist deine aktuelle Stimmung?' : language === 'ar' ? 'كيف هو مزاجك الآن؟' : 'How is your Mood Right Now?'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOODS.map(m => {
                  const isActive = selectedMood === m.id;
                  const label = getMoodLabel(m);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMood(m.id);
                        setMascotMood(m.id === 'restless' ? 'thinking' : m.id === 'proud' ? 'proud' : m.id === 'calm' ? 'calm' : 'happy');
                        if (language === 'id') {
                          setMascotBubble(`Kamu memilih mood: ${label} ${m.emoji}. Cerita lebih jauh bagaimana perasaanmu hari ini!`);
                        } else if (language === 'es') {
                          setMascotBubble(`Elegiste: ${label} ${m.emoji}. ¡Cuéntame más sobre cómo te sientes hoy!`);
                        } else if (language === 'de') {
                          setMascotBubble(`Du hast gewählt: ${label} ${m.emoji}. Erzähl mir mehr darüber!`);
                        } else if (language === 'ar') {
                          setMascotBubble(`اخترت: ${label} ${m.emoji}. شاركني المزيد عن يومك!`);
                        } else {
                          setMascotBubble(`You chose: ${label} ${m.emoji}. Tell me more details about your feelings today!`);
                        }
                      }}
                      className={`flex flex-col items-center p-2 rounded-xl border transition-all text-center group cursor-pointer ${
                        isActive 
                          ? `${m.color} border-2 scale-[1.03] shadow-md` 
                          : 'bg-[#11131c] border-white/5 opacity-70 hover:opacity-100 hover:scale-[1.02]'
                      }`}
                    >
                      <span className="text-xl mb-1 group-hover:scale-110 transition-transform">{m.emoji}</span>
                      <span className="text-[10px] font-bold text-slate-300">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Content Reflex Area */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex justify-between">
                <span>{language === 'id' ? 'Catatan Refleksi & Pikiran' : language === 'es' ? 'Contenido de Reflexiones y Pensamientos' : language === 'de' ? 'Reflexionsnotizen & Gedanken' : language === 'ar' ? 'محتوى التأملات والملاحظات' : 'Insights & Thoughts Content'}</span>
                <span className="text-[9px] lowercase text-[#62666d]">supports markdown / plain text</span>
              </label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={language === 'id' ? 'Mulai mengetik perasaanmu, hambatan keuangan, target habits, pencapaian harimu...' : language === 'es' ? 'Comienza a escribir sobre tus sentimientos, metas, hábitos o logros...' : language === 'de' ? 'Schreibe über deine Gefühle, Gewohnheiten, Finanzen und Erfolge...' : language === 'ar' ? 'ابدأ في تدوين مشاعرك وأهدافك وإنجازاتك اليومية...' : 'Start reflecting on your achievements, goals, habits, or mental breakthroughs...'}
                rows={5}
                required
                className="w-full bg-[#11131c] border border-white/5 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent transition-all leading-relaxed font-normal resize-y min-h-[140px]"
              />
            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span className="font-mono">{new Date().toISOString().split('T')[0]}</span>
              </div>

              <button
                type="submit"
                disabled={!content.trim()}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg ${
                  content.trim() 
                    ? 'bg-accent hover:bg-accent-hover text-white hover:scale-[1.02] active:scale-[0.98] shadow-glow-accent cursor-pointer' 
                    : 'bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
                {language === 'id' ? 'Arsipkan Journal' : language === 'es' ? 'Guardar Diario' : language === 'de' ? 'Eintrag speichern' : language === 'ar' ? 'حفظ اليومية' : 'Archive Entry'}
              </button>
            </div>

          </form>
        </div>

        {/* Previous entries Logs history list */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 shadow-xl relative">
          
          {/* Header Actions for Search & Filtering */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Clock className="text-accent w-5 h-5 animate-pulse" />
                {language === 'id' ? 'Arsip Jurnal Refleksi' : language === 'es' ? 'Historial de Reflexiones' : language === 'de' ? 'Reflexionsverlauf' : language === 'ar' ? 'أرشيف اليوميات والتأمل' : 'Reflections Archive History'}
              </h3>
              <p className="text-[11px] text-[#62666d]">
                {language === 'id' ? 'Perjalanan kesadaran mentalmu yang terekam rapi.' : language === 'es' ? 'Un hermoso historial de tu crecimiento mental y claridad diaria.' : language === 'de' ? 'Deine persönliche Entwicklung und Gedanken chronologisch erfasst.' : language === 'ar' ? 'سجل منظم لنموك وتأملاتك اليومية.' : 'A beautiful history of your mental growth and daily awareness.'}
              </p>
            </div>

            {/* Search and Mood filter controllers */}
            <div className="flex flex-wrap md:flex-nowrap gap-2 items-center">
              
              {/* Keyword query search */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari jurnal...' : language === 'es' ? 'Buscar en el diario...' : language === 'de' ? 'Suchen...' : language === 'ar' ? 'بحث في اليوميات...' : 'Search reflections...'}
                  className="w-full bg-[#11131c] border border-white/5 rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-accent transition-all"
                />
              </div>

              {/* Mood drop list */}
              <div className="relative">
                <select
                  value={filterMood}
                  onChange={e => setFilterMood(e.target.value)}
                  className="bg-[#11131c] border border-white/5 rounded-xl px-3 py-2 text-[11.5px] font-semibold text-slate-300 focus:outline-none focus:border-accent transition-all cursor-pointer"
                >
                  <option value="all">🧘🏽‍♂️ {language === 'id' ? 'Semua Mood' : language === 'es' ? 'Todos los Estados' : language === 'de' ? 'Alle Stimmungen' : language === 'ar' ? 'كل الحالات' : 'All Moods'}</option>
                  {MOODS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.emoji} {getMoodLabel(m)}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-accent/20 border-t-accent rounded-full animate-spin mb-2" />
              <p className="text-[11px] font-mono text-slate-500">{language === 'id' ? 'Menyinkronkan perjalanan jurnal...' : language === 'es' ? 'Sincronizando diario...' : 'Syncing journal logs...'}</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-2xl bg-[#11131c]/20">
              <BookOpen className="w-10 h-10 text-slate-700 stroke-[1.5] mb-3" />
              <span className="text-slate-500 text-xs text-center font-medium max-w-sm">
                {searchQuery || filterMood !== 'all' 
                  ? (language === 'id' ? 'Jurnal tidak ditemukan dengan kriteria pencarian ini.' : language === 'es' ? 'No se encontraron entradas con estos filtros.' : 'No journals match your active search filters.')
                  : (language === 'id' ? 'Belum ada catatan jurnal. Mulailah menulis untuk mengenali diri lebih dalam!' : language === 'es' ? '¡Tu diario está listo! Comienza a registrar tus reflexiones.' : 'Your journal space is brand new! Start archiving reflections.')}
              </span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence initial={false}>
                {filteredEntries.map(entry => {
                  const moodObj = MOODS.find(m => m.id === entry.mood) || MOODS[2];
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#11131c]/60 hover:bg-[#11131c]/100 border border-white/5 hover:border-accent/20 p-4 rounded-xl transition-all relative group"
                    >
                      {/* Top Bar inside card */}
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-tight px-2.5 py-0.5 rounded-full border ${moodObj.color}`}>
                            {moodObj.emoji} {getMoodLabel(moodObj)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-600" />
                            {entry.date}
                          </span>
                        </div>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-slate-600 hover:text-rose-400 p-1 bg-transparent hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title={language === 'id' ? 'Hapus Jurnal' : language === 'es' ? 'Eliminar Entrada' : 'Delete Entry'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Main Journal content */}
                      <h4 className="text-xs font-bold text-slate-200 mb-1.5 group-hover:text-accent transition-colors">
                        {entry.title}
                      </h4>
                      <p className="text-[11.5px] text-slate-300 leading-relaxed whitespace-pre-line font-normal break-words">
                        {entry.content}
                      </p>

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
