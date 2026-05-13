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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl z-50 overflow-hidden border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                <Code className="w-6 h-6 text-blue-500" />
                About Developer
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-2xl overflow-hidden shadow-lg border-4 border-white dark:border-zinc-800 mx-auto md:mx-0 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  <img 
                    src="https://drive.google.com/thumbnail?id=1EZKfPPIyfFjmgLC3-gUuAFrQrIlXYb03&sz=w1000" 
                    alt="Muhammad Faiz Dzahin" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center bg-blue-500 text-white text-4xl font-bold';
                        placeholder.innerText = 'MFD';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-zinc-900 dark:text-white mb-2">Muhammad Faiz Dzahin</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-medium text-lg mb-4">Web & AI Builder</p>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                    Muhammad Faiz Dzahin adalah Web dan AI Builder yang fokus membangun produk digital berbasis teknologi modern. Ia mengembangkan website, sistem berbasis AI, dan tools otomatisasi yang membantu pengguna bekerja lebih cepat dan lebih efisien.
                  </p>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Fokus utamanya ada pada pengembangan web, integrasi AI, dan pembangunan sistem digital yang bisa berjalan otomatis. Setiap produk dibuat dengan tujuan jelas. Solusi harus praktis, cepat digunakan, dan memberi dampak langsung bagi pengguna.
                  </p>
                </div>
              </div>

              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                Muhammad Faiz Dzahin aktif membangun berbagai proyek digital. Mulai dari platform edukasi, tools berbasis AI, hingga sistem yang membantu orang belajar, bekerja, dan mengelola informasi dengan lebih efektif.
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Keahlian Utama
                  </h4>
                  <ul className="space-y-2">
                    {['Web Development', 'AI Integration', 'Automation System', 'API Development', 'Product Building'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-emerald-500" />
                    Teknologi
                  </h4>
                  <ul className="space-y-2">
                    {['JavaScript dan TypeScript', 'Next.js dan Node.js', 'Python untuk AI dan automation', 'REST API dan berbagai layanan AI', 'Database modern seperti Supabase dan Firebase'].map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-purple-500" />
                  Visi Pengembangan
                </h4>
                <ul className="space-y-3">
                  {[
                    'Membangun produk digital yang berguna bagi banyak orang',
                    'Menggabungkan web development dengan kecerdasan buatan',
                    'Menciptakan sistem yang bisa bekerja otomatis dan efisien',
                    'Membuat teknologi yang mudah diakses siapa saja'
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-700 dark:text-zinc-300">
                      <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                      </div>
                      <span className="leading-relaxed">{item}</span>
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
