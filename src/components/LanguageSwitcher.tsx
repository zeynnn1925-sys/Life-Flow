import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export interface LanguageOption {
  code: 'en' | 'id' | 'es' | 'ar' | 'de';
  label: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English (US)', flag: '🇺🇸', dir: 'ltr' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية (RTL)', flag: '🇸🇦', dir: 'rtl' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
];

interface LanguageSwitcherProps {
  variant?: 'compact' | 'dropdown' | 'inline';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { i18n, t } = useTranslation('common');
  const { language: contextLang, setLanguage: setContextLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeCode = (contextLang || i18n.language || 'en').substring(0, 2) as 'en' | 'id' | 'es' | 'ar' | 'de';
  const currentLang = languages.find(l => l.code === activeCode) || languages[0];

  const handleLanguageChange = (code: 'en' | 'id' | 'es' | 'ar' | 'de') => {
    setContextLang(code);
    if (i18n.isInitialized) {
      i18n.changeLanguage(code);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {languages.map((lang) => {
          const isActive = activeCode === lang.code;
          return (
            <button
              key={lang.code}
              id={`lang-btn-${lang.code}`}
              type="button"
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                isActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span>{lang.nativeName}</span>
              {isActive && <Check className="w-3.5 h-3.5 ms-1" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-start ${className}`} ref={dropdownRef}>
      <button
        id="language-switcher-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('select_language', 'Select Language')}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium transition-all shadow-xs backdrop-blur-md"
      >
        <span className="text-sm">{currentLang.flag}</span>
        <span className="hidden sm:inline font-semibold">{currentLang.code.toUpperCase()}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute end-0 mt-2 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 border-b border-stone-100 dark:border-stone-800">
            {t('select_language', 'Select Language')}
          </div>
          <div className="p-1 space-y-0.5">
            {languages.map((lang) => {
              const isSelected = activeCode === lang.code;
              return (
                <button
                  key={lang.code}
                  id={`lang-option-${lang.code}`}
                  type="button"
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <div className="flex flex-col text-start">
                      <span className="leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-stone-400 dark:text-stone-500">{lang.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
