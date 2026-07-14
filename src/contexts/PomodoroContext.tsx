import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useData } from './DataContext';
import { useLanguage } from './LanguageContext';

// Simple Sound Generation Engine using Web Audio API (procedural audio)
class SoundGenerator {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private biquadFilter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private volumeValue: number = 0.25;

  start(preset: string) {
    this.stop();
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      this.ctx = new AudioContextClass();
      this.mainGain = this.ctx.createGain();
      this.mainGain.gain.setValueAtTime(this.volumeValue, this.ctx.currentTime);
      this.mainGain.connect(this.ctx.destination);

      this.biquadFilter = this.ctx.createBiquadFilter();
      this.biquadFilter.type = 'lowpass';
      this.biquadFilter.frequency.setValueAtTime(350, this.ctx.currentTime);
      this.biquadFilter.connect(this.mainGain);

      if (preset === 'zen') {
        // Binaural Beats: Base of 110Hz left and 114Hz right, plus warm ambient notes
        const oscL = this.ctx.createOscillator();
        const oscR = this.ctx.createOscillator();
        const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
        const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(110, this.ctx.currentTime);
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(114, this.ctx.currentTime);

        if (pannerL && pannerR) {
          pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);
          pannerR.pan.setValueAtTime(1, this.ctx.currentTime);
          oscL.connect(pannerL).connect(this.biquadFilter);
          oscR.connect(pannerR).connect(this.biquadFilter);
        } else {
          oscL.connect(this.biquadFilter);
          oscR.connect(this.biquadFilter);
        }
        oscL.start();
        oscR.start();
        this.oscillators.push(oscL, oscR);

        // Low warm drone pad
        const oscPad = this.ctx.createOscillator();
        oscPad.type = 'triangle';
        oscPad.frequency.setValueAtTime(55, this.ctx.currentTime);
        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        oscPad.connect(padGain).connect(this.biquadFilter);
        oscPad.start();
        this.oscillators.push(oscPad);

      } else if (preset === 'space') {
        const chord = [130.81, 196.00, 261.63, 311.13]; // Cm/C5 space chord
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

          // Space LFO modulation
          const lfo = this.ctx!.createOscillator();
          lfo.frequency.setValueAtTime(0.15 + idx * 0.05, this.ctx!.currentTime);
          const lfoGain = this.ctx!.createGain();
          lfoGain.gain.setValueAtTime(2.0, this.ctx!.currentTime);
          lfo.connect(lfoGain).connect(osc.frequency);
          lfo.start();
          this.oscillators.push(lfo);

          const gainNode = this.ctx!.createGain();
          gainNode.gain.setValueAtTime(0.1, this.ctx!.currentTime);
          osc.connect(gainNode).connect(this.biquadFilter!);
          osc.start();
          this.oscillators.push(osc);
        });
      } else if (preset === 'rain' || preset === 'waves') {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        this.biquadFilter.frequency.setValueAtTime(preset === 'rain' ? 300 : 180, this.ctx.currentTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(preset === 'rain' ? 0.4 : 0.6, this.ctx.currentTime);

        if (preset === 'waves') {
          // Slow organic swell of sea waves
          const waveLfo = this.ctx.createOscillator();
          waveLfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10 second wave swell
          const waveLfoGain = this.ctx.createGain();
          waveLfoGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
          waveLfo.connect(waveLfoGain).connect(noiseGain.gain);
          waveLfo.start();
          this.oscillators.push(waveLfo);
        }

        noise.connect(noiseGain).connect(this.biquadFilter);
        noise.start();
        this.noiseSource = noise;
      }
    } catch (e) {
      console.warn("Audio Context initialization failed or forbidden inside sandbox iframe", e);
    }
  }

  stop() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch(e) {}
    });
    this.oscillators = [];
    if (this.noiseSource) {
      try { this.noiseSource.stop(); } catch(e) {}
      this.noiseSource = null;
    }
    if (this.ctx) {
      try { this.ctx.close(); } catch(e) {}
      this.ctx = null;
    }
  }

  setVolume(volume: number) {
    this.volumeValue = volume;
    if (this.mainGain && this.ctx) {
      this.mainGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }
}

