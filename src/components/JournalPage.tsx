import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Trash2, 
  Search, 
  Calendar, 
  Sparkles, 
  Heart, 
  Smile, 
  Brain, 
  PenTool, 
  Filter, 
  RefreshCw, 
  Check, 
  HelpCircle,
  Clock
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
  { id: 'happy', label: 'Happy', labelId: 'Bahagia', emoji: '🌟', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  { id: 'productive', label: 'Productive', labelId: 'Produktif', emoji: '🚀', color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20' },
  { id: 'calm', label: 'Calm', labelId: 'Tenang', emoji: '🍃', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  { id: 'proud', label: 'Proud', labelId: 'Bangga', emoji: '🏆', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  { id: 'anxious', label: 'Anxious', labelId: 'Cemas', emoji: '💭', color: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
  { id: 'restless', label: 'Restless', labelId: 'Lelah', emoji: '🌀', color: 'text-rose-400 bg-rose-400/10 border-rose-400/20' },
];

const PROMPTS_ID = [
  "Apa satu hal kecil yang membuatmu tersenyum hari ini?",
  "Sebutkan pencapaian terkecil yang membuatmu bangga hari ini.",
  "Bagaimana suasana hatimu hari ini, dan apa penyebab utamanya?",
  "Tuliskan tiga hal yang paling kamu syukuri saat ini.",
  "Apa rintangan terbesar hari ini dan bagaimana kamu mengatasinya?",
  "Jika kamu bisa memberi saran untuk dirimu sendiri hari ini, apa itu?",
  "Apa satu pelajaran penting yang kamu dapatkan hari ini?",
  "Bagaimana kamu meluangkan waktu untuk dirimu sendiri hari ini?"
];

const PROMPTS_EN = [
  "What is one small thing that made you smile today?",
  "Mention a tiny victory that made you proud today.",
  "How was your overall headspace today, and what triggered it?",
  "Write down three things you are most grateful for right now.",
  "What was the biggest obstacle today and how did you navigate it?",
  "If you could give your today-self some advice, what would it be?",
  "What is one valuable lesson you learned today?",
  "How did you practice self-care or recharge your batteries today?"
];

export default function JournalPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isId = language === 'id';

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

  const prompts = isId ? PROMPTS_ID : PROMPTS_EN;

  // Initialize companion text
  useEffect(() => {
    if (isId) {
      setMascotBubble("Halo! Aku Flowy, peri pelindung kedamaianmu! Yuk, luangkan waktu sejenak untuk menulis jurnal hari ini. Aku siap menemanimu! ✨");
    } else {
      setMascotBubble("Hey there! I'm Flowy, your mindfulness guardian! Let's take a peaceful moment to journal today. I'm right here to accompany you! ✨");
    }
  }, [language]);

  // Load entries from Firestore
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    // Under /users/{userId}/journals
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
      // Fallback local storage
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

    const finalTitle = title.trim() || `${isId ? 'Refleksi' : 'Reflection'} - ${todayStr}`;

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
      // Save in users/{userId}/journals/{journalId}
      await setDoc(doc(db, 'users', user.uid, 'journals', entryId), newEntry);
      
      // Update local storage too for resilience
      const updatedEntries = [newEntry, ...entries];
      localStorage.setItem(`journals_${user.uid}`, JSON.stringify(updatedEntries));

      // Reset form
      setTitle('');
      setContent('');
      
      // Mascot happy reaction
      setMascotMood('proud');
      if (isId) {
        setMascotBubble(`Luar biasa! Reflekasi harianmu sudah tersimpan aman. Menulis jurnal adalah langkah baik menjaga pikiran tetap tenang! 🎒💖`);
      } else {
        setMascotBubble(`Splendid! Your reflection has been saved securely. Journaling is a stellar habit for a calm and intentional mind! 🎒💖`);
      }

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3500);

    } catch (err) {
      console.error("Error saving journal to firestore:", err);
      // fallback save entirely local
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
    
    if (confirm(isId ? "Apakah kamu yakin ingin menghapus jurnal ini?" : "Are you sure you want to delete this journal entry?")) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'journals', id));
        
        // Update local storage
        const filtered = entries.filter(e => e.id !== id);
        localStorage.setItem(`journals_${user.uid}`, JSON.stringify(filtered));

        setMascotMood('thinking');
        if (isId) {
          setMascotBubble("Jurnal telah dihapus. Tak apa, ingatan hangatnya akan selalu ada bersamamu. ✨");
        } else {
          setMascotBubble("Journal deleted. It's okay, the warm insights will always remain inside your heart. ✨");
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
    if (isId) {
      setMascotBubble(`Coba jawab pertanyaan ini: "${prompts[nextIdx]}" 😊 Aku rasa ini sangat cocok untukmu hari ini.`);
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
    if (isId) {
      setMascotBubble("Pertanyaan telah dimasukkan ke editor. Selamat merenung dan menulis! 📝");
    } else {
      setMascotBubble("Prompt inserted directly to editor. Happy reflecting! 📝");
    }
  };

  const getMascotExpression = () => {
    switch (mascotMood) {
      case 'proud': return '(✿◠‿◠)🏆';
      case 'thinking': return '(•◡•)💭';
      case 'calm': return '(◕‿◕✿)🍃';
      default: return '(o^◇^o)✨';
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
              {isId ? 'Merenung Berhasil Diarsipkan!' : 'Reflection Archived Successfully!'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid Left: Mascot & Prompt Card */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Animated Mascot Companion Card */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />
          
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
              className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-teal-400/20 flex items-center justify-center border-2 border-violet-500/40 relative shadow-inner mb-4 cursor-pointer"
              onClick={() => {
                setMascotMood('happy');
                const reactions = isId 
                  ? ["Yeay! Terima kasih telah menyapaku!", "Hari ini adalah hari yang indah untuk tumbuh bersama!", "Tetap bernafas dengan tenang ya. Aku di sini!"] 
                  : ["Yay! Thank you for tapping me!", "Today is a beautiful day to grow together!", "Remember to breathe deeply. I've got your back!"];
                setMascotBubble(reactions[Math.floor(Math.random() * reactions.length)]);
              }}
            >
              <div className="absolute -inset-1 rounded-full bg-violet-400/10 blur-xl opacity-60 animate-pulse" />
              <span className="text-3xl font-black drop-shadow tracking-widest">{getMascotExpression()}</span>
              
              {/* Cute Float Sparks */}
              <div className="absolute -top-1 -right-1 text-yellow-400 text-sm animate-bounce">✨</div>
              <div className="absolute bottom-1 left-0 text-violet-400 text-[10px] animate-pulse">🌸</div>
            </motion.div>

            {/* Title & Speech Bubble */}
            <h3 className="text-sm font-black text-violet-400 tracking-wider uppercase mb-3 flex items-center gap-1.5 bg-violet-950/30 px-3 py-1 rounded-full border border-violet-500/10">
              <Brain className="w-3.5 h-3.5" />
              FLOWY COMPANION
            </h3>

            <div className="w-full bg-[#11131c] border border-white/5 rounded-xl p-4 text-[12px] text-slate-300 leading-relaxed mb-4 relative min-h-[80px] flex items-center">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-[#11131c]" />
              <p className="text-center w-full">{mascotBubble}</p>
            </div>

            {/* Quick Companion Actions */}
            <div className="flex gap-2 w-full justify-center">
              <button 
                type="button"
                onClick={() => {
                  setMascotMood('calm');
                  if (isId) {
                    setMascotBubble("Carilah tempat duduk yang nyaman, rilekskan bahmu, tarik napas dalam... dan hembuskan perlahan. Sekarang, mari luapkan emosimu di kertas digital ini. 🍃");
                  } else {
                    setMascotBubble("Find a cozy sit, relax your shoulders, breathe in... and let it out. Now let's paint your emotions on this digital canvas. 🍃");
                  }
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Smile className="w-3 h-3 text-emerald-400" />
                {isId ? 'Menenangkan' : 'Calm Down'}
              </button>
              <button 
                type="button"
                onClick={() => {
                  setMascotMood('thinking');
                  const quotes = isId 
                    ? [
                        "Pencapaian kecil setiap hari akan menumpuk menjadi kesuksesan besar!",
                        "Kamu tidak perlu sempurna untuk menjadi luar biasa.",
                        "Setiap emosi penting. Cemas, gundah, atau gembira adalah bagian dari kepingan hidupmu."
                      ]
                    : [
                        "Small daily actions compound into spectacular outcomes!",
                        "You don't need to be flawless to be absolutely marvelous.",
                        "Every emotion matters. Anxious, tired, or ecstatic—it's part of your unique journey."
                      ];
                  setMascotBubble(`💡 Flowy Motivation: "${quotes[Math.floor(Math.random() * quotes.length)]}"`);
                }}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-white/5 rounded-lg text-[10px] uppercase font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                {isId ? 'Tips Pikiran' : 'Mind Tips'}
              </button>
            </div>

          </div>
        </div>

        {/* Guided Reflections Prompts card */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-violet-400" />
              {isId ? 'Ide Refleksi Harian' : 'Reflection Prompt Idea'}
            </h4>
            <button 
              type="button"
              onClick={changePrompt}
              className="p-1.5 bg-[#12141c] hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 border border-white/5 transition-all cursor-pointer"
              title={isId ? "Ganti Pertanyaan" : "Next Prompt"}
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
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all tracking-wide shadow-md shadow-violet-950/50 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            {isId ? 'Ketik Dengan Ide Ini' : 'Write with This Idea'}
          </button>
        </div>

      </div>

      {/* Grid Right: Rich Editor & Entries */}
      <div className="xl:col-span-8 flex flex-col gap-6">

        {/* Main Jurnal Entry Editor Form */}
        <div className="bg-[#0b0c10] border border-white/5 rounded-2xl p-6 shadow-xl relative">
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-2">
            <BookOpen className="text-violet-400 w-5 h-5" />
            {isId ? 'Tulis Refleksi Harianmu' : 'Write Daily Reflection'}
          </h2>
          <p className="text-[12px] text-slate-400 mb-6 font-mono">
            {isId ? 'Tuangkan emosi, progres produktivitas, dan catatan keuanganmu hari ini.' : 'Pour down your emotions, productivity progress, and financial logs today.'}
          </p>

          <form onSubmit={handleSaveEntry} className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                {isId ? 'Judul (Opsional)' : 'Title (Optional)'}
              </label>
              <input 
                type="text" 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={isId ? 'Contoh: Hari yang Super Produktif! 🚀' : 'e.g., A Super Productive Mindset! 🚀'}
                className="w-full bg-[#11131c] border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all font-medium"
              />
            </div>

            {/* Mood selector component */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">
                {isId ? 'Bagaimana Mood-mu Saat Ini?' : 'How is your Mood Right Now?'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {MOODS.map(m => {
                  const isActive = selectedMood === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMood(m.id);
                        setMascotMood(m.id === 'restless' ? 'thinking' : m.id === 'proud' ? 'proud' : m.id === 'calm' ? 'calm' : 'happy');
                        if (isId) {
                          setMascotBubble(`Kamu memilih mood: ${isId ? m.labelId : m.label} ${m.emoji}. Cerita lebih jauh bagaimana perasaannmu hari ini!`);
                        } else {
                          setMascotBubble(`You chose: ${m.label} ${m.emoji}. Tell me more details about your feelings today!`);
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
                        {isId ? m.labelId : m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail Content Reflex Area */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1.5 flex justify-between">
                <span>{isId ? 'Catatan Refleksi & Pikiran' : 'Insights & Thoughts Content'}</span>
                <span className="text-[9px] lowercase text-[#62666d]">supports markdown / plain text</span>
              </label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder={isId ? 'Mulai mengetik perasaanmu, hambatan keuangan, target habits, pencapaian harimu...' : 'Start reflecting on your achievements, goals, habits, or mental breakthroughs...'}
                rows={5}
                required
                className="w-full bg-[#11131c] border border-white/5 rounded-xl p-4 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-all leading-relaxed font-normal resize-y min-h-[140px]"
              />
            </div>

            {/* Bottom Form Actions */}
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span className="font-mono">{new Date().toISOString().split('T')[0]}</span>
              </div>

              <button
                type="submit"
                disabled={!content.trim()}
                className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-lg ${
                  content.trim() 
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-violet-950/45 cursor-pointer' 
                    : 'bg-slate-900 border border-white/5 text-slate-600 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                {isId ? 'Arsipkan Journal' : 'Archive Entry'}
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
                <Clock className="text-violet-400 w-5 h-5 animate-pulse" />
                {isId ? 'Arsip Jurnal Refleksi' : 'Reflections Archive History'}
              </h3>
              <p className="text-[11px] text-[#62666d]">
                {isId ? 'Perjalanan kesadaran mentalmu yang terekam rapi.' : 'A beautiful history of your mental growth and daily awareness.'}
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
                  placeholder={isId ? 'Cari jurnal...' : 'Search reflections...'}
                  className="w-full bg-[#11131c] border border-white/5 rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/30 transition-all"
                />
              </div>

              {/* Mood drop list */}
              <div className="relative">
                <select
                  value={filterMood}
                  onChange={e => setFilterMood(e.target.value)}
                  className="bg-[#11131c] border border-white/5 rounded-xl px-3 py-2 text-[11.5px] font-semibold text-slate-300 focus:outline-none focus:border-violet-500/30 transition-all cursor-pointer"
                >
                  <option value="all">🧘🏽‍♂️ {isId ? 'Semua Mood' : 'All Moods'}</option>
                  {MOODS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.emoji} {isId ? m.labelId : m.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* List display */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-violet-500/20 border-t-violet-500 rounded-full animate-spin mb-2" />
              <p className="text-[11px] font-mono text-slate-500">{isId ? 'Menyingkronkan perjalanan jurnal...' : 'Syncing journal logs...'}</p>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-2xl bg-[#11131c]/20">
              <BookOpen className="w-10 h-10 text-slate-700 stroke-[1.5] mb-3" />
              <span className="text-slate-500 text-xs text-center font-medium max-w-sm">
                {searchQuery || filterMood !== 'all' 
                  ? (isId ? 'Jurnal tidak ditemukan dengan kriteria pencarian ini.' : 'No journals match your active search filters.')
                  : (isId ? 'Belum ada catatan jurnal. Mulailah menulis untuk mengenali diri lebih dalam!' : 'Your journal space is brand new! Start archiving reflections.')}
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
                      className="bg-[#11131c]/60 hover:bg-[#11131c]/100 border border-white/5 hover:border-violet-500/10 p-4 rounded-xl transition-all relative group"
                    >
                      {/* Top Bar inside card */}
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          {/* Mood designator tag */}
                          <span className={`text-[10px] font-black uppercase tracking-tight px-2.5 py-0.5 rounded-full border ${moodObj.color}`}>
                            {moodObj.emoji} {isId ? moodObj.labelId : moodObj.label}
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
                          title={isId ? 'Hapus Jurnal' : 'Delete Entry'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Main Journal content */}
                      <h4 className="text-xs font-bold text-slate-200 mb-1.5 group-hover:text-violet-400 transition-colors">
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
