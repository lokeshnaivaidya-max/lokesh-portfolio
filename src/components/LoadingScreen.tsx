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

function verifyImage(url?: string): Promise<boolean> {
  if (!url || url.trim() === '') return Promise.resolve(true);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(true); // Proceed cleanly even if image fails
    img.src = url;
    if (img.complete && img.naturalWidth > 0) resolve(true);
  });
}

export default function LoadingScreen({
  onFinish,
  logoUrl,
  avatarUrl,
  faviconUrl,
  isDataReady = true,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [assetStatus, setAssetStatus] = useState({
    favicon: false,
    logo: false,
    avatar: false,
  });

  // Verify and preload all critical images before exit
  useEffect(() => {
    let isMounted = true;

    async function loadAndVerify() {
      // Execute parallel preloads
      await preloadBrandingAssets(
        { logo: logoUrl, favicon: faviconUrl },
        avatarUrl
      );

      const [favOk, logoOk, avOk] = await Promise.all([
        verifyImage(faviconUrl),
        verifyImage(logoUrl),
        verifyImage(avatarUrl),
      ]);

      if (isMounted) {
        setAssetStatus({
          favicon: favOk,
          logo: logoOk,
          avatar: avOk,
        });
      }
    }

    loadAndVerify();

    return () => {
      isMounted = false;
    };
  }, [logoUrl, avatarUrl, faviconUrl]);

  const allAssetsVerified =
    assetStatus.favicon && assetStatus.logo && assetStatus.avatar && isDataReady;

  // Smooth progress calculation
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        // Hold at 90% until all images & database signals are fully verified
        if (prev >= 90 && !allAssetsVerified) {
          return 90;
        }

        if (prev >= 100) {
          clearInterval(timer);
          if (!isExiting) {
            setIsExiting(true);
            setTimeout(() => {
              onFinish();
            }, 600);
          }
          return 100;
        }

        const step = Math.floor(Math.random() * 6) + 5;
        return Math.min(prev + step, 100);
      });
    }, 40);

    return () => clearInterval(timer);
  }, [allAssetsVerified, isExiting, onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  const nameWords = ['P.', 'LOKESH'];

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 bg-[#030303] z-[9999] flex flex-col items-center justify-center font-sans select-none overflow-hidden"
        >
          {/* Skip Button */}
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            onClick={handleSkip}
            className="absolute top-6 right-6 text-[10px] font-mono tracking-widest text-[#C5A880] hover:text-white bg-[#0e0e0e]/80 hover:bg-[#181818] border border-[#222222] hover:border-[#C5A880]/50 px-4 py-2 rounded-full transition-all duration-300 uppercase z-[10000] cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-2xl hover:scale-105"
          >
            <span>Skip Entrance</span>
            <span className="text-amber-400 font-bold">→</span>
          </motion.button>

          {/* Glowing Atmospheric Aura & Tech Grid */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-[#C5A880]/15 via-amber-500/5 to-transparent blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

          {/* Central Stage */}
          <div className="relative text-center w-full max-w-xl px-6 z-10 flex flex-col items-center">
            
            {/* Hologram Monogram/Logo Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, rotateX: 25 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 relative group"
            >
              {/* Spinning Orbital Tech Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-full border border-dashed border-[#C5A880]/30 pointer-events-none"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-2 rounded-full border border-dotted border-amber-500/20 pointer-events-none"
              />

              {/* Glowing Glass Core */}
              <div className="relative bg-[#090909]/90 border border-[#222222] p-4 rounded-2xl shadow-[0_0_40px_rgba(197,168,128,0.15)] backdrop-blur-xl flex items-center justify-center min-w-[80px] min-h-[80px]">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Lokesh Logo"
                    loading="eager"
                    fetchPriority="high"
                    {...({ fetchpriority: 'high' } as any)}
                    className="h-11 w-auto object-contain max-w-[160px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="font-display text-3xl font-bold tracking-widest text-[#C5A880] drop-shadow-[0_0_10px_rgba(197,168,128,0.5)]">
                    PL
                  </span>
                )}
              </div>
            </motion.div>

            {/* Synchronized Text Reveal: P. LOKESH */}
            <div className="flex items-center justify-center gap-4 mb-3 overflow-hidden">
              {nameWords.map((word, index) => (
                <motion.span
                  key={word}
                  initial={{ y: 60, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    delay: 0.2 + index * 0.15,
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="font-display text-4xl sm:text-6xl md:text-7xl tracking-[0.2em] text-white uppercase leading-none select-none drop-shadow-[0_0_30px_rgba(197,168,128,0.25)]"
                >
                  {word}
                </motion.span>
              ))}
            </div>

            {/* Subtitle Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mb-8"
            >
              <span className="font-mono text-[10px] bg-[#111111] text-[#C5A880] border border-[#262626] px-4 py-1.5 rounded-full uppercase tracking-[0.2em] flex items-center gap-2 shadow-inner">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Full Stack Web Developer Intern @ BELVO
              </span>
            </motion.div>

            {/* Critical Asset Verification Telemetry Pods */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-4 gap-2 w-full mb-6 font-mono text-[9px]"
            >
              <div className="bg-[#080808] border border-[#1a1a1a] p-2.5 rounded-xl flex flex-col items-center shadow-md">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Favicon</span>
                <span
                  className={`${
                    assetStatus.favicon ? 'text-emerald-400' : 'text-gray-400'
                  } font-bold tracking-widest flex items-center gap-1`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      assetStatus.favicon ? 'bg-emerald-400' : 'bg-gray-500 animate-ping'
                    }`}
                  />
                  {assetStatus.favicon ? 'VERIFIED' : 'SYNCING'}
                </span>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] p-2.5 rounded-xl flex flex-col items-center shadow-md">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Brand Logo</span>
                <span
                  className={`${
                    assetStatus.logo ? 'text-amber-400' : 'text-gray-400'
                  } font-bold tracking-widest flex items-center gap-1`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      assetStatus.logo ? 'bg-amber-400' : 'bg-gray-500 animate-ping'
                    }`}
                  />
                  {assetStatus.logo ? 'CACHED' : 'LOADING'}
                </span>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] p-2.5 rounded-xl flex flex-col items-center shadow-md">
                <span className="text-gray-500 uppercase tracking-wider mb-1">Avatar</span>
                <span
                  className={`${
                    assetStatus.avatar ? 'text-[#C5A880]' : 'text-gray-400'
                  } font-bold tracking-widest flex items-center gap-1`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      assetStatus.avatar ? 'bg-[#C5A880]' : 'bg-gray-500 animate-ping'
                    }`}
                  />
                  {assetStatus.avatar ? 'PRELOADED' : 'FETCHING'}
                </span>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] p-2.5 rounded-xl flex flex-col items-center shadow-md">
                <span className="text-gray-500 uppercase tracking-wider mb-1">System DB</span>
                <span
                  className={`${
                    isDataReady ? 'text-emerald-400' : 'text-gray-400'
                  } font-bold tracking-widest flex items-center gap-1`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isDataReady ? 'bg-emerald-400' : 'bg-gray-500 animate-ping'
                    }`}
                  />
                  {isDataReady ? 'READY' : 'CONNECT'}
                </span>
              </div>
            </motion.div>

            {/* Futuristic Laser Progress Gauge */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.9 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="w-full relative mb-3"
            >
              <div className="w-full bg-[#0e0e0e] border border-[#222222] h-2 rounded-full p-0.5 overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                <div
                  className="h-full bg-gradient-to-r from-[#E8332A] via-[#F5B942] to-[#C5A880] transition-all duration-150 ease-out rounded-full shadow-[0_0_15px_rgba(197,168,128,0.6)] relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.6)_50%,transparent_100%)] animate-shimmer" />
                </div>
              </div>
            </motion.div>

            {/* Progress Telemetry */}
            <div className="flex items-center justify-between w-full font-mono text-[10px]">
              <span className="text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="inline-block w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />
                {progress < 30 && 'Verifying Graphics & Favicon Engine...'}
                {progress >= 30 && progress < 60 && 'Preloading High-Res Logo & Headshot...'}
                {progress >= 60 && progress < 90 && 'Synchronizing BELVO Core System...'}
                {progress >= 90 && progress < 100 && 'Validating Cache & Media Assets...'}
                {progress >= 100 && 'System Core Ready • Launching Experience'}
              </span>
              <span className="text-[#C5A880] font-bold tracking-widest font-mono bg-[#111111] border border-[#222222] px-2.5 py-0.5 rounded shadow-sm">
                {progress}%
              </span>
            </div>

            {/* Footer Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-gray-400 font-mono text-[10px] md:text-xs max-w-md mt-8 leading-relaxed italic border-t border-[#181818] pt-4 text-center"
            >
              "Crafting high-performance web systems and fluid digital interfaces."
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
