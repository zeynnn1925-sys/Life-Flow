import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Code, Cpu, Zap, Globe, Rocket } from 'lucide-react';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutDeveloperModal({ isOpen, onClose }: AboutDeveloperModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-1 rounded-xxl shadow-modal z-50 overflow-hidden border border-hairline-strong max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-hairline bg-surface-2">
              <h2 className="text-heading-md font-black text-ink flex items-center gap-4 uppercase tracking-tight">
                <Code className="w-8 h-8 text-accent" />
                About Developer
              </h2>
              <button
                onClick={onClose}
                className="p-3 text-ink-subtle hover:bg-surface-3 hover:text-ink rounded-pill transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="w-40 h-40 md:w-56 md:h-56 shrink-0 rounded-lg overflow-hidden shadow-card border border-hairline mx-auto md:mx-0 bg-surface-2 group relative">
                  <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                  <img 
                    src="https://drive.google.com/thumbnail?id=1EZKfPPIyfFjmgLC3-gUuAFrQrIlXYb03&sz=w1000" 
                    alt="Muhammad Faiz Dzahin" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-accent text-white text-display-md font-black';
                        placeholder.innerText = 'MFD';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-display-sm font-black text-ink mb-2 uppercase tracking-tighter">Muhammad Faiz Dzahin</h3>
                  <p className="text-eyebrow font-black text-accent uppercase tracking-widest mb-6">Web & AI Builder</p>
                  <p className="text-body-md text-ink-subtle leading-relaxed mb-4 lowercase font-medium">
                    Muhammad Faiz Dzahin adalah Web dan AI Builder yang fokus membangun produk digital berbasis teknologi modern. Ia mengembangkan website, sistem berbasis AI, dan tools otomatisasi yang membantu pengguna bekerja lebih cepat dan lebih efisien.
                  </p>
                  <p className="text-body-md text-ink-tertiary leading-relaxed lowercase">
                    Fokus utamanya ada pada pengembangan web, integrasi AI, dan pembangunan sistem digital yang bisa berjalan otomatis. Setiap produk dibuat dengan tujuan jelas. Solusi harus praktis, cepat digunakan, dan memberi dampak langsung bagi pengguna.
                  </p>
                </div>
              </div>

              <div className="text-body-md text-ink-subtle leading-relaxed lowercase font-medium border-l-4 border-accent pl-6 py-2 italic opacity-80">
                Muhammad Faiz Dzahin aktif membangun berbagai proyek digital. Mulai dari platform edukasi, tools berbasis AI, hingga sistem yang membantu orang belajar, bekerja, dan mengelola informasi dengan lebih efektif.
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-surface-2 p-8 rounded-lg border border-hairline shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-40" />
                  <h4 className="text-heading-xs font-black text-ink mb-6 flex items-center gap-3 uppercase">
                    <Zap className="w-5 h-5 text-accent" />
                    Keahlian Utama
                  </h4>
                  <ul className="space-y-4">
                    {['Web Development', 'AI Integration', 'Automation System', 'API Development', 'Product Building'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-body-sm font-bold text-ink-subtle uppercase tracking-tight">
                        <div className="w-1.5 h-1.5 rounded-pill bg-accent shadow-glow-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-surface-2 p-8 rounded-lg border border-hairline shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-40" />
                  <h4 className="text-heading-xs font-black text-ink mb-6 flex items-center gap-3 uppercase">
                    <Cpu className="w-5 h-5 text-primary" />
                    Teknologi
                  </h4>
                  <ul className="space-y-4">
                    {['JavaScript dan TypeScript', 'Next.js dan Node.js', 'Python untuk AI dan automation', 'REST API dan berbagai layanan AI', 'Database modern seperti Supabase dan Firebase'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-body-sm font-bold text-ink-subtle uppercase tracking-tight leading-snug">
                        <div className="w-1.5 h-1.5 rounded-pill bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-surface-3 p-8 rounded-lg border border-hairline shadow-card relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-pill -mr-16 -mt-16 blur-2xl" />
                <h4 className="text-heading-xs font-black text-ink mb-6 flex items-center gap-3 uppercase">
                  <Rocket className="w-5 h-5 text-accent" />
                  Visi Pengembangan
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Membangun produk digital yang berguna bagi banyak orang',
                    'Menggabungkan web development dengan kecerdasan buatan',
                    'Menciptakan sistem yang bisa bekerja otomatis dan efisien',
                    'Membuat teknologi yang mudah diakses siapa saja'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-4 text-body-sm font-medium text-ink-subtle lowercase p-4 bg-surface-1 rounded-md border border-hairline">
                      <div className="w-8 h-8 rounded-pill bg-accent/10 flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-pill bg-accent" />
                      </div>
                      <span className="leading-tight">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
