import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, CaretDown } from '@phosphor-icons/react';
import { useLanguage } from '../contexts/LanguageContext';

export interface LanguageOption {
  code: 'en' | 'id' | 'es' | 'ar' | 'de';
  label: string;
  nativeName: string;
  dir: 'ltr' | 'rtl';
}

export const languages: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English (US)', dir: 'ltr' },
  { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', nativeName: 'العربية (RTL)', dir: 'rtl' },
  { code: 'de', label: 'German', nativeName: 'Deutsch', dir: 'ltr' },
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-white/10 text-white border-white/20'
                  : 'bg-surface-2 text-ink-subtle border-hairline hover:text-ink hover:bg-surface-3'
              }`}
            >
              <span className="font-mono text-[10px] tracking-wider text-ink-tertiary">{lang.code.toUpperCase()}</span>
              <span>{lang.nativeName}</span>
              {isActive && <Check size={14} weight="regular" className="text-[#C8A27C] ms-1" />}
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
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-hairline bg-surface-2/70 hover:bg-surface-2 text-ink-subtle hover:text-ink text-xs font-medium transition-all cursor-pointer"
      >
        <Globe size={15} weight="light" className="text-ink-subtle" />
        <span className="font-mono text-[11px] tracking-wider font-semibold text-ink">{currentLang.code.toUpperCase()}</span>
        <CaretDown size={12} weight="light" className={`text-ink-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          id="language-dropdown-menu"
          className="absolute end-0 mt-2 w-48 rounded-xl bg-surface-1 border border-hairline shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-3 py-1.5 text-[11px] font-semibold text-ink-tertiary border-b border-hairline">
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
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/5 text-white font-semibold'
                      : 'text-ink-subtle hover:text-ink hover:bg-surface-2'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-ink-tertiary w-5 text-left">{lang.code.toUpperCase()}</span>
                    <div className="flex flex-col text-start">
                      <span className="leading-tight">{lang.nativeName}</span>
                      <span className="text-[10px] text-ink-tertiary">{lang.label}</span>
                    </div>
                  </div>
                  {isSelected && <Check size={14} weight="regular" className="text-[#C8A27C]" />}
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
