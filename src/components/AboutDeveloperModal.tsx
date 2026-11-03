import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Code2, Terminal, Layers, ShieldCheck, Mail, 
  Check, Copy, MessageSquare, ArrowUpRight, Server, 
  Database, Cpu, Globe, Laptop, Workflow, GitBranch, 
  Container, Wrench, Network, ZoomIn, ZoomOut, Sparkle
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TiltedCard } from './ui/TiltedCard';
import { RotatingText } from './ui/RotatingText';
import { Magnet } from './ui/Magnet';
import { StarBorder } from './ui/StarBorder';
import { ShinyText } from './ui/ShinyText';
import { Kbd } from './ui/Kbd';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'story' | 'languages' | 'automation' | 'services' | 'contact';

export function AboutDeveloperModal({ isOpen, onClose }: AboutDeveloperModalProps) {
  const { language } = useLanguage();
  const isId = language === 'id';
  const [activeTab, setActiveTab] = useState<TabType>('story');
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const developerEmail = 'muhammadfaizdzahin11@gmail.com';
  const developerPhone = '087792811601';
  const whatsappUrl = 'https://wa.me/6287792811601';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developerEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(developerPhone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isZoomed, onClose]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'story', label: isId ? 'Profil & Pendekatan Kerja' : 'Profile & Philosophy' },
    { id: 'languages', label: isId ? 'Bahasa Pemrograman & Stack' : 'Languages & Stack' },
    { id: 'automation', label: isId ? 'Otomatisasi & Deploy' : 'Automation & Deploy' },
    { id: 'services', label: isId ? 'Keahlian & Layanan' : 'Skills & Services' },
    { id: 'contact', label: isId ? 'Kontak Langsung' : 'Direct Contact' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (isZoomed) setIsZoomed(false);
              else onClose();
            }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-4xl bg-[#121316] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16181d]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  DEVELOPER PORTFOLIO
                </span>
                <h2 className="text-sm font-semibold text-zinc-100">
                  Muhammad Faiz Dzahin
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <Kbd className="hidden sm:inline-flex text-[9px] text-zinc-500">ESC</Kbd>
                <Magnet strength={10}>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Tutup"
                  >
                    <X size={18} />
                  </button>
                </Magnet>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              <div className="px-6 pt-6 pb-7 border-b border-white/10 bg-gradient-to-b from-[#17181f] via-[#14151b] to-[#121318] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(200,162,124,0.06),transparent_50%)] pointer-events-none" />
                
                <div className="flex flex-col lg:flex-row gap-7 items-center lg:items-start relative z-10">
                  <div className="flex flex-col items-center shrink-0 w-64 select-none">
                    <div className="relative w-full rounded-2xl p-4 bg-gradient-to-b from-[#241e19] via-[#1a1714] to-[#141312] border border-[#C8A27C]/30 shadow-2xl overflow-hidden group">
                      <div 
                        className="absolute inset-0 opacity-[0.22] pointer-events-none mix-blend-overlay z-[1]"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                        }}
                      />

                      <div 
                        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
                        style={{
                          backgroundImage: `repeating-linear-gradient(0deg, #3d3126 0px, #3d3126 1px, transparent 1px, transparent 14px),
                                            repeating-linear-gradient(90deg, #261f18 0px, #261f18 1px, transparent 1px, transparent 28px)`
                        }}
                      />

                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(200,162,124,0.18),transparent_70%)] pointer-events-none z-[1]" />
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-[1]" />
                      
                      <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 border border-white/10 text-[9.5px] font-mono text-[#C8A27C] z-[2] backdrop-blur-[2px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8A27C] animate-pulse" />
                        <span>Kamar Lo-Fi</span>
                      </div>

                      <div className="flex flex-col items-center relative z-10 pt-1">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 shadow-lg border border-amber-300 flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#141312] shadow-inner" />
                        </div>

                        <div className="relative w-16 h-12 flex justify-center -mt-1 pointer-events-none">
                          <svg className="w-full h-full" viewBox="0 0 64 48" fill="none">
                            <path 
                              d="M32 4 L14 46" 
                              stroke="#c8a27c" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              opacity="0.9"
                            />
                            <path 
                              d="M32 4 L50 46" 
                              stroke="#c8a27c" 
                              strokeWidth="2.5" 
                              strokeLinecap="round"
                              opacity="0.9"
                            />
                            <path 
                              d="M23 25 L41 25" 
                              stroke="#8a6d4d" 
                              strokeWidth="1.5" 
                              strokeDasharray="2 2"
                              opacity="0.7"
                            />
                          </svg>
                        </div>

                        <div className="w-7 h-3 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-sm shadow-md border border-zinc-200 -mt-1.5 z-20 flex items-center justify-center">
                          <div className="w-2.5 h-1 rounded-full bg-zinc-800" />
                        </div>
                      </div>

                      <div className="mt-1 relative z-20">
                        <TiltedCard 
                          maxTilt={16} 
                          perspective={950} 
                          scaleOnHover={1.04} 
                          showGlare={true} 
                          glareOpacity={0.35}
                          glareColor="rgba(240, 215, 185, 0.45)"
                          className="cursor-pointer"
                          onClick={() => setIsZoomed(true)}
                        >
                          <div className="relative w-56 rounded-xl p-3 bg-gradient-to-b from-[#1b1d24] to-[#121318] border border-white/20 shadow-2xl backdrop-blur-sm group/card">
                            {/* Nametag slot hole */}
                            <div className="w-8 h-1.5 rounded-full bg-black/80 border border-white/15 mx-auto mb-2.5" />

                            {/* Photo frame */}
                            <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-white/15 bg-zinc-950 group/photo shadow-inner">
                              <img 
                                src="/kaciwww.png" 
                                alt="Muhammad Faiz Dzahin" 
                                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover/photo:scale-105"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== '/kaciwww.png') target.src = '/kaciwww.png';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity flex items-end justify-center pb-2">
                                <span className="text-[10px] text-white font-medium bg-black/60 px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-sm flex items-center gap-1">
                                  <ZoomIn size={11} /> Klik untuk perbesar
                                </span>
                              </div>
                            </div>

                            {/* Developer name & title */}
                            <div className="mt-2.5 pb-0.5 text-center">
                              <h3 className="text-sm font-bold text-white tracking-tight">
                                <ShinyText speed={4}>Muhammad Faiz Dzahin</ShinyText>
                              </h3>
                              <p className="text-[11px] font-mono text-[#C8A27C] mt-0.5 font-medium">
                                Full Stack Developer
                              </p>
                            </div>
                          </div>
                        </TiltedCard>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
                    <div className="text-xs font-mono font-semibold text-[#C8A27C] uppercase tracking-wider mb-2">
                      FULL STACK DEVELOPER
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight flex items-center gap-2 justify-center lg:justify-start">
                      <ShinyText speed={3.5}>Muhammad Faiz Dzahin</ShinyText>
                    </h1>
                    
                    <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed max-w-2xl">
                      {isId 
                        ? 'Full Stack Developer yang berfokus membangun aplikasi web modern, antarmuka pengguna interaktif dan cepat, integrasi API backend yang solid, serta pengelolaan database yang rapi dan terstruktur.'
                        : 'Full Stack Developer focused on building modern web applications, highly responsive and intuitive interfaces, robust backend APIs, and well-structured database systems.'}
                    </p>

                    <div className="mt-4 p-3.5 rounded-lg bg-white/[0.03] border border-white/10 text-xs text-zinc-300 leading-relaxed text-left max-w-2xl">
                      "{isId 
                        ? 'Membangun aplikasi yang baik dimulai dari kode yang rapi, arsitektur yang mudah dipahami, dan antarmuka yang nyaman digunakan setiap hari oleh pengguna nyata.'
                        : 'Building great software begins with clean code, maintainable architecture, and intuitive interfaces that users genuinely enjoy everyday.'}"
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 max-w-2xl">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">ROLE</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Full Stack Developer</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">FRONTEND</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">React, Next.js, Tailwind</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">BACKEND</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Node.js, Express, Go</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">DATABASE</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">PostgreSQL, Firestore</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky top-0 z-20 px-6 py-2.5 bg-[#121316]/95 backdrop-blur-md border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative z-10 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="dev-modal-active-tab-indicator"
                          className="absolute inset-0 z-[-1] rounded-lg bg-white/15 border border-white/15 shadow-sm"
                          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                        />
                      )}
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="p-6">
                {activeTab === 'story' && (
                  <div className="space-y-6">
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Pendekatan Pembuatan Aplikasi
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Membangun Aplikasi Full Stack yang Bersih dan Fungsional
                      </h4>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        Sebagai Full Stack Developer, saya merancang aplikasi web dari awal hingga siap digunakan: mulai dari tampilan antarmuka yang bersih dan interaktif di browser, logika server backend, hingga penyimpanan data di database. Saya mengutamakan kode yang rapi, alur pengguna yang masuk akal, dan performa yang cepat saat diakses pengguna.
                      </p>
                    </div>

                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Penerapan Nyata di LifeFlow
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Mengelola Alur Finansial, Kebiasaan, dan Rutinitas Terpadu
                      </h4>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        Aplikasi LifeFlow ini saya rancang sebagai pembuktian nyata integrasi penuh: pencatatan pemasukan dan pengeluaran keuangan, pelacakan konsistensi kebiasaan harian, penjadwalan fokus, serta sinkronisasi aman dengan Firebase Firestore. Semua fitur dibuat langsung untuk menjawab kebutuhan nyata produktivitas sehari-hari.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-[#C8A27C] uppercase block font-semibold">FOKUS 01</span>
                        <h5 className="text-xs font-bold text-white mt-1">Frontend Interaktif</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          Desain responsif, animasi halus 60fps, dan tata letak yang ramah pengguna.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-[#C8A27C] uppercase block font-semibold">FOKUS 02</span>
                        <h5 className="text-xs font-bold text-white mt-1">Backend & Database</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          REST API cepat, penanganan autentikasi aman, dan struktur basis data efisien.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-[#C8A27C] uppercase block font-semibold">FOKUS 03</span>
                        <h5 className="text-xs font-bold text-white mt-1">Solusi Nyata</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          Fitur dibangun berdasarkan fungsi nyata yang membantu alur kerja sehari-hari.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'languages' && (
                  <div className="space-y-5">
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Bahasa Pemrograman Utama
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">TypeScript</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Aplikasi Web & Server</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">JavaScript</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Frontend & Node.js</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Go (Golang)</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Backend & API Cepat</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Python</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Scripting & Otomasi</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">SQL</span>
                          <span className="text-[10px] text-zinc-400 font-sans">PostgreSQL Query</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">HTML5 & CSS3</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Layout & Web Styling</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Bash</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Linux Shell & Deploy</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">JSON / REST</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Komunikasi Data API</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Laptop size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Frontend Framework & Tools
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">React & Next.js</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Komponen & SPA</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Tailwind CSS</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Styling Cepat & Rapi</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Vite</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Build Tool & Fast Refresh</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Framer Motion</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Transisi & Animasi UI</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">PWA</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Aplikasi Web Offline</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Recharts</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Grafik Finansial & Data</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Server size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Backend & Basis Data
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Node.js & Express</span>
                          <span className="text-[10px] text-zinc-400 font-sans">REST API & Routing</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">PostgreSQL</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Database Relasional</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Firebase Firestore</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Database Cloud Realtime</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Drizzle ORM</span>
                          <span className="text-[10px] text-zinc-400 font-sans">TypeScript Query Builder</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">RESTful API Design</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Endpoint Standar & Aman</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Autentikasi</span>
                          <span className="text-[10px] text-zinc-400 font-sans">JWT, OAuth & Auth Rules</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'automation' && (
                  <div className="space-y-4">
                    <div className="text-xs text-zinc-400 mb-2">
                      {isId 
                        ? 'Pengalaman dalam otomatisasi alur deploy, manajemen server, dan tugas latar belakang:'
                        : 'Experience in deployment automation, server configuration, and background workflows:'}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Container size={16} className="text-[#C8A27C]" />
                          <h4 className="text-sm font-bold text-white">Docker & Lingkungan Server</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Menggunakan Docker untuk membungkus aplikasi agar berjalan konsisten di lingkungan lokal maupun server produksi (Linux VPS).
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Docker • Docker Compose • Linux Server
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <GitBranch size={16} className="text-[#C8A27C]" />
                          <h4 className="text-sm font-bold text-white">CI/CD & Deploy Otomatis</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Menyiapkan alur GitHub Actions untuk memeriksa error pengetikan TypeScript, build testing, dan deploy otomatis saat update kode.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          GitHub Actions • Automated Build • Cloudflare / VPS
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Workflow size={16} className="text-[#C8A27C]" />
                          <h4 className="text-sm font-bold text-white">Otomasi Tugas & Jadwal</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Menjalankan tugas berkala (cron jobs), pengiriman pengingat jadwal otomatis, dan pemrosesan data di latar belakang.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Cron Jobs • Background Work • Notifikasi Web
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Network size={16} className="text-[#C8A27C]" />
                          <h4 className="text-sm font-bold text-white">Scripting & Integrasi Webhook</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Menyambungkan berbagai layanan pihak ketiga melalui webhook, integrasi Google Sheets, dan skrip automasi Python/Node.js.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Webhooks • API Integration • Data Scripts
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'services' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8A27C] mb-2.5">
                            <Layers size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Pembuatan Website & Aplikasi Web</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Membangun website responsif, dashboard manajemen data, dan web app interaktif yang cepat dibuka di komputer maupun ponsel.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          Web Apps • Dashboard Admin • Landing Page Modern
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8A27C] mb-2.5">
                            <Server size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Pengembangan REST API & Backend</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Membuat server API untuk kebutuhan aplikasi web dan mobile dengan autentikasi yang aman dan struktur data yang rapi.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          Node.js / Express • Go API • Endpoint Autentikasi
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8A27C] mb-2.5">
                            <Database size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Manajemen Database & Sinkronisasi</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Merancang skema database PostgreSQL dan Firebase Firestore agar data tersimpan aman, tidak ganda, dan cepat dipanggil.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          PostgreSQL • Firebase Firestore • Data Modeling
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#C8A27C] mb-2.5">
                            <Cpu size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Integrasi Fitur AI Terapan</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Menghubungkan aplikasi dengan kemampuan AI (Gemini API) untuk analisis teks, pembacaan dokumen/struk, dan rekomendasi fokus.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          Gemini API • Vision OCR • Structured Output
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          Kontak Langsung
                        </h4>
                        <p className="text-xs sm:text-[13px] text-zinc-300 mt-1 leading-relaxed">
                          Terbuka untuk kolaborasi proyek pembuatan aplikasi web, konsultasi full stack, maupun diskusi teknis.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                              <MessageSquare size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">WHATSAPP</span>
                              <span className="text-xs font-mono font-bold text-zinc-100 truncate block">{developerPhone}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StarBorder color="#10b981" speed="5s" className="flex-1">
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full py-2 px-3 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-emerald-600/20 rounded-xl"
                              >
                                <span>Hubungi via WhatsApp</span>
                                <ArrowUpRight size={12} />
                              </a>
                            </StarBorder>
                            <Magnet strength={8}>
                              <button
                                onClick={handleCopyPhone}
                                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-white/10"
                                title="Salin Nomor WhatsApp"
                              >
                                {copiedPhone ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                            </Magnet>
                          </div>
                        </div>

                        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                              <Mail size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">EMAIL</span>
                              <span className="text-xs font-mono font-bold text-zinc-100 truncate block">{developerEmail}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StarBorder color="#38bdf8" speed="5s" className="flex-1">
                              <a
                                href={`mailto:${developerEmail}?subject=Diskusi%20Pengembangan%20Web%20Full%20Stack`}
                                className="w-full py-2 px-3 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors hover:bg-sky-600/20 rounded-xl"
                              >
                                <span>Kirim Email Langsung</span>
                                <ArrowUpRight size={12} />
                              </a>
                            </StarBorder>
                            <Magnet strength={8}>
                              <button
                                onClick={handleCopyEmail}
                                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-white/10"
                                title="Salin Alamat Email"
                              >
                                {copiedEmail ? <Check size={13} className="text-sky-400" /> : <Copy size={13} />}
                              </button>
                            </Magnet>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                        <div>
                          <span className="text-zinc-500 font-mono">Nama:</span> Muhammad Faiz Dzahin
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono">Profesi:</span> Full Stack Developer
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono">Status:</span> Terbuka untuk Diskusi Proyek
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono">Lokasi:</span> Indonesia (WIB / UTC+7)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/10 bg-[#16181d] flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px] text-zinc-500">
                Muhammad Faiz Dzahin · Full Stack Developer
              </span>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>

          <AnimatePresence>
            {isZoomed && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsZoomed(false)}
                  className="fixed inset-0 bg-black/90 backdrop-blur-lg"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.75, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative z-10 flex flex-col items-center max-w-sm w-full"
                >
                  <div className="w-full flex items-center justify-between pb-3 text-white px-1">
                    <span className="text-xs font-mono text-[#C8A27C] flex items-center gap-1.5">
                      <ZoomIn size={14} /> Tampilan Detail Nametag 3D
                    </span>
                    <button
                      onClick={() => setIsZoomed(false)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer border border-white/15"
                    >
                      <ZoomOut size={13} />
                      <span>Zoom Out</span>
                    </button>
                  </div>

                  <TiltedCard
                    maxTilt={20}
                    perspective={1100}
                    scaleOnHover={1.03}
                    showGlare={true}
                    glareOpacity={0.4}
                    glareColor="rgba(240, 215, 185, 0.55)"
                  >
                    <div className="w-80 rounded-2xl p-4 bg-gradient-to-b from-[#1c1e27] via-[#151720] to-[#0f1015] border-2 border-[#C8A27C]/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] text-left">
                      <div className="w-12 h-2 rounded-full bg-black/90 border border-white/20 mx-auto mb-3" />

                      <div className="pb-2 mb-3 border-b border-white/15 flex items-center justify-between text-[10px] font-mono text-zinc-300">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <ShieldCheck size={13} className="text-[#C8A27C]" /> VERIFIED DEV PASS
                        </span>
                        <span className="text-[#C8A27C] font-mono text-[9px] bg-[#C8A27C]/15 px-2 py-0.5 rounded-full border border-[#C8A27C]/30">
                          2026 EDITION
                        </span>
                      </div>

                      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border-2 border-white/20 bg-zinc-950 shadow-2xl">
                        <img 
                          src="/kaciwww.png" 
                          alt="Muhammad Faiz Dzahin" 
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 border border-white/20 text-[9px] font-mono text-emerald-400">
                          Active
                        </div>
                      </div>

                      <div className="mt-3.5 text-center">
                        <h3 className="text-base font-bold text-white tracking-tight">
                          Muhammad Faiz Dzahin
                        </h3>
                        <p className="text-xs font-mono text-[#C8A27C] font-medium mt-0.5">
                          Full Stack Developer
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Web Apps · Frontend & Backend Systems
                        </p>
                      </div>

                      <div className="mt-3.5 pt-3 border-t border-white/15 flex items-center justify-between">
                        <div className="flex items-center gap-1 opacity-60">
                          {[4, 2, 5, 2, 6, 9, 3, 7, 5, 4, 6, 8, 9, 8, 5].map((w, idx) => (
                            <div 
                              key={idx} 
                              className="bg-zinc-200 h-4" 
                              style={{ width: `${w > 5 ? 2.5 : 1.5}px` }} 
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-zinc-400">
                          ID: MFD-FULLSTACK-26
                        </span>
                      </div>
                    </div>
                  </TiltedCard>

                  <p className="text-zinc-400 text-xs mt-3.5 text-center">
                    Gerakkan kursor untuk efek 3D tilt fisik · Klik di luar kartu atau tombol untuk menutup
                  </p>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}

export default AboutDeveloperModal;
