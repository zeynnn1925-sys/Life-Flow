import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useLanguage } from '../contexts/LanguageContext';

export const PWAInstallButton: React.FC<{ className?: string; variant?: 'button' | 'compact' | 'sidebar' }> = ({
  className = '',
  variant = 'button',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useLanguage();

  if (isInstalled) {
    return null;
  }

  const getLabel = () => {
    switch (language) {
      case 'id':
        return 'Pasang Aplikasi';
      case 'de':
        return 'App installieren';
      case 'ar':
        return 'تثبيت التطبيق';
      case 'en':
      default:
        return 'Install App';
    }
  };

  const getIOSLabel = () => {
    switch (language) {
      case 'id':
        return 'Pasang di iOS';
      case 'de':
        return 'Auf iOS installieren';
      case 'ar':
        return 'التثبيت على iOS';
      case 'en':
      default:
        return 'Install on iOS';
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  if (!isInstallable && !isIOS) {
    return null;
  }

  if (variant === 'sidebar') {
    return (
      <>
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center gap-3 px-3 py-2 text-caption font-semibold rounded-lg text-ink-secondary hover:text-accent hover:bg-accent/10 transition-all border border-hairline ${className}`}
          title={isIOS ? getIOSLabel() : getLabel()}
        >
          <Download className="w-4 h-4 text-accent shrink-0" />
          <span className="truncate">{isIOS ? getIOSLabel() : getLabel()}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-surface-1 border border-hairline p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-accent" />
                  <h3 className="text-body-md font-bold text-ink">
                    {language === 'id' ? 'Pasang di iPhone / iPad' : language === 'de' ? 'Auf iPhone / iPad installieren' : language === 'ar' ? 'التثبيت على iPhone / iPad' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button onClick={() => setShowIOSGuide(false)} className="text-ink-tertiary hover:text-ink">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="text-body-sm text-ink-secondary space-y-2 list-decimal list-inside">
                <li>
                  {language === 'id' ? (
                    <>Tekan tombol <strong>Bagikan (Share)</strong> di bilah Safari.</>
                  ) : language === 'de' ? (
                    <>Tippen Sie in der Safari-Symbolleiste auf <strong>Teilen</strong>.</>
                  ) : language === 'ar' ? (
                    <>اضغط على زر <strong>المشاركة (Share)</strong> في شريط Safari.</>
                  ) : (
                    <>Tap the <strong>Share</strong> button in the Safari toolbar.</>
                  )}
                </li>
                <li>
                  {language === 'id' ? (
                    <>Gulir ke bawah dan pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.</>
                  ) : language === 'de' ? (
                    <>Scrollen Sie nach unten und tippen Sie auf <strong>Zum Home-Bildschirm</strong>.</>
                  ) : language === 'ar' ? (
                    <>مرر لأسفل واضغط على <strong>إضافة إلى الشاشة الرئيسية</strong>.</>
                  ) : (
                    <>Scroll down and tap <strong>Add to Home Screen</strong>.</>
                  )}
                </li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-accent px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-accent/90 transition shadow-sm"
              >
                {language === 'id' ? 'Mengerti' : language === 'de' ? 'Verstanden' : language === 'ar' ? 'فهمت' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center gap-2 rounded-xl bg-accent/10 border border-accent/20 px-3 py-1.5 text-caption font-semibold text-accent hover:bg-accent/20 transition shadow-xs ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isIOS ? getIOSLabel() : getLabel()}</span>
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-surface-1 border border-hairline p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-accent" />
                <h3 className="text-body-md font-bold text-ink">
                  {language === 'id' ? 'Pasang di iPhone / iPad' : language === 'de' ? 'Auf iPhone / iPad installieren' : language === 'ar' ? 'التثبيت على iPhone / iPad' : 'Install on iPhone / iPad'}
                </h3>
              </div>
              <button onClick={() => setShowIOSGuide(false)} className="text-ink-tertiary hover:text-ink">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ol className="text-body-sm text-ink-secondary space-y-2 list-decimal list-inside">
              <li>
                {language === 'id' ? (
                  <>Tekan tombol <strong>Bagikan (Share)</strong> di Safari.</>
                ) : language === 'de' ? (
                  <>Tippen Sie auf <strong>Teilen</strong> in Safari.</>
                ) : language === 'ar' ? (
                  <>اضغط على زر <strong>المشاركة</strong> في Safari.</>
                ) : (
                  <>Tap <strong>Share</strong> in Safari.</>
                )}
              </li>
              <li>
                {language === 'id' ? (
                  <>Pilih <strong>Tambah ke Layar Utama</strong>.</>
                ) : language === 'de' ? (
                  <>Wählen Sie <strong>Zum Home-Bildschirm</strong>.</>
                ) : language === 'ar' ? (
                  <>اختر <strong>إضافة إلى الشاشة الرئيسية</strong>.</>
                ) : (
                  <>Select <strong>Add to Home Screen</strong>.</>
                )}
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-accent px-4 py-2.5 text-body-sm font-semibold text-white hover:bg-accent/90 transition shadow-sm"
            >
              {language === 'id' ? 'Tutup' : language === 'de' ? 'Schließen' : language === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
