import { useEffect, useRef, useState, useCallback } from 'react';
import { View } from '../types';

export interface ShortcutItem {
  id: string;
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'General';
  action: () => void;
}

interface UseGlobalKeyboardShortcutsOptions {
  activeView: View;
  setActiveView: (view: View) => void;
  onOpenCommandPalette?: () => void;
  onToggleCommandPalette?: () => void;
  onOpenShortcutsHelp?: () => void;
  enabled?: boolean;
}

export function useGlobalKeyboardShortcuts({
  activeView,
  setActiveView,
  onOpenCommandPalette,
  onToggleCommandPalette,
  onOpenShortcutsHelp,
  enabled = true
}: UseGlobalKeyboardShortcutsOptions) {
  const [lastSequenceKey, setLastSequenceKey] = useState<string | null>(null);
  const sequenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to check if event target is an interactive input
  const isInputElement = (element: EventTarget | null): boolean => {
    if (!element || !(element instanceof HTMLElement)) return false;
    const tagName = element.tagName.toLowerCase();
    const isContentEditable = element.isContentEditable;
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      isContentEditable
    );
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;

    const isInput = isInputElement(e.target);
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // ── 1. Cmd+K or Ctrl+K (Open Command Palette) ──
    // Should trigger even if inside an input to easily summon palette
    if ((cmdOrCtrl || e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      e.stopPropagation();
      if (onToggleCommandPalette) {
        onToggleCommandPalette();
      } else if (onOpenCommandPalette) {
        onOpenCommandPalette();
      }
      return;
    }

    // ── 2. Escape: Blur input if focused ──
    if (e.key === 'Escape' && isInput) {
      (e.target as HTMLElement).blur();
      return;
    }

    // Don't trigger navigation shortcuts if the user is typing inside an input/textarea
    if (isInput) return;

    // ── 3. Alt + Number (Direct Module Navigation) ──
    // Alt+1: Dashboard
    // Alt+2: Finance
    // Alt+3: Productivity / Schedule
    // Alt+4: AI Planner
    // Alt+5: Habits
    // Alt+6: Targets
    // Alt+7: Daily Journal
    // Alt+8: Settings
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      if (e.key === '1') {
        e.preventDefault();
        setActiveView('dashboard');
        return;
      }
      if (e.key === '2') {
        e.preventDefault();
        setActiveView('finance');
        return;
      }
      if (e.key === '3') {
        e.preventDefault();
        setActiveView('schedule');
        return;
      }
      if (e.key === '4') {
        e.preventDefault();
        setActiveView('ai_planner');
        return;
      }
      if (e.key === '5') {
        e.preventDefault();
        setActiveView('habits');
        return;
      }
      if (e.key === '6') {
        e.preventDefault();
        setActiveView('targets');
        return;
      }
      if (e.key === '7') {
        e.preventDefault();
        setActiveView('journal');
        return;
      }
      if (e.key === '8') {
        e.preventDefault();
        setActiveView('settings');
        return;
      }
    }

    // ── 4. Cmd/Ctrl + Shift + Key (Alternative standard combinations) ──
    if (cmdOrCtrl && e.shiftKey) {
      const key = e.key.toUpperCase();
      if (key === 'D') {
        e.preventDefault();
        setActiveView('dashboard');
        return;
      }
      if (key === 'F') {
        e.preventDefault();
        setActiveView('finance');
        return;
      }
      if (key === 'P') {
        e.preventDefault();
        setActiveView('schedule');
        return;
      }
      if (key === 'A') {
        e.preventDefault();
        setActiveView('ai_planner');
        return;
      }
      if (key === 'H') {
        e.preventDefault();
        setActiveView('habits');
        return;
      }
      if (key === 'T') {
        e.preventDefault();
        setActiveView('targets');
        return;
      }
    }

    // ── 5. Question mark (?) -> Show shortcuts cheat sheet ──
    if (e.key === '?' && !cmdOrCtrl && !e.altKey) {
      e.preventDefault();
      if (onOpenShortcutsHelp) {
        onOpenShortcutsHelp();
      }
      return;
    }

    // ── 6. Two-key chord sequences (g then d/f/p/a/h/t/j) ──
    if (!cmdOrCtrl && !e.altKey && !e.shiftKey) {
      if (e.key.toLowerCase() === 'g' && !lastSequenceKey) {
        setLastSequenceKey('g');
        if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = setTimeout(() => {
          setLastSequenceKey(null);
        }, 1200);
        return;
      }

      if (lastSequenceKey === 'g') {
        setLastSequenceKey(null);
        if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);

        const target = e.key.toLowerCase();
        if (target === 'd') {
          e.preventDefault();
          setActiveView('dashboard');
          return;
        }
        if (target === 'f') {
          e.preventDefault();
          setActiveView('finance');
          return;
        }
        if (target === 'p' || target === 's') {
          e.preventDefault();
          setActiveView('schedule');
          return;
        }
        if (target === 'a') {
          e.preventDefault();
          setActiveView('ai_planner');
          return;
        }
        if (target === 'h') {
          e.preventDefault();
          setActiveView('habits');
          return;
        }
        if (target === 't') {
          e.preventDefault();
          setActiveView('targets');
          return;
        }
        if (target === 'j') {
          e.preventDefault();
          setActiveView('journal');
          return;
        }
      }
    }
  }, [
    enabled,
    setActiveView,
    onOpenCommandPalette,
    onToggleCommandPalette,
    onOpenShortcutsHelp,
    lastSequenceKey
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimerRef.current) clearTimeout(sequenceTimerRef.current);
    };
  }, [handleKeyDown]);

  return {
    lastSequenceKey
  };
}
