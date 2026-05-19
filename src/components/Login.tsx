import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Zap, ArrowRight, Sparkles, Info, Mail, Lock, Github, Scan, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Logo } from './Logo';
import { AboutDeveloperModal } from './AboutDeveloperModal';
import { FaceRecognition } from './FaceRecognition';
import { AuroraBackground } from './ui/aurora-background';
import { Spotlight } from './ui/spotlight';

export default function Login() {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail, signInWithFace, signInAnonymouslyUser } = useAuth();
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

  const handleAnonymousLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInAnonymouslyUser();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in as Guest');
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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#010102]">
      <AuroraBackground className="absolute inset-0 z-0" />
      <Spotlight
        className="absolute z-[1] -top-40 left-0 md:left-60"
        fill="#494fdf"
      />
      
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6 font-sans">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
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
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shadow-glow-primary">
              <Logo className="w-10 h-10" />
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter text-white uppercase leading-none">Life Flow</span>
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.3em] mt-1">{t('slogan')}</span>
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-display-xl font-black text-ink tracking-tight leading-[0.95] mb-8 uppercase"
          >
            Manage your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-primary animate-gradient">
              life & finances
            </span> <br/>
            in one place.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-body-lg text-ink-subtle max-w-md mb-12 font-medium lowercase leading-relaxed"
          >
            Join thousands of users who are taking control of their daily habits, tasks, and financial goals with LIFE FLOW.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-8"
          >
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-pill border-2 border-canvas bg-surface-3 flex items-center justify-center overflow-hidden shadow-sm transition-transform hover:scale-110 hover:z-50 cursor-pointer">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
            <div className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">
              <span className="text-accent text-lg mr-1 tracking-tighter">4.9/5</span> rating <br/>
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
            className="bg-surface-1/80 backdrop-blur-2xl rounded-xxl shadow-modal border border-hairline-strong p-10 sm:p-12 relative overflow-hidden flex flex-col min-h-[580px]"
          >
            {/* Inner Glow */}
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
            
            {/* Loading Overlay */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-50 bg-canvas/60 backdrop-blur-md flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-pill"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative z-10 flex-1 flex flex-col">
              <motion.div layout className="flex flex-col items-center text-center mb-10">
                <motion.div 
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                  className="w-20 h-20 bg-accent rounded-lg shadow-glow-accent flex items-center justify-center text-white mb-6 group cursor-pointer"
                >
                  <Logo className="w-10 h-10 transition-transform group-hover:scale-110" />
                </motion.div>
                <motion.h2 layout className="text-heading-lg font-black text-ink tracking-tight mb-3 uppercase">
                  {isSignUp ? t('createYourAccount') : t('welcomeBack')}
                </motion.h2>
                <motion.p layout className="text-body-sm text-ink-subtle font-medium lowercase">
                  {isSignUp ? t('signUpToContinue') : t('signInToContinue')} {t('appName')}
                </motion.p>
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="mb-8 p-4 bg-danger/10 text-danger text-eyebrow font-black uppercase tracking-widest rounded-md border border-danger/20 text-center"
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {showFaceRecognition ? (
                  <motion.div
                    key="face-rec"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-8"
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
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(20px)' }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <form onSubmit={handleEmailAuth} className="space-y-5 mb-8">
                      <motion.div layout>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-ink-tertiary group-focus-within:text-accent transition-colors">
                            <Mail className="w-5 h-5" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('email').toLowerCase()}
                            className="w-full pl-12 pr-5 h-14 bg-surface-2 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-ink font-medium"
                            required
                          />
                        </div>
                      </motion.div>
                      <motion.div layout>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-ink-tertiary group-focus-within:text-accent transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('password').toLowerCase()}
                            className="w-full pl-12 pr-5 h-14 bg-surface-2 border border-hairline rounded-md focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all text-ink font-medium"
                            required
                          />
                        </div>
                      </motion.div>
                      
                      <motion.button
                        layout
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-14 bg-accent hover:bg-accent-hover text-white rounded-pill font-black text-eyebrow uppercase tracking-widest shadow-glow-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSignUp ? t('signUp') : t('signIn')}
                      </motion.button>
                    </form>

                    <motion.div layout className="relative flex items-center py-4 mb-8">
                      <div className="flex-grow border-t border-hairline"></div>
                      <span className="flex-shrink-0 mx-6 text-ink-tertiary text-eyebrow font-black uppercase tracking-[0.2em] opacity-40">
                        {t('orContinueWith')}
                      </span>
                      <div className="flex-grow border-t border-hairline"></div>
                    </motion.div>

                    <motion.div layout className="grid grid-cols-4 gap-4 mb-10">
                      {[
                        { icon: <svg className="w-6 h-6" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>, onClick: handleGoogleLogin, title: 'Google' },
                        { icon: <Github className="w-6 h-6" />, onClick: handleGithubLogin, title: 'GitHub' },
                        { icon: <Scan className="w-6 h-6 text-accent" />, onClick: () => {
                          const hasFace = localStorage.getItem('userFaceDescriptor');
                          setFaceMode(hasFace ? 'login' : 'register');
                          setShowFaceRecognition(true);
                        }, title: 'Face' },
                        { icon: <User className="w-6 h-6 text-ink-subtle" />, onClick: handleAnonymousLogin, title: t('continueAsGuest') }
                      ].map((social, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={{ y: -3, scale: 1.05, border: '1px solid var(--color-hairline-strong)', backgroundColor: 'var(--color-surface-3)' }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={social.onClick}
                          disabled={isLoading}
                          title={social.title}
                          className="flex items-center justify-center h-14 bg-surface-2 border border-hairline rounded-md transition-all shadow-sm disabled:opacity-50"
                        >
                          {social.icon}
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout className="mt-auto flex flex-col items-center gap-6">
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError(null);
                  }}
                  className="text-eyebrow font-black uppercase tracking-widest text-ink-subtle hover:text-ink transition-colors group"
                >
                  {isSignUp ? t('alreadyHaveAccount') : t('dontHaveAccount')}{' '}
                  <span className="text-accent underline underline-offset-4 decoration-2 decoration-accent/30 group-hover:decoration-accent transition-all">
                    {isSignUp ? t('signIn') : t('signUp')}
                  </span>
                </button>

                <div className="flex items-center gap-8 border-t border-hairline pt-8 w-full justify-center">
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={() => setShowAbout(true)}
                    className="flex items-center gap-2 text-eyebrow font-black uppercase tracking-tighter text-ink-tertiary hover:text-accent transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    {t('aboutDeveloper')}
                  </motion.button>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="text-center text-[10px] font-black uppercase tracking-[0.1em] text-ink-tertiary opacity-40 max-w-[120px]"
                  >
                    {t('termsAndConditions')}
                  </motion.p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>

    <AboutDeveloperModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
  </div>
);
}
