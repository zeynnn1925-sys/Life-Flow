import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Code2, Terminal, Layers, ShieldCheck, Mail, 
  Check, Copy, MessageSquare, ArrowUpRight, Server, 
  Database, Cpu, Globe, Laptop, Workflow, GitBranch, 
  Container, Wrench, Network
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

  const tabs: { id: TabType; label: string }[] = [
    { id: 'story', label: isId ? 'Profil & Pendekatan Rekayasa' : 'Profile & Philosophy' },
    { id: 'languages', label: isId ? 'Bahasa Pemrograman & Stack' : 'Languages & Stack' },
    { id: 'automation', label: isId ? 'Otomatisasi & Infrastruktur' : 'Automation & Infra' },
    { id: 'services', label: isId ? 'Kapabilitas & Layanan' : 'Capabilities & Services' },
    { id: 'contact', label: isId ? 'Kontak Langsung' : 'Direct Contact' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-40"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative z-50 w-full max-w-4xl bg-[#121316] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Header Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#16181d]">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block">
                  ENGINEERING PORTFOLIO
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

            {/* Modal Body */}
            <div className="overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Hero & Nametag Section */}
              <div className="px-6 pt-6 pb-7 border-b border-white/10 bg-[#14151a]">
                <div className="flex flex-col lg:flex-row gap-7 items-center lg:items-start">
                  
                  {/* Hanging Nametag Card with React Bits TiltedCard 3D Interactive Effect */}
                  <div className="flex flex-col items-center shrink-0 w-60 select-none">
                    {/* Lanyard Top Strap */}
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-10 bg-zinc-800 rounded-t border-x border-zinc-700/60 shadow-inner flex justify-center py-1">
                        <div className="w-0.5 h-full bg-zinc-600/70" />
                      </div>
                      
                      {/* Metal Swivel Clasp */}
                      <div className="w-8 h-3 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-600 rounded-sm shadow border border-zinc-300" />
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 bg-zinc-800 -mt-1 shadow-inner flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-zinc-950" />
                      </div>
                    </div>

                    {/* ID Card Holder inside TiltedCard */}
                    <TiltedCard 
                      maxTilt={14} 
                      perspective={900} 
                      scaleOnHover={1.03} 
                      showGlare={true} 
                      glareOpacity={0.25}
                      glareColor="rgba(255, 255, 255, 0.45)"
                      className="-mt-1"
                    >
                      <div className="relative w-60 rounded-xl p-3 bg-[#191b22] border border-white/15 shadow-2xl">
                        {/* Slot Cutout */}
                        <div className="w-8 h-1.5 rounded-full bg-black/70 border border-white/10 mx-auto mb-2" />

                        {/* Header Inside Badge */}
                        <div className="pb-2 mb-2.5 border-b border-white/10 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                          <span className="font-semibold text-zinc-300 flex items-center gap-1">
                            <ShieldCheck size={11} className="text-zinc-400" /> ENGINEER PASS
                          </span>
                        </div>

                        {/* Photo Frame */}
                        <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden border border-white/10 bg-zinc-900 group">
                          <img 
                            src="/kaciwww.png" 
                            alt="Muhammad Faiz Dzahin" 
                            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src !== '/kaciwww.png') target.src = '/kaciwww.png';
                            }}
                          />
                        </div>

                        {/* Identity Details with React Bits Animated Typography */}
                        <div className="mt-2.5 text-center">
                          <h3 className="text-sm font-bold text-white tracking-tight">
                            <ShinyText speed={4}>Muhammad Faiz Dzahin</ShinyText>
                          </h3>
                          <div className="mt-1 h-4 flex items-center justify-center">
                            <RotatingText
                              texts={[
                                'Senior Full-Stack Engineer',
                                'Distributed Systems Architect',
                                'High-Performance Backend',
                                'DevOps & System Automation'
                              ]}
                              interval={2600}
                              textClassName="text-[11px] font-mono text-zinc-400"
                            />
                          </div>
                        </div>

                        {/* Barcode Strip */}
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-0.5 opacity-40">
                            {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, idx) => (
                              <div 
                                key={idx} 
                                className="bg-zinc-300 h-3" 
                                style={{ width: `${w > 4 ? 2 : 1}px` }} 
                              />
                            ))}
                          </div>
                          <span className="text-[8px] font-mono text-zinc-500">
                            ID: MFD-CORE-26
                          </span>
                        </div>
                      </div>
                    </TiltedCard>
                  </div>

                  {/* Hero Intro */}
                  <div className="flex-1 text-center lg:text-left flex flex-col justify-center">
                    <div className="text-xs font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      FULL-STACK SOFTWARE ENGINEER & SYSTEM ARCHITECT
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight flex items-center gap-2 justify-center lg:justify-start">
                      <ShinyText speed={3.5}>Muhammad Faiz Dzahin</ShinyText>
                    </h1>
                    
                    <p className="text-sm text-zinc-300 mt-2.5 leading-relaxed max-w-2xl">
                      {isId 
                        ? 'Software Engineer dengan spesialisasi pengembangan Full-Stack berskala produksi, otomatisasi sistem terdistribusi, optimasi database, dan integrasi kecerdasan buatan tingkat lanjut. Berpengalaman merancang arsitektur perangkat lunak dari layer komputasi sistem hingga pengalaman pengguna berkecepatan tinggi.'
                        : 'Software Engineer specializing in production-grade Full-Stack architecture, distributed automation pipelines, database optimization, and applied artificial intelligence systems.'}
                    </p>

                    {/* Engineering Creed */}
                    <div className="mt-4 p-3.5 rounded-lg bg-white/[0.03] border-l-2 border-l-blue-400 border-y border-r border-white/5 text-xs text-zinc-300 leading-relaxed text-left max-w-2xl">
                      "{isId 
                        ? 'Rekayasa perangkat lunak sejati bukan sekadar merangkai pustaka atau mengandalkan alat bantu, melainkan pemahaman mendalam tentang bagaimana data mengalir, bagaimana memori dan konkurensi dikelola, serta bagaimana membangun sistem yang tetap kokoh saat beban transaksi melonjak tinggi.'
                        : 'True software engineering lies in understanding how data flows, how concurrency and memory are managed, and how to build systems that remain resilient under high throughput.'}"
                    </div>

                    {/* Quick Specs */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 max-w-2xl">
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">DISIPLIN</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Full-Stack & Systems</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">ARSITEKTUR</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Distributed & Event-Driven</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">INFRASTRUKTUR</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Docker, Linux, CI/CD</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 text-left">
                        <span className="text-[10px] font-mono uppercase text-zinc-500 block">KUALITAS SISTEM</span>
                        <span className="text-xs font-semibold text-zinc-200 mt-0.5 block truncate">Scalable & Resilient</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Navigation Tabs with Animated Pill (shadcn / framer-motion pattern) */}
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

              {/* Tab Contents */}
              <div className="p-6">
                
                {/* TAB 1: PROFIL & PENDEKATAN REKAYASA (First-Person Perspective) */}
                {activeTab === 'story' && (
                  <div className="space-y-6">
                    {/* Section 1 */}
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Pendekatan Rekayasa Saya
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Keahlian Teknis Mendalam dan Kendali Penuh Terhadap Arsitektur
                      </h4>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        Sebagai seorang Full-Stack Engineer, saya membangun perangkat lunak dengan prinsip kendali penuh terhadap setiap lapisan sistem. Saya tidak membatasi diri pada satu framework atau sekadar menggunakan kode instan. Dari perancangan antarmuka pengguna yang reaktif, arsitektur REST/gRPC API, manajemen transaksi basis data ACID, hingga automasi server Linux di layer infrastruktur, semua saya bangun dengan pemahaman sistematis atas cara kerja komputasi.
                      </p>
                    </div>

                    {/* Section 2 */}
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Arsitektur Sistem LifeFlow
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Menangani State Kompleks, Sinkronisasi Offline, dan Kerapian Logika
                      </h4>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        LifeFlow adalah cerminan langsung dari kapabilitas teknik saya dalam merancang aplikasi kompleks. Sistem ini menangani sinkronisasi multi-layer antara IndexedDB di sisi klien dan Firestore di sisi cloud, mempertahankan persistensi state saat offline, serta mengolah kalkulasi analitik finansial dan kebiasaan secara lokal dengan kecepatan tinggi. Setiap modul dirancang modular agar mudah diuji, diperluas, dan tahan terhadap kegagalan jaringan.
                      </p>
                    </div>

                    {/* Section 3 */}
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                      <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                        Penerapan Rekayasa AI & Otomasi Tingkat Lanjut
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white">
                        Mengintegrasikan Model Cerdas Secara Deterministik dan Andal
                      </h4>
                      <p className="text-xs sm:text-[13px] text-zinc-300 leading-relaxed">
                        Dalam integrasi AI, saya menolak pendekatan tanpa arah. Saya merancang pipeline AI menggunakan teknik Function Calling, penegakan skema JSON terstruktur (*deterministic JSON schema validation*), serta fallback lokal dinamis jika API pihak ketiga mengalami kendala jaringan atau batas kapasitas. Model cerdas saya posisikan sebagai mesin pemroses data terstruktur (seperti OCR struk belanja dan pemodelan jadwal) yang selalu diverifikasi oleh logika validasi ketat di sisi backend.
                      </p>
                    </div>

                    {/* Core Engineering Pillars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">PILAR 01</span>
                        <h5 className="text-xs font-bold text-white mt-1">Ketelitian Algoritmik</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          Memilih struktur data dan algoritma yang tepat untuk meminimalkan kompleksitas waktu (Big-O) dan penggunaan memori.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">PILAR 02</span>
                        <h5 className="text-xs font-bold text-white mt-1">Resiliensi & Skalabilitas</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          Sistem dibangun dengan penanganan error komprehensif, retry berjangka, dan arsitektur yang siap di-scale secara horizontal.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase block font-semibold">PILAR 03</span>
                        <h5 className="text-xs font-bold text-white mt-1">Otomatisasi Penuh</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-snug">
                          Mengotomatiskan alur kerja pengujian, deployment, dan pemrosesan data di background untuk reliabilitas maksimal.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: BAHASA PEMROGRAMAN & STACK TEKNIS LENGKAP */}
                {activeTab === 'languages' && (
                  <div className="space-y-5">
                    {/* Programming Languages Spectrum */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Code2 size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Spektrum Bahasa Pemrograman
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">TypeScript</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Full-Stack & Typing</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">JavaScript (ESNext)</span>
                          <span className="text-[10px] text-zinc-400 font-sans">V8 Engine & Node Runtime</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Go (Golang)</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Concurrency & Microservices</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Python</span>
                          <span className="text-[10px] text-zinc-400 font-sans">FastAPI & Scripting</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Rust</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Systems & Memory Safety</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">SQL (PostgreSQL)</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Relational & Query Tuning</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Java / Kotlin</span>
                          <span className="text-[10px] text-zinc-400 font-sans">JVM & OOP Architecture</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="text-white font-bold block">Bash / Shell</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Linux Ops & Automation</span>
                        </div>
                      </div>
                    </div>

                    {/* Frontend Architecture */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Laptop size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Frontend & Client Architecture
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">React 19 & Next.js</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Server Components, Hooks</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Tailwind CSS (v3/v4)</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Design Tokens & Scalability</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Progressive Web Apps</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Service Worker, Offline Cache</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Framer Motion</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Physics Micro-Interactions</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Vite Bundler</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Rollup, HMR, Code-Splitting</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Recharts / SVG</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Data Visualization & Canvas</span>
                        </div>
                      </div>
                    </div>

                    {/* Backend & Persistence */}
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <Server size={16} className="text-zinc-300" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                          Backend, Database & Data Systems
                        </h4>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-zinc-200">
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Node.js / Express</span>
                          <span className="text-[10px] text-zinc-400 font-sans">High-throughput REST API</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Go HTTP / Gin</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Low-Latency Microservices</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">PostgreSQL</span>
                          <span className="text-[10px] text-zinc-400 font-sans">ACID, Indices, Drizzle ORM</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Firebase Firestore</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Real-time sync, Security Rules</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">Redis In-Memory</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Caching & Key-Value Store</span>
                        </div>
                        <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                          <span className="font-bold text-white block">IndexedDB API</span>
                          <span className="text-[10px] text-zinc-400 font-sans">Browser Persistent Storage</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: OTOMATISASI & INFRASTRUKTUR SISTEM */}
                {activeTab === 'automation' && (
                  <div className="space-y-4">
                    <div className="text-xs text-zinc-400 mb-2">
                      {isId 
                        ? 'Penguasaan instrumen otomasi alur kerja, orkesrasi server, pipeline CI/CD, dan pemrosesan latar belakang yang menjamin reliabilitas sistem:'
                        : 'Comprehensive system automation, background task orchestration, CI/CD pipelines, and infrastructure tooling:'}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Container size={16} className="text-zinc-200" />
                          <h4 className="text-sm font-bold text-white">Containerization & Linux Infrastructure</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Pengelolaan deployment menggunakan Docker dan Docker Compose. Mengonfigurasi lingkungan server Linux (Ubuntu/Debian), manajemen proses sistem, isolasi dependensi, dan Nginx reverse proxy dengan enkripsi SSL/TLS.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Docker • Docker Compose • Nginx • Linux CLI
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <GitBranch size={16} className="text-zinc-200" />
                          <h4 className="text-sm font-bold text-white">CI/CD Pipeline & Automated Delivery</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Penerapan alur integrasi berkelanjutan (CI/CD) via GitHub Actions: otomatisasi linting kode, pengetikan statis TypeScript, build testing terisolasi, dan auto-deploy tanpa *downtime* ke production environment.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          GitHub Actions • Automated Testing • Deployment Hooks
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Workflow size={16} className="text-zinc-200" />
                          <h4 className="text-sm font-bold text-white">Background Queues & Scheduled Jobs</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Pemisahan tugas berat dari jalur HTTP utama menggunakan antrean latar belakang (*asynchronous worker queues*), manajemen event scheduler (cron jobs), serta sinkronisasi data antar-layanan secara periodik.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Cron Jobs • Event-Driven Workers • Webhooks
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                        <div className="flex items-center gap-2">
                          <Network size={16} className="text-zinc-200" />
                          <h4 className="text-sm font-bold text-white">Browser Automation & Data Scraping</h4>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          Otomatisasi pengujian antarmuka dan ekstraksi data web menggunakan Python & headless browser (Playwright / Puppeteer), pemrosesan berkas terotomasi, serta parsing dokumen tabular skala besar.
                        </p>
                        <div className="pt-2 text-[10px] font-mono text-zinc-400 border-t border-white/5">
                          Playwright • Puppeteer • Python Automation • OCR Parsing
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 4: KAPABILITAS & LAYANAN */}
                {activeTab === 'services' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      
                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 mb-2.5">
                            <Layers size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Pengembangan Web & Aplikasi SaaS End-to-End</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Membangun sistem perangkat lunak web utuh dari perancangan arsitektur data, pembuatan REST/gRPC backend, hingga antarmuka front-end responsif berperforma tinggi yang siap menangani ribuan pengguna aktif.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          SaaS Platforms • Internal Web Portals • Realtime Dashboards
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 mb-2.5">
                            <Workflow size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Sistem Otomasi Bisnis & Backend Engineering</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Mendesain automasi operasional perusahaan, integrasi webhook antar-layanan, antrean pemrosesan tugas asinkron, dan migrasi sistem manual menjadi alur kerja terprogram otomatis.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          Microservices • Pipeline Otomasi • Webhook Hub
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 mb-2.5">
                            <Database size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Optimasi Basis Data & Arsitektur Data Terdistribusi</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Perancangan skema database relasional (PostgreSQL) maupun dokumen (Firestore), pembuatan indeks komposit efisien, pencegahan race-condition melalui transaksi atomik, dan caching berlapis Redis.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          PostgreSQL • Caching Redis • Transaksi Atomik
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col justify-between">
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-200 mb-2.5">
                            <Cpu size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-white">Penerapan AI Sistematis & Vision OCR</h4>
                          <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                            Integrasi model cerdas multimodal untuk ekstraksi data dokumen dan struk, pembuatan antarmuka penasihat analitik berbasis data terverifikasi, dan perancangan skema JSON deterministik tanpa halusinasi.
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-zinc-400">
                          Structured JSON AI • Vision Extraction • Local Fallback
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 5: KONTAK LANGSUNG */}
                {activeTab === 'contact' && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-4">
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-white">
                          Saluran Komunikasi Langsung
                        </h4>
                        <p className="text-xs sm:text-[13px] text-zinc-300 mt-1 leading-relaxed">
                          Saya terbuka untuk mendiskusikan rekayasa perangkat lunak berskala besar, kebutuhan arsitektur sistem otomatisasi, maupun pengembangan produk digital baru.
                        </p>
                      </div>

                      {/* Contact Action Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        
                        {/* WhatsApp Contact */}
                        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                              <MessageSquare size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">WHATSAPP RESMI</span>
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

                        {/* Email Contact */}
                        <div className="p-3.5 rounded-lg bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                              <Mail size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">EMAIL RESMI</span>
                              <span className="text-xs font-mono font-bold text-zinc-100 truncate block">{developerEmail}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StarBorder color="#38bdf8" speed="5s" className="flex-1">
                              <a
                                href={`mailto:${developerEmail}?subject=Diskusi%20Rekayasa%20Perangkat%20Lunak`}
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

                    {/* Developer Credentials Summary */}
                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-300">
                        <div>
                          <span className="text-zinc-500 font-mono">Nama:</span> Muhammad Faiz Dzahin
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono">Keahlian:</span> Senior Full-Stack & System Automation
                        </div>
                        <div>
                          <span className="text-zinc-500 font-mono">Status:</span> Terbuka untuk Diskusi & Kolaborasi Rekayasa
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

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-white/10 bg-[#16181d] flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono text-[11px]">
                LifeFlow Engineering • Muhammad Faiz Dzahin
              </span>
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md bg-white/10 hover:bg-white/15 text-zinc-200 hover:text-white transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
