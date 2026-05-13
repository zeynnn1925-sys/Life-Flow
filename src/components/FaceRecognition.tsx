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
      className="flex flex-col items-center justify-center p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex flex-col">
          <motion.h3 layout className="text-xl font-bold text-zinc-900 dark:text-white">
            {mode === 'register' ? t('registerFace') : t('faceLogin')}
          </motion.h3>
          <motion.p layout className="text-xs text-zinc-500 dark:text-zinc-400">
            {mode === 'register' ? 'Scan your face 5 times for better accuracy' : 'Look at the camera to sign in'}
          </motion.p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      <div className="relative w-full aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-2xl overflow-hidden mb-6 border-2 border-zinc-200 dark:border-zinc-700">
        <AnimatePresence>
          {(!isModelLoaded || !isVideoReady) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-zinc-100 dark:bg-zinc-800 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
              />
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
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
        
        {/* Face Overlay Mask */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute inset-0 bg-black/40" style={{
            maskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 35%, black 35%)'
          }} />
          <motion.div 
            animate={{ 
              scale: [1, 1.02, 1],
              borderColor: status === 'scanning' ? ['rgba(255,255,255,0.5)', 'rgba(59,130,246,0.8)', 'rgba(255,255,255,0.5)'] : 'rgba(255,255,255,0.5)'
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] border-2 border-dashed rounded-full" 
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
              {/* Scanning Circular Progress */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-blue-500/20"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="35%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray="220"
                  animate={{ strokeDashoffset: 220 - (220 * progress) / 100 }}
                  transition={{ type: "spring", stiffness: 50, damping: 20 }}
                  className="text-blue-500"
                />
              </svg>

              {/* Scanning Line */}
              <motion.div 
                animate={{ top: ['30%', '70%', '30%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-[15%] right-[15%] h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 backdrop-blur-[2px] z-30"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="bg-white dark:bg-zinc-900 p-4 rounded-full shadow-xl"
              >
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-full space-y-4">
        <AnimatePresence mode="wait">
          {status === 'scanning' && (
            <motion.div 
              key="scanning-status"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse">
                {mode === 'register' ? `Capturing Sample ${Math.ceil(progress/20) || 1}/5` : t('scanningFace')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
              className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">Error</p>
                <p className="text-xs text-rose-500 dark:text-rose-400/80">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          {status === 'idle' && isModelLoaded && (
            <motion.p 
              key="idle-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-zinc-500 dark:text-zinc-400"
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
            className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};
