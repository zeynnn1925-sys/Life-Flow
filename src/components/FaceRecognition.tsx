import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, X, CheckCircle2, AlertCircle, Scan } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface FaceRecognitionProps {
  onSuccess: () => void;
  onCancel: () => void;
  mode: 'login' | 'register';
}

export const FaceRecognition: React.FC<FaceRecognitionProps> = ({ onSuccess, onCancel, mode }) => {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus('idle');
        // SSD Mobilenet V1 is more accurate than Tiny Face Detector
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelLoaded(true);
      } catch (err) {
        console.error('Error loading models:', err);
        setErrorMessage('Failed to load face recognition models.');
        setStatus('error');
      }
    };
    loadModels();
  }, []);

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setErrorMessage(t('cameraPermissionDenied'));
      setStatus('error');
    }
  };

  const handleVideoPlay = () => {
    setIsVideoReady(true);
    if (!isScanning && isModelLoaded) {
      setIsScanning(true);
      scanFace();
    }
  };

  const scanFace = async () => {
    if (!videoRef.current) return;

    setStatus('scanning');
    setProgress(0);
    
    const descriptors: Float32Array[] = [];
    const requiredSamples = mode === 'register' ? 5 : 1;

    const interval = setInterval(async () => {
      if (!videoRef.current || status === 'success' || status === 'error') {
        clearInterval(interval);
        return;
      }
      
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        descriptors.push(detections.descriptor);
        const currentProgress = Math.round((descriptors.length / requiredSamples) * 100);
        setProgress(currentProgress);
        
        if (descriptors.length >= requiredSamples) {
          clearInterval(interval);
          handleRecognition(descriptors);
        }
      }
    }, 200);
  };

  const handleRecognition = (descriptors: Float32Array[]) => {
    if (mode === 'register') {
      // Average the descriptors for a more robust profile
      const avgDescriptor = new Float32Array(128);
      for (let i = 0; i < 128; i++) {
        let sum = 0;
        for (const d of descriptors) {
          sum += d[i];
        }
        avgDescriptor[i] = sum / descriptors.length;
      }

      const descriptorArray = Array.from(avgDescriptor);
      localStorage.setItem('userFaceDescriptor', JSON.stringify(descriptorArray));
      setStatus('success');
      setTimeout(() => onSuccess(), 1500);
    } else {
      const descriptor = descriptors[0];
      const savedDescriptorJson = localStorage.getItem('userFaceDescriptor');
      if (!savedDescriptorJson) {
        setErrorMessage('No face registered. Please register first.');
        setStatus('error');
        return;
      }

      const savedDescriptor = new Float32Array(JSON.parse(savedDescriptorJson));
      const distance = faceapi.euclideanDistance(descriptor, savedDescriptor);

      // 0.45 is a good balance for SSD Mobilenet V1
      if (distance < 0.45) {
        setStatus('success');
        setTimeout(() => onSuccess(), 1000);
      } else {
        setErrorMessage(t('faceMatchFailed'));
        setStatus('error');
        setIsScanning(false);
      }
    }
  };

  useEffect(() => {
    if (isModelLoaded) {
      startVideo();
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded]);

  return (
    <motion.div 
      layout
      className="flex flex-col items-center justify-center p-8 bg-surface-1 rounded-xxl shadow-modal border border-hairline-strong w-full max-w-md mx-auto relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
      
      <div className="flex items-center justify-between w-full mb-8 relative z-10">
        <div className="flex flex-col">
          <motion.h3 layout className="text-heading-sm font-black text-ink uppercase tracking-tight">
            {mode === 'register' ? t('registerFace') : t('faceLogin')}
          </motion.h3>
          <motion.p layout className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest mt-1 opacity-70">
            {mode === 'register' ? 'Scan your face 5 times for better accuracy' : 'Look at the camera to sign in'}
          </motion.p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2.5 hover:bg-surface-2 text-ink-tertiary hover:text-ink rounded-pill transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="relative w-full aspect-square bg-surface-2 rounded-xl overflow-hidden mb-8 border border-hairline shadow-inner group">
        <AnimatePresence>
          {(!isModelLoaded || !isVideoReady) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20 bg-surface-2/80 backdrop-blur-md"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-pill"
              />
              <p className="text-eyebrow font-black text-ink-tertiary uppercase tracking-widest">
                {!isModelLoaded ? 'Loading AI models...' : 'Starting camera...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.video
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoReady ? 1 : 0 }}
          ref={videoRef}
          autoPlay
          muted
          onPlay={handleVideoPlay}
          className="w-full h-full object-cover scale-x-[-1]"
        />
        
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-canvas/40" style={{
            maskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)'
          }} />
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
              borderColor: status === 'scanning' ? ['rgba(var(--color-accent),0.3)', 'rgba(var(--color-accent),1)', 'rgba(var(--color-accent),0.3)'] : 'var(--color-hairline-strong)'
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-dashed rounded-full shadow-glow-accent/20" 
          />
        </div>

        <AnimatePresence>
          {status === 'scanning' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none z-20"
            >
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeOpacity="0.1"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="4"
                  strokeDasharray="220"
                  animate={{ strokeDashoffset: 220 - (220 * progress) / 100 }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="shadow-glow-accent"
                />
              </svg>

              <motion.div 
                animate={{ top: ['30%', '70%', '30%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[15%] right-[15%] h-0.5 bg-accent shadow-glow-accent"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-success/20 backdrop-blur-[2px] z-30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-surface-1 p-6 rounded-full shadow-modal border border-success/30"
              >
                <CheckCircle2 className="w-14 h-14 text-success" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full space-y-6 relative z-10">
        <AnimatePresence mode="wait">
          {status === 'scanning' && (
            <motion.div 
              key="scanning-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className="text-body-sm font-black text-accent uppercase tracking-widest animate-pulse">
                {mode === 'register' ? `Capturing Sample ${Math.ceil(progress/20) || 1}/5` : t('scanningFace')}
              </p>
              <p className="text-eyebrow font-bold text-ink-tertiary uppercase tracking-tighter mt-1 opacity-60">
                Keep your face still and centered
              </p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div 
              key="error-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-5 bg-danger/10 border border-danger/20 rounded-xl flex items-start gap-4 shadow-sm"
            >
              <AlertCircle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-body-sm font-black text-danger uppercase tracking-tight">Error</p>
                <p className="text-eyebrow font-bold text-danger/80 uppercase tracking-widest leading-relaxed">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {status === 'idle' && isModelLoaded && (
            <motion.p 
              key="idle-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-body-sm font-medium text-ink-tertiary italic"
            >
              Position your face in the center of the frame to begin.
            </motion.p>
          )}
        </AnimatePresence>

        {status === 'error' && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => {
              setErrorMessage(null);
              setStatus('idle');
              startVideo();
            }}
            className="w-full h-14 bg-surface-2 hover:bg-surface-3 text-ink font-black text-button uppercase tracking-widest rounded-pill border border-hairline transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
