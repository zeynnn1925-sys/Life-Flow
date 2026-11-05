import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Github, 
  Scan, 
  User, 
  Eye, 
  EyeOff,
  Globe,
  ArrowRight,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { AboutDeveloperModal } from './AboutDeveloperModal';
import { LifeFlowHero3D } from './3d/LifeFlowHero3D';

const FaceRecognition = React.lazy(() => import('./FaceRecognition').then(m => ({ default: m.FaceRecognition })));

export default function Login() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, signInWithFace, signInAnonymouslyUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [faceMode, setFaceMode] = useState<'login' | 'register'>('login');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isId = language === 'id';

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || (isId ? 'Gagal masuk dengan Google' : 'Failed to sign in with Google'));
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGithub();
    } catch (err: any) {
      setError(err.message || (isId ? 'Gagal masuk dengan GitHub' : 'Failed to sign in with GitHub'));
      setIsLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAnonymouslyUser();
    } catch (err: any) {
      setError(err.message || (isId ? 'Gagal masuk sebagai Tamu' : 'Failed to sign in as Guest'));
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError(isId ? 'Harap isi email dan kata sandi.' : 'Please enter email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || (isId ? 'Autentikasi gagal. Periksa kembali akun Anda.' : 'Authentication failed. Please verify credentials.'));
      setIsLoading(false);
    }
  };

  const handleFaceSuccess = async () => {
    setIsLoading(true);
    setShowFaceRecognition(false);
    try {
      await signInWithFace();
    } catch (err: any) {
      setError(err.message || (isId ? 'Pengenalan wajah gagal' : 'Face recognition failed'));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090a0f] text-zinc-100 flex flex-col justify-between selection:bg-[#00f0ff] selection:text-black">
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-[#141721] border border-zinc-700/80 flex items-center justify-center">
            <Logo className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-semibold tracking-tight text-white block leading-none">LifeFlow</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141721] hover:bg-[#1c202d] border border-zinc-800 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-[#00f0ff]" />
            <span className="uppercase font-semibold">{language}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAbout(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#141721] hover:bg-[#1c202d] border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            <Info size={13} className="text-[#00f0ff]" />
            <span>{isId ? 'Tentang Pengembang' : 'Developer'}</span>
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-6 py-8 sm:py-12 flex-1 flex items-center">
        <div className="w-full grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-7 flex flex-col justify-center order-2 lg:order-1">
            <div className="max-w-xl">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight">
                {isId ? 'Kelola ritme hidup, keuangan, dan fokus dalam satu kendali nyata.' : 'Master your daily habits, finances, and focus state.'}
              </h1>

              <p className="mt-3.5 text-sm sm:text-base text-zinc-400 leading-relaxed">
                {isId
                  ? 'Dirancang sebagai ruang kerja pribadi yang menghubungkan jurnal finansial, pengingat kebiasaan harian, dan timer fokus kerja tanpa kerumitan antarmuka.'
                  : 'Designed as a personal command desk unifying financial ledgers, daily habit loops, and dedicated focus timers.'}
              </p>
            </div>

            <div className="mt-6 rounded-xl bg-[#0f1118] border border-zinc-800/90 p-4 shadow-xl overflow-hidden">
              <LifeFlowHero3D />
              
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-end text-xs font-mono text-zinc-400">
                <span className="text-[#00f0ff]">Gerakkan kursor untuk mengamati</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 w-full max-w-md mx-auto order-1 lg:order-2">
            <div className="rounded-2xl p-6 sm:p-8 bg-[#11131a] border border-zinc-800 shadow-2xl relative overflow-hidden">
              <AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-[#090a0f]/90 flex flex-col items-center justify-center gap-3"
                  >
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-[#00f0ff] rounded-full animate-spin" />
                    <span className="text-xs font-mono text-zinc-300">
                      {isId ? 'Memproses...' : 'Processing...'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isSignUp ? (isId ? 'Daftar Akun' : 'Create Account') : (isId ? 'Masuk' : 'Sign In')}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {isSignUp ? (isId ? 'Buat akun untuk sinkronisasi data' : 'Create account to sync data') : (isId ? 'Lanjutkan ke dashboard Anda' : 'Continue to your dashboard')}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-lg bg-[#181b24] border border-zinc-700/80 flex items-center justify-center text-white shrink-0">
                  <Logo className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 p-1 rounded-lg bg-[#0b0c10] border border-zinc-800 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    !isSignUp ? 'bg-[#1a1d27] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isId ? 'Masuk' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className={`py-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    isSignUp ? 'bg-[#1a1d27] text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {isId ? 'Daftar' : 'Sign Up'}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-red-300 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {showFaceRecognition ? (
                <div className="mb-4">
                  <React.Suspense fallback={<div className="p-6 text-center text-xs text-zinc-400">Kamera...</div>}>
                    <FaceRecognition
                      mode={faceMode}
                      onSuccess={handleFaceSuccess}
                      onCancel={() => setShowFaceRecognition(false)}
                    />
                  </React.Suspense>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleAnonymousLogin}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#171a24] hover:bg-[#1f2331] border border-zinc-700/80 text-white font-medium text-xs flex items-center justify-between transition-colors cursor-pointer mb-4"
                  >
                    <div className="flex items-center gap-2.5">
                      <User size={15} className="text-[#00f0ff]" />
                      <span className="font-semibold text-xs">
                        {isId ? 'Masuk sebagai Tamu (Mode Coba)' : 'Enter as Guest (Demo Mode)'}
                      </span>
                    </div>
                    <ArrowRight size={14} className="text-[#00f0ff]" />
                  </button>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="h-10 rounded-lg bg-[#141721] hover:bg-[#1c202d] border border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGithubLogin}
                      disabled={isLoading}
                      className="h-10 rounded-lg bg-[#141721] hover:bg-[#1c202d] border border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Github size={14} />
                      <span>GitHub</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const hasFace = localStorage.getItem('userFaceDescriptor');
                        setFaceMode(hasFace ? 'login' : 'register');
                        setShowFaceRecognition(true);
                      }}
                      disabled={isLoading}
                      className="h-10 rounded-lg bg-[#141721] hover:bg-[#1c202d] border border-zinc-800 flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Scan size={14} className="text-[#00f0ff]" />
                      <span>{isId ? 'Wajah' : 'Face'}</span>
                    </button>
                  </div>

                  <div className="relative flex items-center my-4">
                    <div className="grow border-t border-zinc-800" />
                    <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                      {isId ? 'Atau email' : 'Or email'}
                    </span>
                    <div className="grow border-t border-zinc-800" />
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Mail size={15} />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          required
                          className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0b0c10] border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        {isId ? 'Kata Sandi' : 'Password'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Lock size={15} />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full pl-9 pr-9 py-2 rounded-lg bg-[#0b0c10] border border-zinc-800 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] outline-none text-xs text-white placeholder-zinc-600 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-2 py-2.5 rounded-lg bg-[#00f0ff] hover:bg-[#38f2ff] text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSignUp ? (isId ? 'Buat Akun' : 'Create Account') : (isId ? 'Masuk' : 'Sign In')}
                    </button>
                  </form>
                </>
              )}

              <div className="mt-5 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {isSignUp ? (isId ? 'Sudah punya akun? ' : 'Have an account? ') : (isId ? 'Belum punya akun? ' : 'Need an account? ')}
                  <span className="text-[#00f0ff] underline">
                    {isSignUp ? (isId ? 'Masuk' : 'Sign In') : (isId ? 'Daftar' : 'Sign Up')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowAbout(true)}
                  className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  {isId ? 'Tentang Pengembang' : 'About'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-4 border-t border-zinc-800/80 text-xs text-zinc-400 flex items-center justify-between">
        <span>LifeFlow · Personal Productivity &amp; Financial Management</span>
        <button
          type="button"
          onClick={() => setShowAbout(true)}
          className="hover:text-white transition-colors cursor-pointer"
        >
          Muhammad Faiz Dzahin
        </button>
      </footer>

      <AboutDeveloperModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
