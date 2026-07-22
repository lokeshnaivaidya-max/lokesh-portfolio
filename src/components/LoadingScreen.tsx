import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { preloadBrandingAssets } from '../lib/supabase';

interface LoadingScreenProps {
  onFinish: () => void;
  logoUrl?: string;
  avatarUrl?: string;
  faviconUrl?: string;
  isDataReady?: boolean;
}

export default function LoadingScreen({
  onFinish,
  logoUrl,
  avatarUrl,
  faviconUrl,
  isDataReady = true,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isAssetsPreloaded, setIsAssetsPreloaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // 1. Preload all critical image assets (logo, avatar, favicon) into browser cache
  useEffect(() => {
    let isMounted = true;

    async function loadAssets() {
      try {
        await preloadBrandingAssets(
          { logo: logoUrl, favicon: faviconUrl },
          avatarUrl
        );
        if (isMounted) setIsAssetsPreloaded(true);
      } catch (e) {
        if (isMounted) setIsAssetsPreloaded(true);
      }
    }

    loadAssets();

    return () => {
      isMounted = false;
    };
  }, [logoUrl, avatarUrl, faviconUrl]);

  // 2. Smooth, realistic progress bar incrementing up to 100%
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        // Hold at 92% until DB & image preloading are both confirmed
        if (prev >= 92 && (!isDataReady || !isAssetsPreloaded)) {
          return 92;
        }

        if (prev >= 100) {
          clearInterval(timer);
          if (!isExiting) {
            setIsExiting(true);
            setTimeout(() => {
              onFinish();
            }, 500);
          }
          return 100;
        }

        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 45);

    return () => clearInterval(timer);
  }, [isDataReady, isAssetsPreloaded, isExiting, onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 bg-[#050505] z-[9999] flex flex-col items-center justify-center font-sans select-none overflow-hidden"
        >
          {/* Skip Button */}
          <button
            onClick={handleSkip}
            className="absolute top-6 right-6 text-xs font-mono tracking-widest text-[#C5A880] hover:text-white bg-[#111111]/80 hover:bg-[#1a1a1a] border border-[#222222] hover:border-[#C5A880]/50 px-4 py-2 rounded-full transition-all duration-300 uppercase z-[10000] cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-xl hover:scale-105"
          >
            <span>Skip Intro</span>
            <span className="text-amber-400 font-bold">→</span>
          </button>

          {/* Glowing Atmospheric Background Aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-radial from-[#C5A880]/15 via-amber-500/5 to-transparent blur-[120px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          {/* Central Container */}
          <div className="relative text-center w-full max-w-lg px-6 z-10 flex flex-col items-center">
            
            {/* Brand Logo Emblem */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6 relative group"
            >
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[#C5A880]/40 via-amber-500/30 to-[#C5A880]/40 rounded-2xl blur-md opacity-80 animate-pulse" />
              <div className="relative bg-[#0d0d0d] border border-[#262626] p-4 rounded-2xl shadow-2xl flex items-center justify-center min-w-[76px] min-h-[76px]">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Lokesh Logo"
                    loading="eager"
                    fetchPriority="high"
                    {...({ fetchpriority: 'high' } as any)}
                    className="h-10 w-auto object-contain max-w-[150px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="font-display text-2xl font-bold tracking-widest text-[#C5A880]">
                    PL
                  </div>
                )}
              </div>
            </motion.div>

            {/* Title */}
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              id="loading-title"
              className="font-display text-4xl md:text-6xl tracking-[0.2em] text-white leading-none uppercase mb-3 select-none drop-shadow-[0_0_25px_rgba(197,168,128,0.2)]"
            >
              P. LOKESH
            </motion.h2>

            {/* Developer Subtitle Badge */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-8"
            >
              <span className="font-mono text-[10px] bg-[#141414] text-[#C5A880] border border-[#2A2A2A] px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-inner">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Full Stack Web Developer Intern @ BELVO
              </span>
            </motion.div>

            {/* Live Telemetry Monitors */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-3 gap-2.5 w-full mb-6 font-mono text-[9px]"
            >
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 rounded-xl flex flex-col items-center shadow-sm">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Favicon</span>
                <span className="text-emerald-400 font-bold tracking-widest flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> ACTIVE
                </span>
              </div>
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 rounded-xl flex flex-col items-center shadow-sm">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Branding</span>
                <span className={`${isDataReady ? 'text-amber-400' : 'text-gray-400'} font-bold tracking-widest flex items-center gap-1`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isDataReady ? 'bg-amber-400' : 'bg-gray-400 animate-ping'}`} />
                  {isDataReady ? 'SYNCED' : 'FETCHING'}
                </span>
              </div>
              <div className="bg-[#0A0A0A] border border-[#1A1A1A] p-2.5 rounded-xl flex flex-col items-center shadow-sm">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Avatar Asset</span>
                <span className={`${isAssetsPreloaded ? 'text-[#C5A880]' : 'text-gray-400'} font-bold tracking-widest flex items-center gap-1`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isAssetsPreloaded ? 'bg-[#C5A880]' : 'bg-gray-400 animate-ping'}`} />
                  {isAssetsPreloaded ? 'PRELOADED' : 'CACHING'}
                </span>
              </div>
            </motion.div>

            {/* Sleek Progress Bar */}
            <div className="w-full bg-[#111111] border border-[#222222] h-2.5 rounded-full p-0.5 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.8)] mb-3">
              <div
                className="h-full bg-gradient-to-r from-[#E8332A] via-[#F5B942] to-[#C5A880] transition-all duration-200 ease-out rounded-full shadow-[0_0_12px_rgba(197,168,128,0.5)] relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.4)_50%,transparent_100%)] animate-shimmer" />
              </div>
            </div>

            {/* Progress Telemetry */}
            <div className="flex items-center justify-between w-full font-mono text-[10px]">
              <span className="text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                {progress < 25 && 'Initializing Graphics & Favicon Engine...'}
                {progress >= 25 && progress < 50 && 'Preloading High-Res Logo & Avatar...'}
                {progress >= 50 && progress < 75 && 'Connecting BELVO Developer Core...'}
                {progress >= 75 && progress < 95 && 'Hydrating Portfolio DB Records...'}
                {progress >= 95 && 'System Core Ready • Mounting Home Screen'}
              </span>
              <span className="text-[#C5A880] font-bold tracking-widest font-mono bg-[#141414] border border-[#222222] px-2.5 py-0.5 rounded shadow-sm">
                {progress}%
              </span>
            </div>

            {/* Quote */}
            <p className="text-gray-400 font-mono text-[10px] md:text-xs max-w-md mt-8 leading-relaxed italic border-t border-[#181818] pt-5 text-center">
              "Crafting high-performance web systems and fluid digital interfaces."
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