export interface PomodoroContextType {
  pomoMinutes: number;
  setPomoMinutes: React.Dispatch<React.SetStateAction<number>>;
  pomoSeconds: number;
  setPomoSeconds: React.Dispatch<React.SetStateAction<number>>;
  pomoActive: boolean;
  setPomoActive: (active: boolean) => void;
  pomoMode: 'focus' | 'short_break' | 'long_break';
  setPomoMode: (mode: 'focus' | 'short_break' | 'long_break') => void;
  selectedTaskId: string;
  setSelectedTaskId: (id: string) => void;
  breathingText: 'Inhale' | 'Hold' | 'Exhale' | 'Pause';
  breathingPhase: number;
  isPlayingNoise: boolean;
  setIsPlayingNoise: (isPlaying: boolean) => void;
  noisePreset: string;
  volume: number;
  handleNoisePlayToggle: (presetName: string) => void;
  setVolume: (vol: number) => void;
  isFloating: boolean;
  setIsFloating: (floating: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  resetTimer: () => void;
  selectPomoMode: (mode: 'focus' | 'short_break' | 'long_break') => void;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  const { tasks, saveTask } = useData();
  const isId = language === 'id';

  // State
  const [pomoMinutes, setPomoMinutes] = useState(25);
  const [pomoSeconds, setPomoSeconds] = useState(0);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState<'focus' | 'short_break' | 'long_break'>('focus');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [breathingText, setBreathingText] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [breathingPhase, setBreathingPhase] = useState(0);

  // Audio State
  const [isPlayingNoise, setIsPlayingNoise] = useState(false);
  const [noisePreset, setNoisePreset] = useState('zen');
  const [volume, setVolume] = useState(0.25);
  const audioEngine = useRef<SoundGenerator | null>(null);

  // Floating & Minimized UI state
  const [isFloating, setIsFloating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    audioEngine.current = new SoundGenerator();
    return () => {
      if (audioEngine.current) {
        audioEngine.current.stop();
      }
    };
  }, []);

  const handleNoisePlayToggle = (presetName: string) => {
    if (!audioEngine.current) return;
    if (isPlayingNoise && noisePreset === presetName) {
      audioEngine.current.stop();
      setIsPlayingNoise(false);
    } else {
      setNoisePreset(presetName);
      audioEngine.current.start(presetName);
      audioEngine.current.setVolume(volume);
      setIsPlayingNoise(true);
    }
  };

  const changeVolume = (vol: number) => {
    setVolume(vol);
    if (audioEngine.current) {
      audioEngine.current.setVolume(vol);
    }
  };

  // Breathing Box Cycle (4s box breathing)
  useEffect(() => {
    if (!pomoActive) return;
    const interval = setInterval(() => {
      setBreathingPhase(prev => {
        const next = (prev + 1) % 4;
        const texts: Record<number, 'Inhale' | 'Hold' | 'Exhale' | 'Pause'> = {
          0: 'Inhale',
          1: 'Hold',
          2: 'Exhale',
          3: 'Pause'
        };
        setBreathingText(texts[next]);
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [pomoActive]);

  // Pomodoro Ticking Core
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pomoActive) {
      timer = setInterval(() => {
        if (pomoSeconds > 0) {
          setPomoSeconds(pomoSeconds - 1);
        } else if (pomoMinutes > 0) {
          setPomoMinutes(pomoMinutes - 1);
          setPomoSeconds(59);
        } else {
          // Timer finished!
          setPomoActive(false);
          setIsFloating(false); // standard restore
          
          try {
            const alertChime = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = alertChime.createOscillator();
            const gainNode = alertChime.createGain();
            osc.connect(gainNode).connect(alertChime.destination);
            osc.frequency.setValueAtTime(880, alertChime.currentTime);
            gainNode.gain.setValueAtTime(0.2, alertChime.currentTime);
            osc.start();
            osc.stop(alertChime.currentTime + 0.35);
          } catch (e) {
            console.warn("Chime fallback error:", e);
          }

          // Automatically complete linked task if selected!
          if (selectedTaskId) {
            const task = tasks.find(t => t.id === selectedTaskId);
            if (task) {
              saveTask({ ...task, completed: true });
            }
          }
          alert(isId ? "Waktu sesi fokus selesai! Sempurna!" : "Focus session completed! Outstanding performance!");
          resetTimer();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoMinutes, pomoSeconds, selectedTaskId, tasks, isId]);

  const resetTimer = () => {
    setPomoActive(false);
    if (pomoMode === 'focus') setPomoMinutes(25);
    else if (pomoMode === 'short_break') setPomoMinutes(5);
    else setPomoMinutes(15);
    setPomoSeconds(0);
  };

  const selectPomoMode = (mode: 'focus' | 'short_break' | 'long_break') => {
    setPomoMode(mode);
    setPomoActive(false);
    if (mode === 'focus') setPomoMinutes(25);
    else if (mode === 'short_break') setPomoMinutes(5);
    else setPomoMinutes(15);
    setPomoSeconds(0);
  };

  return (
    <PomodoroContext.Provider value={{
      pomoMinutes,
      setPomoMinutes,
      pomoSeconds,
      setPomoSeconds,
      pomoActive,
      setPomoActive,
      pomoMode,
      setPomoMode,
      selectedTaskId,
      setSelectedTaskId,
      breathingText,
      breathingPhase,
      isPlayingNoise,
      setIsPlayingNoise,
      noisePreset,
      volume,
      handleNoisePlayToggle,
      setVolume: changeVolume,
      isFloating,
      setIsFloating,
      isMinimized,
      setIsMinimized,
      resetTimer,
      selectPomoMode
    }}>
      {children}
    </PomodoroContext.Provider>
  );
};

export const usePomodoro = () => {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
};
