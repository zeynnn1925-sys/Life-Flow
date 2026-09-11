import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  ChevronDown, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Target,
  Flame,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

export const AdvisorChat: React.FC = () => {
  const { t, i18n } = useTranslation('advisor');
  const { user } = useAuth();
  const { transactions, habits, targets } = useData();
  const { language, isRTL } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem('lifeflow_advisor_chat_history');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'welcome-msg',
        role: 'model',
        text: i18n.language === 'id' 
          ? 'Halo! Saya Penasihat AI LifeFlow Anda. Saya memiliki akses aman dan terverifikasi ke data keuangan, target, dan kebiasaan harian Anda. Ada yang bisa saya bantu analisis hari ini?'
          : i18n.language === 'ar'
          ? 'مرحباً! أنا مستشارك الذكي في لايف فلو. لدي وصول آمن إلى بياناتك المالية وعاداتك وأهدافك اليومية. كيف يمكنني مساعدتك اليوم؟'
          : i18n.language === 'es'
          ? '¡Hola! Soy tu Asesor de IA en LifeFlow. Tengo acceso verificado y seguro a tus finanzas, hábitos y objetivos. ¿En qué puedo ayudarte hoy?'
          : 'Hello! I am your LifeFlow AI Advisor. I have secure, real-time access to your verified financial records, daily targets, and habits. How can I assist your workflow today?',
        timestamp: new Date().toISOString()
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem('lifeflow_advisor_chat_history', JSON.stringify(messages));
    } catch (e) {
      // ignore
    }
  }, [messages]);

  const quickPrompts = [
    {
      id: 'budget',
      icon: TrendingUp,
      label: t('prompt_budget', 'How is my spending budget holding up this month?')
    },
    {
      id: 'habits',
      icon: Flame,
      label: t('prompt_habits', 'Which habit needs more consistency this week?')
    },
    {
      id: 'targets',
      icon: Target,
      label: t('prompt_targets', 'How close am I to reaching my active financial targets?')
    },
    {
      id: 'plan',
      icon: Calendar,
      label: t('prompt_plan', 'Create a personalized routine plan for tomorrow.')
    }
  ];

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputMessage).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!customText) setInputMessage('');
    setIsLoading(true);

    try {
      let token = '';
      if (user) {
        token = await user.getIdToken().catch(() => '');
      }

      const activeLang = i18n.language || language || 'en';

      const response = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: textToSend,
          language: activeLang,
          history: messages.slice(-8).map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error(`Advisor service returned status ${response.status}`);
      }

      const data = await response.json();
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: data.text || 'Unable to generate insight at this time.',
        timestamp: data.timestamp || new Date().toISOString(),
        isFallback: data.fallback
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Advisor Chat Client Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: i18n.language === 'id'
          ? 'Maaf, terjadi gangguan jaringan saat menghubungi layanan AI Advisor. Data lokal Anda tetap aman.'
          : 'Sorry, there was a temporary network issue connecting to the AI Advisor. Your local data is safe.',
        timestamp: new Date().toISOString(),
        isFallback: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    const initialWelcome: Message = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      text: i18n.language === 'id' 
        ? 'Riwayat obrolan telah dibersihkan. Ada hal lain yang ingin Anda konsultasikan?'
        : 'Conversation history cleared. What else would you like to review?',
      timestamp: new Date().toISOString()
    };
    setMessages([initialWelcome]);
    localStorage.removeItem('lifeflow_advisor_chat_history');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="advisor-floating-button"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('open_advisor', 'LifeFlow AI Advisor')}
          className="fixed bottom-6 end-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-full shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 hover:scale-105 group border border-amber-400/30 backdrop-blur-md"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-amber-600 rounded-full animate-pulse" />
          </div>
          <span className="font-semibold text-xs tracking-wide hidden sm:inline">
            {t('open_advisor', 'LifeFlow AI Advisor')}
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div
          id="advisor-chat-window"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden ${
            isExpanded 
              ? 'inset-4 md:inset-10 rounded-3xl' 
              : 'bottom-4 end-4 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    {t('title', 'AI Life & Financial Advisor')}
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('online_badge', 'Live Sync')}
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 dark:text-stone-500">
                  {transactions.length} transactions · {habits.length} habits · {targets.length} targets
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                id="advisor-clear-btn"
                type="button"
                onClick={handleClearHistory}
                title={t('clear_history', 'Clear History')}
                className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                id="advisor-expand-btn"
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors hidden sm:inline-flex"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                id="advisor-close-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                title={t('minimize', 'Minimize')}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
                      isUser
                        ? 'bg-amber-500 text-white rounded-tr-xs'
                        : 'bg-stone-100 dark:bg-stone-800/90 text-stone-800 dark:text-stone-200 border border-stone-200/60 dark:border-stone-700/60 rounded-tl-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="prose prose-xs dark:prose-invert max-w-none space-y-2 text-stone-800 dark:text-stone-200 leading-relaxed font-normal">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 px-1 text-[10px] text-stone-400">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                      <button
                        id={`copy-btn-${msg.id}`}
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-amber-500 transition-colors flex items-center gap-1"
                        title={t('copy_response', 'Copy Response')}
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">{t('copied', 'Copied')}</span>
                          </>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-stone-400 p-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ms-1 text-stone-400 font-medium">
                  {t('thinking', 'Advisor is analyzing your real-time data...')}
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">
                {t('quick_prompts_title', 'Suggested Inquiries')}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {quickPrompts.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.id}
                      id={`quick-prompt-${p.id}`}
                      type="button"
                      onClick={() => handleSendMessage(p.label)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-200/70 dark:border-stone-700/70 hover:border-amber-500/40 text-start text-[11px] text-stone-700 dark:text-stone-300 hover:text-amber-600 dark:hover:text-amber-400 transition-all shadow-2xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                id="advisor-message-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('chat_placeholder', 'Ask anything about your cashflow, routines, or productivity plan...')}
                disabled={isLoading}
                className="flex-1 px-3.5 py-2.5 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all placeholder:text-stone-400"
              />
              <button
                id="advisor-send-button"
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                aria-label={t('send', 'Send')}
                className="p-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-1.5 text-[9px] text-stone-400 text-center">
              {t('disclaimer', 'AI advice is synthesized from your authenticated Firestore profile records for personal planning.')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AdvisorChat;
