import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap, ArrowRight, Sparkles, Info, Mail, Lock, Github, Scan } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { AboutDeveloperModal } from './AboutDeveloperModal';
import { FaceRecognition } from './FaceRecognition';

export default function Login() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, signInWithFace } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [faceMode, setFaceMode] = useState<'login' | 'register'>('login');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGithub();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with GitHub');
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
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
      setError(err.message || 'Authentication failed');
      setIsLoading(false);
    }
  };

  const handleFaceSuccess = async () => {
    setIsLoading(true);
    setShowFaceRecognition(false);
    try {
      await signInWithFace();
    } catch (err: any) {
      setError(err.message || 'Face recognition failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4],
            rotate: [0, 45, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/10 dark:to-purple-500/10 blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, -45, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 dark:from-emerald-500/10 dark:to-teal-500/10 blur-[120px]"
        />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center relative z-10">
        
        {/* Left Column: Branding & Value Prop */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:flex flex-col justify-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 text-sm font-medium text-zinc-700 dark:text-zinc-300 w-fit"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{t('slogan')}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-[1.1] mb-6"
          >
            Manage your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              life & finances
            </span> <br/>
            in one place.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-zinc-600 dark:text-zinc-400 max-w-md mb-10 leading-relaxed"
          >
            Join thousands of users who are taking control of their daily habits, tasks, and financial goals with LIFE FLOW.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-6"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-zinc-50 dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden z-[${5-i}]`}>
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <span className="text-zinc-900 dark:text-white font-bold">4.9/5</span> rating <br/>
              from happy users
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column: Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <motion.div 
            layout
            className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-zinc-800/50 p-8 sm:p-10 relative overflow-hidden flex flex-col min-h-[500px]"
          >
            {/* Inner Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 pointer-events-none" />
            
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex-1 flex flex-col">
              <motion.div layout className="flex flex-col items-center text-center mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center text-white mb-4"
                >
                  <Logo className="w-8 h-8" />
                </motion.div>
                <motion.h2 layout className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
                  {isSignUp ? t('createYourAccount') : t('welcomeBack')}
                </motion.h2>
                <motion.p layout className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                  {isSignUp ? t('signUpToContinue') : t('signInToContinue')} {t('appName')}
                </motion.p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-100 dark:border-rose-900/50 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {showFaceRecognition ? (
                  <motion.div
                    key="face-rec"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-6"
                  >
                    <FaceRecognition 
                      mode={faceMode}
                      onSuccess={handleFaceSuccess}
                      onCancel={() => setShowFaceRecognition(false)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="standard-login"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                      <motion.div layout>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('email')}
                            className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white"
                            required
                          />
                        </div>
                      </motion.div>
                      <motion.div layout>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password')}
                            className="w-full pl-11 pr-4 py-3 bg-white/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-zinc-900 dark:text-white"
                            required
                          />
                        </div>
                      </motion.div>
                      
                      <motion.button
                        layout
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSignUp ? t('signUp') : t('signIn')}
                      </motion.button>
                    </form>

                    <motion.div layout className="relative flex items-center py-2 mb-6">
                      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                      <span className="flex-shrink-0 mx-4 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                        {t('orContinueWith')}
                      </span>
                      <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800"></div>
                    </motion.div>

                    <motion.div layout className="grid grid-cols-3 gap-3 mb-6">
                      <motion.button
                        whileHover={{ y: -2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all disabled:opacity-70"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ y: -2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleGithubLogin}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all disabled:opacity-70"
                      >
                        <Github className="w-5 h-5 text-zinc-900 dark:text-white" />
                      </motion.button>

                      <motion.button
                        whileHover={{ y: -2, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => {
                          const hasFace = localStorage.getItem('userFaceDescriptor');
                          setFaceMode(hasFace ? 'login' : 'register');
                          setShowFaceRecognition(true);
                        }}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl transition-all disabled:opacity-70"
                        title={t('faceLogin')}
                      >
                        <Scan className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </motion.button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout className="mt-auto flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {isSignUp ? t('signIn') : t('signUp')}
                  </span>
                </button>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={() => setShowAbout(true)}
                  className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mt-2"
                >
                  <Info className="w-4 h-4" />
                  {t('aboutDeveloper')}
                </motion.button>
                
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-500"
                >
                  {t('termsAndConditions')}
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <AboutDeveloperModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
}
