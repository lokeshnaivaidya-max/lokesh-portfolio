import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  fetchProjects, fetchExperiences, fetchResumeUrl, fetchMetadata, applyMetadata, 
  fetchTechStack, fetchEducation, fetchCertifications, fetchAvatarUrl, 
  getCachedMetadata, getCachedAvatarUrl, preloadBrandingAssets 
} from '../lib/supabase';
import { Project, Experience, TechStack, Education, Certification } from '../types';
import TechIcon from './TechIcon';
import { useBranding } from './BrandingProvider';
import LoadingScreen from './LoadingScreen';
import { 
  Compass, ArrowRight, Mail, Phone, Github, 
  Linkedin, Award, Flame, Star, Sparkles,
  Sun, Moon, Download, GraduationCap, Building, MapPin, Calendar
} from 'lucide-react';

function SmartImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  fallback
}: {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  fallback?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  if (!src || error) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div className={`relative overflow-hidden ${containerClassName}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-neutral-800/60 rounded animate-pulse z-10" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        {...({ fetchpriority: fetchPriority } as any)}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function BrandHeaderLogo({ logoUrl }: { logoUrl: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logoUrl) {
      setError(false);
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setLoaded(true);
      }
    }
  }, [logoUrl]);

  return (
    <div id="brand-header" className="fixed top-6 left-6 z-50 pointer-events-auto flex items-center h-10 min-w-[100px]">
      {logoUrl && !error ? (
        <div className="relative h-10 flex items-center">
          {!loaded && (
            <div className="h-10 w-28 bg-neutral-800/60 rounded animate-pulse absolute inset-0" />
          )}
          <img
            ref={imgRef}
            src={logoUrl}
            alt="Lokesh Logo"
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`h-10 object-contain rounded transition-opacity duration-300 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <span className="font-display text-2xl uppercase tracking-widest text-[#C5A880]">
          LOKESH
        </span>
      )}
    </div>
  );
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800';

function HeroProfileAvatar({ avatarUrl }: { avatarUrl: string }) {
  const displayUrl = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : DEFAULT_AVATAR;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (displayUrl) {
      setError(false);
      if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
        setLoaded(true);
      }
    }
  }, [displayUrl]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-neutral-900 z-10 bg-neutral-950">
      {!error ? (
        <div className="relative w-full h-full group overflow-hidden">
          {!loaded && (
            <div className="absolute inset-0 bg-neutral-900/80 animate-pulse z-10" />
          )}
          <img
            ref={imgRef}
            src={displayUrl}
            alt="P. Lokesh"
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-all duration-500 scale-100 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/10 to-transparent opacity-80" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20">
            <div className="flex flex-col">
              <span className="font-display text-lg text-white tracking-widest uppercase">P. Lokesh</span>
              <span className="font-mono text-[9px] text-[#C5A880] uppercase tracking-widest">Active Node</span>
            </div>
            <span className="font-mono text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-neutral-950 via-[#111] to-neutral-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.12),transparent_70%)]" />
          <div className="w-20 h-20 rounded-full border border-dashed border-[#C5A880]/40 flex items-center justify-center animate-spin-slow mb-4 shadow-[0_0_15px_rgba(197,168,128,0.1)]">
            <Sparkles className="w-8 h-8 text-[#C5A880] animate-pulse" />
          </div>
          <span className="font-mono text-[9px] text-[#C5A880] uppercase tracking-widest bg-[#C5A880]/10 px-3 py-1.5 rounded border border-[#C5A880]/20 mb-3">
            Aesthetic Core
          </span>
        </div>
      )}
    </div>
  );
}

export default function MainPortfolio() {
  const navigate = useNavigate();

  const brandingContext = useBranding();
  const initialMeta = getCachedMetadata();
  const initialAvatar = getCachedAvatarUrl();

  // Dynamic Portfolio Database Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [techStack, setTechStack] = useState<TechStack[]>([]);
  const [educationList, setEducationList] = useState<Education[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [resumeUrl, setResumeUrl] = useState('#');
  const [avatarUrl, setAvatarUrl] = useState<string>(brandingContext.avatarUrl || initialAvatar);
  const [logoUrl, setLogoUrl] = useState<string>(brandingContext.logoUrl || initialMeta.logo);
  const [isBrandingReady, setIsBrandingReady] = useState<boolean>(brandingContext.isBrandingReady || false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);

  useEffect(() => {
    if (brandingContext.logoUrl) setLogoUrl(brandingContext.logoUrl);
    if (brandingContext.avatarUrl) setAvatarUrl(brandingContext.avatarUrl);
    if (brandingContext.isBrandingReady) setIsBrandingReady(true);
  }, [brandingContext]);

  const handleResumeClick = (e: React.MouseEvent) => {
    if (!resumeUrl || resumeUrl === '#' || resumeUrl.trim() === '') {
      e.preventDefault();
      setIsResumeModalOpen(true);
    }
  };

  // Page load and loading screen
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Interactive Scroll State
  const [scrollProgress, setScrollProgress] = useState(0);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Real-time Operating System Clock for interactive footer
  const [timeStr, setTimeStr] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Selected category filter for Tech Stack
  const [activeStackCategory, setActiveStackCategory] = useState<string>('all');

  // Tech Stack rows grouped for 3 distinct infinite marquees
  const techRowFrontend = techStack.filter(t => t.category === 'frontend' || t.category === 'libraries');
  const techRowBackend = techStack.filter(t => t.category === 'backend' || t.category === 'database' || t.category === 'ai');
  const techRowTools = techStack.filter(t => t.category === 'tools' || t.category === 'deployment' || t.category === 'coreskills' || !t.category);
  const defaultRow = techStack.length > 0 ? techStack : [];
  const techRow1 = techRowFrontend.length > 0 ? techRowFrontend : defaultRow;
  const techRow2 = techRowBackend.length > 0 ? techRowBackend : defaultRow;
  const techRow3 = techRowTools.length > 0 ? techRowTools : defaultRow;

  // 1. Loading Screen Progression
  useEffect(() => {
    const timeoutTimer = setTimeout(() => {
      setIsBrandingReady(true);
    }, 2000);

    const hasLoaded = sessionStorage.getItem('lokesh_portfolio_loaded');
    if (hasLoaded === 'true' && isBrandingReady) {
      setLoading(false);
      clearTimeout(timeoutTimer);
      return;
    }

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 90 && !isBrandingReady) {
          return 90;
        }
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setLoading(false);
            sessionStorage.setItem('lokesh_portfolio_loaded', 'true');
          }, 300);
          return 100;
        }
        const step = Math.floor(Math.random() * 8) + 4;
        return Math.min(prev + step, 100);
      });
    }, 50);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutTimer);
    };
  }, [isBrandingReady]);

  // 2. Load DB Content
  useEffect(() => {
    async function loadPortfolioData() {
      try {
        const metadataPromise = fetchMetadata().catch(err => {
          console.warn('Metadata fetch failed:', err);
          return initialMeta;
        });
        const avatarPromise = fetchAvatarUrl().catch(err => {
          console.warn('Avatar fetch failed:', err);
          return initialAvatar;
        });

        const projsPromise = fetchProjects().catch(err => []);
        const expsPromise = fetchExperiences().catch(err => []);
        const resumePromise = fetchResumeUrl().catch(err => '#');
        const techPromise = fetchTechStack().catch(err => []);
        const eduPromise = fetchEducation().catch(err => []);
        const certsPromise = fetchCertifications().catch(err => []);

        const [metadata, avatar] = await Promise.all([metadataPromise, avatarPromise]);

        if (metadata) {
          setLogoUrl(metadata.logo || '');
          applyMetadata(metadata.logo, metadata.favicon, metadata.opengraph);
        }
        if (avatar) {
          setAvatarUrl(avatar);
        }

        // Preload branding images concurrently before unlocking loading screen
        await preloadBrandingAssets(
          { logo: metadata?.logo, favicon: metadata?.favicon },
          avatar
        ).catch(() => {});

        setIsBrandingReady(true);

        const [projs, exps, resume, tech, edu, certs] = await Promise.all([
          projsPromise, expsPromise, resumePromise, techPromise, eduPromise, certsPromise
        ]);

        const overriddenProjects = projs.map(p => ({
          ...p,
          github_url: 'https://github.com/lokeshnaivaidya-max'
        }));

        const belvoIntern: Experience = {
          id: 'belvo-intern',
          role: 'Full Stack Web Developer Intern',
          company: 'BELVO',
          duration: '2026 – Present',
          location: 'Remote',
          details: [
            'Working on premium full-stack web applications, backend APIs, CMS development, dashboard systems, cloud deployment, modern UI/UX, responsive interfaces, authentication, and scalable software solutions.'
          ]
        };

        const mergedExps = [...exps];
        const alreadyHasBelvo = exps.some(e => e.company.toLowerCase().includes('belvo'));
        if (!alreadyHasBelvo) {
          mergedExps.unshift(belvoIntern);
        }

        setProjects(overriddenProjects);
        setExperiences(mergedExps);
        setResumeUrl(resume);
        setTechStack(tech);
        setEducationList(edu);
        setCertifications(certs);
      } catch (err) {
        console.error('Data hydration error:', err);
        setIsBrandingReady(true);
      }
    }
    loadPortfolioData();
  }, []);

  // 3. Scroll Tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = containerRef.current.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? scrollTop / docHeight : 0;
      setScrollProgress(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Quick navigation scroller
  const scrollToPercent = (pct: number) => {
    if (!containerRef.current) return;
    const docHeight = containerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({
      top: docHeight * pct,
      behavior: 'smooth'
    });
  };

  // Skip loader function
  const skipLoader = () => {
    setLoading(false);
    sessionStorage.setItem('lokesh_portfolio_loaded', 'true');
  };

  // Sync theme with document body class
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  // Procedural Cinematic Background Smoke & 3D Celestial Constellation Engine (z-0: Slow-moving fog and interactive 3D stars)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);

  interface SmokeBlob {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
    phaseX: number;
    phaseY: number;
    driftSpeed: number;
    amplitude: number;
  }

  interface CosmicStar {
    x: number;
    y: number;
    z: number;
    size: number;
    speed: number;
    opacity: number;
    color: string;
  }

  useEffect(() => {
    if (loading) return;
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let lastTime = Date.now();
    let lastScrollTopVal = window.scrollY;

    // Interactive mouse positioning
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    let curMouseX = -1000;
    let curMouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initializing Smoke Blobs
    const blobs: SmokeBlob[] = [];
    const numBlobs = 8;
    const width = window.innerWidth;
    const height = window.innerHeight;

    for (let i = 0; i < numBlobs; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        radius: Math.random() * 200 + 200,
        opacity: Math.random() * 0.08 + 0.04,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        driftSpeed: Math.random() * 0.15 + 0.08,
        amplitude: Math.random() * 6 + 3,
      });
    }

    // Initializing 3D Stars
    const stars: CosmicStar[] = [];
    const numStars = 65;
    const focalLength = 320;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1500,
        y: (Math.random() - 0.5) * 1500,
        z: Math.random() * 1000 - 500,
        size: Math.random() * 1.6 + 0.6,
        speed: Math.random() * 0.12 + 0.04,
        opacity: Math.random() * 0.45 + 0.15,
        color: Math.random() > 0.45 ? '#FBBF24' : '#FF3D33' // Gold and red theme matching branding
      });
    }

    const updateAndDraw = () => {
      const now = Date.now();
      const dt = Math.min(100, now - lastTime) / 1000;
      lastTime = now;

      const currentScrollTop = window.scrollY;
      const scrollDiff = currentScrollTop - lastScrollTopVal;
      lastScrollTopVal = currentScrollTop;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;
      }

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      // Interpolate mouse coordinates smoothly for dynamic ease
      if (curMouseX < -500) {
        curMouseX = targetMouseX;
        curMouseY = targetMouseY;
      } else {
        curMouseX += (targetMouseX - curMouseX) * 0.08;
        curMouseY += (targetMouseY - curMouseY) * 0.08;
      }

      // 1. Draw elegant background canvas base gradient
      if (theme === 'light') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#F8F9FA');
        bgGrad.addColorStop(0.5, '#F1F3F5');
        bgGrad.addColorStop(1, '#E9ECEF');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#030303');
        bgGrad.addColorStop(0.5, '#08080C');
        bgGrad.addColorStop(1, '#0F0F14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Warm solar gold center glow (pulse effect in background)
        const glowX = w * 0.5;
        const glowY = h * 0.5;
        const glowRad = Math.max(w, h) * 0.9;
        const radialGlow = ctx.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRad);
        radialGlow.addColorStop(0, 'rgba(251, 191, 36, 0.015)');
        radialGlow.addColorStop(0.5, 'rgba(255, 61, 51, 0.006)');
        radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radialGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Render Interactive cursor spotlight behind content (Removed per user request)

      // 3. Render 3D Constellation Stars with Parallax Perspective
      const rotXSpeed = 0.0001 + (curMouseY - h / 2) * 0.0000004;
      const rotYSpeed = 0.00025 + (curMouseX - w / 2) * 0.0000004;

      const projectedStars = stars.map(star => {
        // Rotate in 3D around Y axis (yaw)
        const cosY = Math.cos(rotYSpeed);
        const sinY = Math.sin(rotYSpeed);
        const x1 = star.x * cosY - star.z * sinY;
        const z1 = star.z * cosY + star.x * sinY;

        // Rotate in 3D around X axis (pitch)
        const cosX = Math.cos(rotXSpeed);
        const sinX = Math.sin(rotXSpeed);
        const y2 = star.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + star.y * sinX;

        star.x = x1;
        star.y = y2;
        star.z = z2;

        // Drifting movement forward in depth
        star.z -= star.speed * 45 * dt;
        if (star.z < -focalLength) {
          star.z = 500; // Recycles back to the distance
        }

        const scale = focalLength / (focalLength + star.z);
        return {
          x: w / 2 + star.x * scale,
          y: h / 2 + star.y * scale,
          z: star.z,
          size: star.size * scale,
          color: star.color,
          opacity: star.opacity * (1 - (star.z + 500) / 1000) * (theme === 'dark' ? 1 : 0.6)
        };
      });

      // Draw constellation lines between projected 3D space points
      ctx.strokeStyle = theme === 'dark' ? 'rgba(251, 191, 36, 0.06)' : 'rgba(220, 38, 38, 0.05)';
      ctx.lineWidth = 0.65;
      for (let i = 0; i < projectedStars.length; i++) {
        const p1 = projectedStars[i];
        if (p1.z + focalLength <= 0 || p1.x < 0 || p1.x > w || p1.y < 0 || p1.y > h) continue;

        for (let j = i + 1; j < projectedStars.length; j++) {
          const p2 = projectedStars[j];
          if (p2.z + focalLength <= 0 || p2.x < 0 || p2.x > w || p2.y < 0 || p2.y > h) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            ctx.globalAlpha = (1 - dist / 115) * 0.15 * Math.min(p1.opacity, p2.opacity);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw the stars themselves
      projectedStars.forEach(p => {
        if (p.z + focalLength <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) return;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // 4. Render multiple giant, extremely blurred, slow-moving atmospheric smoke blobs
      blobs.forEach((blob) => {
        blob.phaseX += blob.driftSpeed * dt;
        blob.phaseY += blob.driftSpeed * dt;

        const sineOffsetWanderX = Math.sin(blob.phaseX) * blob.amplitude * dt * 2;
        const sineOffsetWanderY = Math.cos(blob.phaseY) * blob.amplitude * dt * 2;

        const scrollImpact = scrollDiff * 0.12;

        let mouseInfluenceX = 0;
        let mouseInfluenceY = 0;
        if (curMouseX > 0 && curMouseY > 0) {
          const dx = curMouseX - blob.x;
          const dy = curMouseY - blob.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 600) {
            const force = (1 - dist / 600) * 15;
            mouseInfluenceX = (dx / dist) * force * dt;
            mouseInfluenceY = (dy / dist) * force * dt;
          }
        }

        blob.x += blob.vx * dt + sineOffsetWanderX + mouseInfluenceX;
        blob.y += (blob.vy * dt - scrollImpact) + sineOffsetWanderY + mouseInfluenceY;

        const buffer = blob.radius * 1.5;
        if (blob.x < -buffer) blob.x = w + buffer;
        if (blob.x > w + buffer) blob.x = -buffer;
        if (blob.y < -buffer) blob.y = h + buffer;
        if (blob.y > h + buffer) blob.y = -buffer;

        const targetColor = theme === 'light' ? '220, 220, 235' : '245, 245, 255';
        const radGrad = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        
        const currentOpacity = blob.opacity;
        radGrad.addColorStop(0, `rgba(${targetColor}, ${currentOpacity})`);
        radGrad.addColorStop(0.4, `rgba(${targetColor}, ${currentOpacity * 0.6})`);
        radGrad.addColorStop(0.8, `rgba(${targetColor}, ${currentOpacity * 0.12})`);
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;

        if (theme === 'dark') {
          ctx.globalCompositeOperation = 'screen';
        } else {
          ctx.globalCompositeOperation = 'multiply';
        }

        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      });

      frameId = requestAnimationFrame(updateAndDraw);
    };

    frameId = requestAnimationFrame(updateAndDraw);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [loading, theme]);

  return (
    <div ref={containerRef} id="portfolio-container" className="color-bg-primary relative w-full font-sans overflow-x-hidden transition-colors duration-500">
      {/* Decorative Film Grain Backdrop Overlay */}
      <div id="film-grain-overlay" className="film-grain" />

      {/* Procedural GPU-Accelerated Atmosphere Canvas (z-0: Always behind content) */}
      {!loading && (
        <canvas 
          ref={bgCanvasRef}
          id="cinematic-smoke-canvas"
          className="fixed inset-0 pointer-events-none z-0"
        />
      )}

      {/* BRAND LOGO / NAME (Top Left Corner) */}
      {!loading && <BrandHeaderLogo logoUrl={logoUrl} />}

      {/* THEME TOGGLER (Top Right Corner) */}
      {!loading && (
        <div id="theme-toggler-wrapper" className="fixed top-6 right-6 z-50 pointer-events-auto">
          <button
            id="theme-toggle-btn"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="flex items-center justify-center p-3.5 rounded-full bg-neutral-900/80 backdrop-blur border border-neutral-800 text-neutral-300 hover:text-white transition duration-200 shadow-xl dark:bg-white/10 dark:border-white/10 dark:text-neutral-100 cursor-pointer"
            aria-label="Toggle visual theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
          </button>
        </div>
      )}

      {/* QUICK FLOATING NAV BAR (With studio access visually hidden but intact) */}
      {!loading && (
        <div id="quick-nav-bar" className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-[var(--bg-secondary)]/90 backdrop-blur-md border color-border-primary px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl transition-colors duration-500">
          <button id="nav-btn-home" onClick={() => scrollToPercent(0.01)} className={`font-sans text-xs uppercase tracking-widest font-semibold transition ${scrollProgress < 0.15 ? 'text-[#C5A880]' : 'text-gray-500 hover:text-white'}`}>
            Home
          </button>
          <button id="nav-btn-about" onClick={() => scrollToPercent(0.25)} className={`font-sans text-xs uppercase tracking-widest font-semibold transition ${scrollProgress >= 0.15 && scrollProgress < 0.40 ? 'text-[#C5A880]' : 'text-gray-500 hover:text-white'}`}>
            About
          </button>
          <button id="nav-btn-expertise" onClick={() => scrollToPercent(0.50)} className={`font-sans text-xs uppercase tracking-widest font-semibold transition ${scrollProgress >= 0.40 && scrollProgress < 0.68 ? 'text-[#C5A880]' : 'text-gray-500 hover:text-white'}`}>
            Skills
          </button>
          <button id="nav-btn-showroom" onClick={() => scrollToPercent(0.75)} className={`font-sans text-xs uppercase tracking-widest font-semibold transition ${scrollProgress >= 0.68 && scrollProgress < 0.88 ? 'text-[#C5A880]' : 'text-gray-500 hover:text-white'}`}>
            Projects
          </button>
          <button id="nav-btn-connect" onClick={() => scrollToPercent(0.97)} className={`font-sans text-xs uppercase tracking-widest font-semibold transition ${scrollProgress >= 0.88 ? 'text-[#C5A880]' : 'text-gray-500 hover:text-white'}`}>
            Connect
          </button>
        </div>
      )}      {/* 1. CINEMATIC LOADING INITIALIZING SCREEN */}
      {loading && (
        <LoadingScreen
          logoUrl={logoUrl}
          avatarUrl={avatarUrl}
          faviconUrl={brandingContext.faviconUrl}
          isDataReady={isBrandingReady}
          onFinish={() => {
            setLoading(false);
            sessionStorage.setItem('lokesh_portfolio_loaded', 'true');
          }}
        />
      )}

      {/* 2. LIVE SCENIC SCROLL BLOCKS LAYER */}
      
      {/* HERO SECTION */}
      <section id="hero-section" className="relative min-h-screen w-full flex items-center justify-center pt-32 pb-24 px-8 md:px-20 z-30 overflow-hidden text-left color-bg-primary">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[20%] left-[10%] w-80 h-80 bg-[#C5A880]/5 dark:bg-[#C5A880]/10 rounded-full blur-[110px] animate-float-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#64748B]/5 dark:bg-[#64748B]/10 rounded-full blur-[130px] animate-float-reverse" />
          <div className="absolute top-[45%] left-[40%] w-64 h-64 bg-neutral-600/5 dark:bg-neutral-500/5 rounded-full blur-[90px] animate-pulse" />
        </div>
        
        {/* Subtle glowing lighting grids */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#C5A880]/5 rounded-full blur-[140px] z-0" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Text & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8 flex flex-col items-start"
          >
            <div className="space-y-4">
              <motion.span 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                id="hero-protocol" 
                className="font-mono text-xs color-text-primary uppercase tracking-widest flex items-center gap-2 bg-neutral-900/40 dark:bg-white/5 border color-border-primary px-4 py-1.5 rounded-full w-fit"
              >
                Full Stack Web Developer | AI Engineer
              </motion.span>
              
              <motion.h1 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                id="hero-title" 
                className="font-display text-6xl md:text-8xl lg:text-9xl tracking-wide leading-none uppercase select-none animate-shimmer-text text-left"
              >
                P. LOKESH
              </motion.h1>
            </div>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              id="hero-desc" 
              className="color-text-secondary leading-relaxed text-sm md:text-base border-y border-neutral-800 dark:border-neutral-800/80 py-5 font-mono text-left max-w-xl"
            >
              I shape high-performance digital architectures and fluid, intelligent interfaces. Blending full-stack precision with artificial intelligence, I build scalable end-to-end applications designed to elevate human experiences.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              id="hero-actions" 
              className="flex flex-wrap items-center gap-4"
            >
              <button 
                id="hero-btn-explore"
                onClick={() => scrollToPercent(0.25)}
                className="font-display text-xl uppercase tracking-widest bg-neutral-900 dark:bg-[#C5A880] text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-[#b0946f] px-8 py-3.5 rounded shadow-lg transition duration-200 flex items-center gap-2 cursor-pointer font-semibold border-0"
              >
                <span>Explore Portfolio</span>
                <Compass className="w-5 h-5" />
              </button>
              <button 
                id="hero-btn-projects"
                onClick={() => scrollToPercent(0.75)}
                className="font-display text-xl uppercase tracking-widest color-bg-secondary hover:bg-neutral-800 dark:hover:bg-neutral-200 dark:hover:text-black color-text-primary border color-border-primary px-8 py-3.5 rounded transition duration-200 flex items-center gap-2 cursor-pointer font-medium"
              >
                <span>View Projects</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>

          {/* Right: Immersive & Cinematic Portrait Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="relative w-full max-w-[380px] aspect-[4/5] rounded-2xl p-3 bg-neutral-950/40 backdrop-blur-md border border-neutral-800 dark:border-white/10 shadow-2xl overflow-hidden group">
              {/* Glass Reflection effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-60 pointer-events-none z-10" />
              
              {/* Soft gold lighting halo behind the image frame */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#C5A880]/10 rounded-full blur-3xl z-0" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-neutral-500/10 rounded-full blur-3xl z-0" />

              <HeroProfileAvatar avatarUrl={avatarUrl} />
            </div>
          </motion.div>
        </div>

        {/* Scroll down indicator arrow */}
        <div id="scroll-indicator" className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center color-text-muted hover:color-text-primary transition cursor-pointer" onClick={() => scrollToPercent(0.25)}>
          <ChevronDownAnimation />
        </div>
      </section>

      {/* ABOUT & EXPERIENCE */}
      <section id="about-section" className="relative min-h-[120vh] w-full flex flex-col justify-center px-8 md:px-20 py-20 z-30 border-t color-border-primary color-bg-primary">
        {/* Glow backdrop strip */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[350px] bg-gradient-to-r from-[#C5A880]/3 to-transparent blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px 0px 100px 0px", amount: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10"
        >
          <div className="space-y-6">
            <div>
              <span id="about-tag" className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold">About</span>
              <h2 id="about-title" className="font-display text-5xl md:text-7xl color-text-primary tracking-wide uppercase mt-1">
                Full Stack Developer & AI Engineer
              </h2>
            </div>
            
            <p className="color-text-secondary font-sans text-sm md:text-base leading-relaxed max-w-xl">
              I'm Lokesh, a Full Stack Web Developer passionate about building scalable web applications, modern user interfaces, and AI-powered solutions. I specialize in React, Next.js, TypeScript, Node.js, Express.js, Supabase, MongoDB, MySQL, and modern cloud technologies.
            </p>

            <p className="color-text-secondary font-sans text-sm md:text-base leading-relaxed max-w-xl">
              Currently, I'm working as a Full Stack Web Developer Intern at BELVO, where I contribute to enterprise-grade web applications, CMS platforms, backend APIs, authentication systems, dashboards, and responsive user experiences.
            </p>

            <p className="color-text-secondary font-sans text-sm md:text-base leading-relaxed max-w-xl">
              I enjoy solving real-world problems through clean architecture, reusable code, performance optimization, and intuitive user experiences. Alongside full-stack development, I actively explore Artificial Intelligence, API integrations, automation, and cloud deployment technologies to build production-ready software.
            </p>
          </div>

          <div className="space-y-6">
            <h3 id="about-credentials-header" className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold border-b color-border-primary pb-2">
              Experience
            </h3>

            {experiences.map((exp, expIdx) => (
              <TiltCard 
                key={exp.id || expIdx} 
                id={`exp-card-${expIdx}`}
                className="color-bg-secondary border-2 color-border-primary rounded-xl p-6 relative group hover:border-neutral-400 dark:hover:border-[#C5A880] transition duration-300 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  {exp.logo_url && (
                    <SmartImage
                      src={exp.logo_url}
                      alt={exp.company}
                      containerClassName="w-12 h-12 rounded-lg shrink-0 border color-border-primary"
                      className="w-full h-full object-contain rounded-lg"
                      loading="eager"
                    />
                  )}
                  <div className="space-y-2 min-w-0">
                    <span className="font-mono text-[10px] bg-[#C5A880]/10 border border-[#C5A880]/20 text-neutral-800 dark:text-[#C5A880] px-2.5 py-1 rounded-full uppercase font-bold tracking-wider flex items-center w-fit gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {exp.duration.toLowerCase() === 'present' ? 'Current Role' : 'Professional Experience'}
                    </span>
                    
                    <h4 className="font-display text-3xl color-text-primary tracking-wider uppercase pt-1">
                      {exp.role}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs color-text-muted font-mono">
                      <span className="color-text-primary font-semibold">{exp.company}</span>
                      <span>•</span>
                      <span>{exp.duration}</span>
                      <span>•</span>
                      <span>{exp.location}</span>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-xs md:text-sm color-text-secondary font-sans leading-relaxed list-disc list-inside">
                  {exp.details.map((detail, idx) => (
                    <li key={idx} className="hover:color-text-primary transition duration-150">
                      {detail}
                    </li>
                  ))}
                </ul>
              </TiltCard>
            ))}
          </div>

        </motion.div>
      </section>

      {/* EDUCATION */}
      {educationList.length > 0 && (
        <section id="education-section" className="relative min-h-screen w-full flex flex-col justify-center px-8 md:px-20 py-20 z-30 border-t color-border-primary color-bg-primary">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "300px 0px 100px 0px", amount: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-7xl mx-auto w-full relative z-10 space-y-12"
          >
            <div className="text-center space-y-2">
              <span className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold">Academic Background</span>
              <h2 className="font-display text-5xl md:text-7xl color-text-primary tracking-wide uppercase">Education</h2>
            </div>
            <div className="flex flex-col items-center gap-6">
              {educationList.map((edu, idx) => (
                <div key={edu.id || idx} className="color-bg-secondary border-2 color-border-primary rounded-xl p-8 w-full max-w-2xl group hover:border-neutral-400 dark:hover:border-[#C5A880] transition duration-300 shadow-lg">
                  <div className="flex items-start gap-5">
                    {edu.logo_url && (
                      <SmartImage
                        src={edu.logo_url}
                        alt={edu.school}
                        containerClassName="w-16 h-16 rounded-xl shrink-0 border color-border-primary mt-1"
                        className="w-full h-full object-contain rounded-xl"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5 text-[#C5A880] shrink-0" />
                          <h3 className="font-display text-2xl md:text-3xl color-text-primary tracking-wide">{edu.degree}</h3>
                        </div>
                        {edu.field && (
                          <p className="font-mono text-sm color-text-muted ml-7">{edu.field}</p>
                        )}
                      </div>
                      <div className="space-y-3 ml-7">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#C5A880] shrink-0" />
                          <div>
                            <p className="font-display text-xl color-text-primary">{edu.school}</p>
                            {edu.university && <p className="font-mono text-xs color-text-muted">Affiliated to {edu.university}</p>}
                          </div>
                        </div>
                        {edu.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#C5A880] shrink-0" />
                            <p className="font-mono text-sm color-text-muted">{edu.location}</p>
                          </div>
                        )}
                        {edu.start_year && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#C5A880] shrink-0" />
                            <p className="font-mono text-sm color-text-muted">{edu.start_year}{edu.end_year ? ` – ${edu.end_year}` : ''}</p>
                          </div>
                        )}
                      </div>
                      {edu.description && (
                        <p className="font-mono text-sm color-text-muted leading-relaxed border-t border-color-border-primary pt-4 mt-4 ml-7">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      )}

      {/* TECH STACK (HORIZONTAL SCROLLING MARQUEE FROM RIGHT TO LEFT) */}
      <section id="skills-section" className="relative min-h-[90vh] w-full flex flex-col justify-center py-20 z-30 border-t color-border-primary overflow-hidden color-bg-primary">
        {/* Overhead subtle highlight poles */}
        <div className="absolute top-0 left-[15%] w-[3px] h-48 bg-gradient-to-b from-[#C5A880] to-[#C5A880]/10 opacity-30 z-0 pointer-events-none" />
        <div className="absolute top-0 right-[25%] w-[3px] h-64 bg-gradient-to-b from-white to-white/10 opacity-25 z-0 pointer-events-none" />

        {/* Subtle grid backdrop mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border-primary)_1px,transparent_1px),linear-gradient(to_bottom,var(--border-primary)_1px,transparent_1px)] bg-[size:48px_48px] opacity-15 z-0 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px 0px 100px 0px", amount: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto w-full relative z-10"
        >
          <div className="px-8 md:px-20 mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <span id="skills-tag" className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold">Tech Stack</span>
                <h2 id="skills-title" className="font-display text-5xl md:text-7xl color-text-primary tracking-wide uppercase mt-1">
                  MY STACK
                </h2>
                <p id="skills-desc" className="font-mono text-xs color-text-muted mt-1 uppercase tracking-wider max-w-xl">
                  Comprehensive breakdown of technologies, frameworks, tools & core engineering competencies.
                </p>
              </div>

              {/* CATEGORY FILTER PILLS */}
              <div className="flex flex-wrap gap-2 max-w-3xl">
                {[
                  { id: 'all', label: 'All Stack', count: techStack.length },
                  { id: 'frontend', label: 'Frontend', count: techStack.filter(t => t.category === 'frontend').length },
                  { id: 'backend', label: 'Backend', count: techStack.filter(t => t.category === 'backend').length },
                  { id: 'database', label: 'Database & Services', count: techStack.filter(t => t.category === 'database').length },
                  { id: 'ai', label: 'AI & APIs', count: techStack.filter(t => t.category === 'ai').length },
                  { id: 'deployment', label: 'Deployment', count: techStack.filter(t => t.category === 'deployment').length },
                  { id: 'tools', label: 'Dev Tools', count: techStack.filter(t => t.category === 'tools').length },
                  { id: 'libraries', label: 'Libraries', count: techStack.filter(t => t.category === 'libraries').length },
                  { id: 'coreskills', label: 'Core Skills', count: techStack.filter(t => t.category === 'coreskills').length },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveStackCategory(cat.id)}
                    className={`font-mono text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                      activeStackCategory === cat.id
                        ? 'bg-[#C5A880] text-black border-[#C5A880] font-semibold shadow-lg scale-105'
                        : 'color-bg-secondary color-border-primary color-text-muted hover:color-text-primary hover:border-[#C5A880]/50'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeStackCategory === cat.id ? 'bg-black/20 text-black font-bold' : 'bg-white/10 color-text-muted'}`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MARQUEE SCROLLERS FOR ALL OR FILTERED STACK CATEGORY */}
          <div className="space-y-5 w-full relative z-10">
            {/* ROW 1 */}
            {(() => {
              const filtered = activeStackCategory === 'all' 
                ? techStack 
                : techStack.filter(t => t.category === activeStackCategory);

              const row1 = activeStackCategory === 'all'
                ? techStack.filter(t => t.category === 'frontend')
                : (filtered.length > 6 ? filtered.slice(0, Math.ceil(filtered.length / 2)) : filtered);

              const row2 = activeStackCategory === 'all'
                ? techStack.filter(t => t.category === 'backend' || t.category === 'database')
                : (filtered.length > 6 ? filtered.slice(Math.ceil(filtered.length / 2)) : []);

              const row3 = activeStackCategory === 'all'
                ? techStack.filter(t => t.category === 'ai' || t.category === 'deployment' || t.category === 'tools' || t.category === 'libraries')
                : [];

              const row4 = activeStackCategory === 'all'
                ? techStack.filter(t => t.category === 'coreskills')
                : [];

              const multiply = (list: TechStack[]) => {
                if (list.length === 0) return [];
                if (list.length < 6) return [...list, ...list, ...list, ...list, ...list];
                if (list.length < 12) return [...list, ...list, ...list];
                return [...list, ...list];
              };

              const r1Repeated = multiply(row1);
              const r2Repeated = multiply(row2);
              const r3Repeated = multiply(row3);
              const r4Repeated = multiply(row4);

              return (
                <>
                  {/* MARQUEE ROW 1 */}
                  {r1Repeated.length > 0 && (
                    <div className="w-full relative overflow-hidden py-3 border-y color-border-primary color-bg-secondary/40 backdrop-blur-sm">
                      <div className="animate-marquee-rtl flex items-center gap-4 hover:[animation-play-state:paused]" style={{ animationDuration: '32s' }}>
                        {r1Repeated.map((tech, idx) => (
                          <div 
                            key={`mr1-${tech.id}-${idx}`} 
                            className="flex items-center gap-3 color-bg-secondary border color-border-primary px-5 py-2.5 rounded-full shadow-md hover:border-[#C5A880] hover:scale-105 transition-all duration-200 cursor-default shrink-0"
                          >
                            <TechIcon name={tech.name} size={20} iconUrl={tech.icon_url} />
                            <span className="font-mono text-xs color-text-primary whitespace-nowrap font-medium">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MARQUEE ROW 2 */}
                  {r2Repeated.length > 0 && (
                    <div className="w-full relative overflow-hidden py-3 border-y color-border-primary color-bg-secondary/40 backdrop-blur-sm">
                      <div className="animate-marquee-rtl flex items-center gap-4 hover:[animation-play-state:paused]" style={{ animationDuration: '38s' }}>
                        {r2Repeated.map((tech, idx) => (
                          <div 
                            key={`mr2-${tech.id}-${idx}`} 
                            className="flex items-center gap-3 color-bg-secondary border color-border-primary px-5 py-2.5 rounded-full shadow-md hover:border-neutral-400 dark:hover:border-[#C5A880] hover:scale-105 transition-all duration-200 cursor-default shrink-0"
                          >
                            <TechIcon name={tech.name} size={20} iconUrl={tech.icon_url} />
                            <span className="font-mono text-xs color-text-primary whitespace-nowrap font-medium">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MARQUEE ROW 3 */}
                  {r3Repeated.length > 0 && (
                    <div className="w-full relative overflow-hidden py-3 border-y color-border-primary color-bg-secondary/40 backdrop-blur-sm">
                      <div className="animate-marquee-rtl flex items-center gap-4 hover:[animation-play-state:paused]" style={{ animationDuration: '44s' }}>
                        {r3Repeated.map((tech, idx) => (
                          <div 
                            key={`mr3-${tech.id}-${idx}`} 
                            className="flex items-center gap-3 color-bg-secondary border color-border-primary px-5 py-2.5 rounded-full shadow-md hover:border-neutral-400 dark:hover:border-[#C5A880] hover:scale-105 transition-all duration-200 cursor-default shrink-0"
                          >
                            <TechIcon name={tech.name} size={20} iconUrl={tech.icon_url} />
                            <span className="font-mono text-xs color-text-primary whitespace-nowrap font-medium">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MARQUEE ROW 4 */}
                  {r4Repeated.length > 0 && (
                    <div className="w-full relative overflow-hidden py-3 border-y color-border-primary color-bg-secondary/40 backdrop-blur-sm">
                      <div className="animate-marquee-rtl flex items-center gap-4 hover:[animation-play-state:paused]" style={{ animationDuration: '36s' }}>
                        {r4Repeated.map((tech, idx) => (
                          <div 
                            key={`mr4-${tech.id}-${idx}`} 
                            className="flex items-center gap-3 color-bg-secondary border color-border-primary px-5 py-2.5 rounded-full shadow-md hover:border-neutral-400 dark:hover:border-[#C5A880] hover:scale-105 transition-all duration-200 cursor-default shrink-0"
                          >
                            <TechIcon name={tech.name} size={20} iconUrl={tech.icon_url} />
                            <span className="font-mono text-xs color-text-primary whitespace-nowrap font-medium">{tech.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </motion.div>
      </section>

      {/* PROJECT SHOWCASE */}
      <section id="projects-section" className="relative min-h-[120vh] w-full flex flex-col justify-start px-8 md:px-20 py-24 z-30 border-t color-border-primary color-bg-primary">
        {/* Subtle motion trails in background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#C5A880]/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px 0px 100px 0px", amount: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto w-full relative z-10 space-y-16"
        >
          
          <div className="text-center space-y-2">
            <span id="projects-tag" className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold">My Work</span>
            <h2 id="projects-title" className="font-display text-6xl md:text-8xl color-text-primary tracking-wide uppercase leading-none">
              PROJECTS
            </h2>
            <p id="projects-desc" className="font-mono text-xs color-text-muted uppercase tracking-widest max-w-md mx-auto">
              Real-world applications I've built from the ground up.
            </p>
          </div>

          {/* FLAGSHIP HERO PROJECT SHOWCASE: LUMORA AI */}
          {projects.filter(p => p.title.toLowerCase() === 'lumora ai').map((lumora) => (
            <TiltCard 
              key={lumora.id} 
              id="flagship-project-card"
              className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] border-3 border-[#C5A880] dark:border-[#C5A880] rounded-2xl p-8 md:p-10 relative overflow-hidden flex flex-col gap-6 shadow-2xl group z-10 transition-colors duration-500"
            >
              {/* Soft visual accent overlay */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gradient from-[#C5A880]/10 to-transparent blur-3xl pointer-events-none" />
              
              <div className="w-full space-y-6 relative z-10">
                <div className="flex items-center gap-3 flex-wrap">
                  {lumora.logo_url && (
                    <SmartImage
                      src={lumora.logo_url}
                      alt={`${lumora.title} logo`}
                      containerClassName="h-10 w-10 rounded shrink-0"
                      className="w-full h-full object-contain rounded"
                      loading="eager"
                      fetchPriority="high"
                    />
                  )}
                  <span className="font-mono text-[9px] bg-neutral-800 dark:bg-white/5 border border-white/10 text-white px-3 py-1 rounded uppercase font-bold tracking-widest">
                    FLAGSHIP INTEGRATION
                  </span>
                  <span className="font-mono text-[9px] bg-[#C5A880]/10 text-neutral-800 dark:text-[#C5A880] px-3 py-1 rounded uppercase font-bold tracking-widest flex items-center gap-1">
                    MULTIMODAL AI
                  </span>
                </div>

                <h3 className="font-display text-5xl md:text-7xl text-neutral-800 dark:text-[#C5A880] tracking-wider uppercase leading-none">
                  {lumora.title}
                </h3>

                <p className="color-text-secondary font-sans text-sm md:text-base leading-relaxed max-w-4xl">
                  {lumora.description}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {lumora.tech_tags.map(tag => (
                    <span key={tag} className="font-mono text-[10px] color-bg-primary color-text-secondary border color-border-primary px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-4">
                  {lumora.live_url && (
                    <a 
                       href={lumora.live_url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="font-display text-lg uppercase tracking-wider bg-white text-black px-8 py-3 rounded-md hover:bg-[#C5A880] dark:hover:bg-[#C5A880] hover:text-black transition duration-200 font-medium shadow"
                    >
                      Launch Live Website
                    </a>
                  )}
                  {lumora.github_url && (
                    <a 
                      href={lumora.github_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-mono text-xs uppercase tracking-widest color-text-secondary hover:color-text-primary transition duration-200 flex items-center gap-2"
                    >
                      <Github className="w-4 h-4 text-[#C5A880]" />
                      <span className="border-b color-border-primary pb-0.5">Code Repository</span>
                    </a>
                  )}
                </div>
              </div>
            </TiltCard>
          ))}

          {/* OTHER PROJECTS SHOWROOM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            {projects.filter(p => p.title.toLowerCase() !== 'lumora ai').map((proj, projIdx) => (
              <TiltCard 
                key={proj.id || projIdx}
                id={`project-card-${projIdx}`}
                className="color-bg-secondary border-2 color-border-primary rounded-xl p-6 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-[#C5A880] transition-all duration-300 shadow-lg group relative overflow-hidden"
              >
                <div className="space-y-5">
                  {/* Card Header with Logo Badge and Category */}
                  <div className="flex items-start justify-between gap-4">
                    {proj.logo_url ? (
                      <SmartImage
                        src={proj.logo_url}
                        alt={`${proj.title} logo`}
                        containerClassName="w-12 h-12 rounded-xl bg-neutral-900/90 dark:bg-white/5 border border-neutral-800 dark:border-white/10 p-2 shadow-lg backdrop-blur-md shrink-0 group-hover:scale-105 transition-all duration-300"
                        className="w-full h-full object-contain rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-500/10 to-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center text-[#C5A880] font-display font-semibold text-lg shadow-lg shrink-0 group-hover:scale-105 transition-all duration-300">
                        {proj.title.charAt(0).toUpperCase()}
                      </div>
                    )}
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-mono text-[9px] bg-neutral-200 dark:bg-[#1C1C1C] color-text-secondary border color-border-primary px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                        {proj.category || 'Project Card'}
                      </span>
                      {proj.featured && (
                        <span className="flex items-center gap-1 font-mono text-[8px] text-[#C5A880] bg-[#C5A880]/10 border border-[#C5A880]/20 px-2 py-0.5 rounded-full uppercase font-bold">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {proj.thumbnail_url && (
                    <div className="w-full h-40 rounded-lg overflow-hidden border color-border-primary relative">
                      <img src={proj.thumbnail_url} alt={proj.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-display text-2xl color-text-primary tracking-wide uppercase group-hover:text-[#C5A880] dark:group-hover:text-[#C5A880] transition duration-150">
                      {proj.title}
                    </h4>

                    <p className="color-text-secondary text-xs md:text-sm leading-relaxed font-sans line-clamp-4">
                      {proj.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6">
                  <div className="flex flex-wrap gap-1.5">
                    {proj.tech_tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] color-bg-primary color-text-muted px-2.5 py-0.5 rounded-full border color-border-primary">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t color-border-primary text-xs font-mono">
                    {proj.live_url ? (
                      <a 
                        href={proj.live_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-neutral-500 dark:text-[#C5A880] hover:text-black dark:hover:text-white transition duration-150 flex items-center gap-1 font-semibold"
                      >
                        <span>Visit Website</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="color-text-muted">Local Only</span>
                    )}

                    {proj.github_url && (
                      <a 
                        href={proj.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="color-text-secondary hover:color-text-primary transition p-1 hover:bg-neutral-800 dark:hover:bg-white/5 rounded-full"
                        title="GitHub Code"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

        </motion.div>
      </section>

      {/* CONTACT & CONNECT (FULLY UNBLURRED & ALWAYS CLEAR) */}
      <section id="contact-section" className="relative min-h-screen w-full flex flex-col justify-center px-8 md:px-20 py-24 z-30 border-t color-border-primary color-bg-primary">
        {/* Soft centered light behind contact cards */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#C5A880]/[0.03] rounded-full blur-[160px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "300px 0px 100px 0px", amount: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          id="contact-content-wrapper"
          className="max-w-4xl mx-auto w-full relative z-10 space-y-12"
        >
          
          <div className="text-center space-y-3">
            <span id="contact-tag" className="font-mono text-xs text-neutral-500 dark:text-[#C5A880] uppercase tracking-widest font-semibold">Connect</span>
            <h2 id="contact-title" className="font-display text-6xl md:text-8xl color-text-primary tracking-wide uppercase leading-none">
              GET IN TOUCH
            </h2>
            <p id="contact-desc" className="font-mono text-xs color-text-muted uppercase tracking-widest max-w-md mx-auto">
              Direct and instant lines of communication. Reach out today.
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            
            {/* Direct Channels */}
            <div id="contact-direct-card" className="color-bg-secondary border-2 color-border-primary rounded-xl p-8 space-y-6 relative overflow-hidden transition-colors duration-500 shadow-lg">
              <h3 className="font-display text-3xl color-text-primary uppercase tracking-wider border-b color-border-primary pb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#C5A880]" />
                <span>Contact Details</span>
              </h3>

              <div className="space-y-4 font-mono text-sm">
                <a 
                  id="contact-link-email"
                  href="mailto:lokesh81@myyahoo.com" 
                  className="flex items-center gap-3 p-3 color-bg-primary border border-color-border-primary hover:border-neutral-400 dark:hover:border-[#C5A880] color-text-secondary hover:color-text-primary transition duration-200"
                >
                  <Mail className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span className="truncate">lokesh81@myyahoo.com</span>
                </a>

                <a 
                  id="contact-link-phone"
                  href="tel:+918885674172" 
                  className="flex items-center gap-3 p-3 color-bg-primary border border-color-border-primary hover:border-neutral-400 dark:hover:border-[#C5A880] color-text-secondary hover:color-text-primary transition duration-200"
                >
                  <Phone className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>+91 8885674172</span>
                </a>
              </div>

              <div className="pt-2 space-y-3">
                <a 
                  id="contact-btn-resume"
                  href={resumeUrl && resumeUrl !== '#' ? resumeUrl : '#'}
                  onClick={handleResumeClick}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full bg-neutral-900 dark:bg-[#C5A880] text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-[#b0946f] font-display text-xl uppercase tracking-widest py-3 px-4 rounded text-center block transition cursor-pointer font-medium border-0 shadow-lg"
                >
                  Download Resume
                </a>
              </div>
            </div>

            {/* Social Indexes (Now featuring Instagram link) */}
            <div id="contact-social-card" className="color-bg-secondary border-2 color-border-primary rounded-xl p-8 space-y-6 flex flex-col justify-between transition-colors duration-500 shadow-lg">
              <div>
                <h3 className="font-display text-3xl color-text-primary uppercase tracking-wider border-b color-border-primary pb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#C5A880]" />
                  <span>Social Links</span>
                </h3>

                <p className="color-text-secondary text-xs md:text-sm font-sans leading-relaxed pt-2">
                  Follow my current logs on GitHub, connect through Instagram, or view professional profile directly via LinkedIn.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-6">
                <a 
                  id="social-link-github"
                  href="https://github.com/lokeshnaivaidya-max" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 color-bg-primary rounded border color-border-primary hover:border-neutral-400 dark:hover:border-[#C5A880] color-text-secondary hover:color-text-primary transition duration-200"
                >
                  <Github className="w-5 h-5 mb-1.5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">GitHub</span>
                </a>

                <a 
                  id="social-link-linkedin"
                  href="https://www.linkedin.com/in/lokesh-p-14b670380/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 color-bg-primary rounded border color-border-primary hover:border-neutral-400 dark:hover:border-[#C5A880] color-text-secondary hover:color-text-primary transition duration-200"
                >
                  <Linkedin className="w-5 h-5 mb-1.5" />
                  <span className="font-mono text-[9px] uppercase tracking-wider">LinkedIn</span>
                </a>

                <a 
                  id="social-link-instagram"
                  href="https://www.instagram.com/_lokesh81/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 color-bg-primary rounded border color-border-primary hover:border-neutral-400 dark:hover:border-[#C5A880] color-text-secondary hover:color-text-primary transition duration-200"
                >
                  <svg className="w-5 h-5 mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span className="font-mono text-[9px] uppercase tracking-wider">Instagram</span>
                </a>
              </div>
            </div>

          </div>

          {/* Ultra-Modern Interactive Footer */}
          <div className="pt-12 border-t color-border-primary hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center justify-between text-xs font-mono">
              
              {/* Connected Active State */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <span className="flex items-center gap-1.5 text-emerald-500 font-semibold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Portfolio Online
                </span>
                <span className="text-gray-500">G��</span>
                <span className="text-gray-400 uppercase tracking-wider">
                  Verified SSL
                </span>
              </div>

              {/* Real-time Clock Dashboard */}
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-[9px] uppercase tracking-widest mb-1">Time in India (IST)</span>
                <span className="font-mono text-lg font-bold text-amber-700 dark:text-[#F5B942] tracking-wider px-4 py-1.5 bg-neutral-900/80 dark:bg-white/5 border color-border-primary rounded">
                  {timeStr || '12:00:00 PM'}
                </span>
              </div>

              {/* Dynamic Interactive Back to Top */}
              <div className="flex items-center justify-center md:justify-end gap-6 text-[10px]">
                <span className="text-gray-500 uppercase">Interactive Build</span>
                <span className="text-gray-500">G��</span>
                <button 
                  onClick={() => scrollToPercent(0.01)}
                  className="text-amber-600 dark:text-amber-500 hover:text-red-500 dark:hover:text-white transition duration-200 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
                >
                  Back to Top G��
                </button>
              </div>

            </div>

            {/* Pristine Modern Footer with Clock & Precise Copyright */}
            <div className="mt-12 flex flex-col items-center justify-center gap-6 border-t color-border-primary pt-12 text-center w-full">
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest mb-2 font-mono">Time in India (IST)</span>
                <span className="font-mono text-lg font-bold text-amber-700 dark:text-[#C5A880] tracking-widest px-6 py-2 bg-neutral-900/80 dark:bg-white/5 border color-border-primary rounded shadow-inner animate-pulse">
                  {timeStr || '12:00:00 PM'}
                </span>
              </div>
              <p className="font-mono text-[10px] color-text-muted uppercase tracking-widest leading-relaxed">
                2026 P. Lokesh. Crafted with ultimate precision.
              </p>
            </div>

            {/* Hidden old copyright wrapper */}
            <div className="hidden">
              <p className="font-mono text-[10px] color-text-muted uppercase tracking-widest leading-relaxed">
                -� 2026 P. Lokesh. Crafted with ultimate precision.
              </p>
            </div>
          </div>

        </motion.div>
      </section>

      {/* 2. PREMIUM INTERACTIVE RESUME OVERLAY MODAL */}
      <AnimatePresence>
        {isResumeModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex justify-center overflow-y-auto p-4 md:p-10 cursor-default print:bg-white print:p-0 print:m-0 print:absolute print:inset-0 print:z-[1000] print:overflow-visible print:block"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="bg-[#141414] text-gray-100 border border-neutral-800 w-full max-w-3xl rounded-xl shadow-2xl p-6 md:p-10 relative flex flex-col gap-6 select-text my-auto print:border-none print:shadow-none print:p-0 print:bg-white print:text-black print:overflow-visible"
            >
              {/* Controls (Hidden during print) */}
              <div className="flex items-center justify-between border-b border-[#2D2D2D] pb-4 shrink-0 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] bg-[#E8332A]/10 text-[#E8332A] border border-[#E8332A]/20 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                    Interactive Resume
                  </span>
                  <span className="font-mono text-[9px] text-gray-500 uppercase">Press Print to save PDF</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-[#E8332A] hover:bg-[#ff453d] text-white font-mono text-xs uppercase tracking-wider py-2 px-4 rounded border-0 transition cursor-pointer font-medium"
                  >
                    <span>Print / Save PDF</span>
                  </button>
                  <button
                    onClick={() => setIsResumeModalOpen(false)}
                    className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-gray-400 hover:text-white rounded transition cursor-pointer border border-neutral-700 hover:border-transparent font-mono text-xs"
                    aria-label="Close"
                  >
                    G�� Close
                  </button>
                </div>
              </div>

              {/* Printable Resume Canvas */}
              <div id="printable-resume-canvas" className="font-sans space-y-6 text-sm print:text-black leading-relaxed">
                {/* Header */}
                <div className="text-center space-y-2 border-b border-neutral-800 print:border-neutral-300 pb-5">
                  <h1 className="font-display text-4xl font-bold tracking-tight text-white print:text-black uppercase">
                    Poosala Lokesh
                  </h1>
                  <p className="font-mono text-xs text-[#F5B942] print:text-neutral-700 uppercase tracking-widest font-semibold">
                    Web Developer & Designer
                  </p>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 print:text-neutral-600 font-mono">
                    <a href="mailto:lokesh81@myyahoo.com" className="hover:text-white print:no-underline">lokesh81@myyahoo.com</a>
                    <span>G��</span>
                    <a href="tel:+918885674172" className="hover:text-white print:no-underline">+91 8885674172</a>
                    <span>G��</span>
                    <span>Hyderabad, Telangana, India</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-400 print:text-neutral-600 font-mono pt-1">
                    <a href="https://github.com/lokeshnaivaidya-max" target="_blank" rel="noopener noreferrer" className="hover:text-white print:no-underline">GitHub</a>
                    <span>G��</span>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white print:no-underline">LinkedIn</a>
                    <span>G��</span>
                    <a href="https://naivaidya.com" target="_blank" rel="noopener noreferrer" className="hover:text-white print:no-underline">Portfolio</a>
                  </div>
                </div>

                {/* Professional Experience */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#F5B942] print:text-black border-b border-neutral-800 print:border-neutral-300 pb-1">
                    Professional Experience
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-white print:text-black text-base">Full Stack Web Developer Intern</h4>
                    <span className="font-mono text-xs text-gray-400 print:text-neutral-500">2026 - Present</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#F5B942] print:text-neutral-700 font-mono font-medium">
                    <span>BELVO</span>
                    <span>Remote</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-gray-300 print:text-neutral-700 space-y-1.5 pt-1">
                    <li>Worked as a Full Stack Web Developer Intern, contributing to both frontend and backend development.</li>
                    <li>Built responsive interfaces, developed backend features, integrated APIs, optimized application performance, and collaborated on building scalable production-ready web applications.</li>
                  </ul>
                </div>

                <div className="space-y-1 pt-2">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-white print:text-black text-base">Google Student Ambassador</h4>
                    <span className="font-mono text-xs text-gray-400 print:text-neutral-500">2025 - 2026</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#F5B942] print:text-neutral-700 font-mono font-medium">
                    <span>Google / Ambassador Program</span>
                    <span>Hyderabad, Telangana, India</span>
                  </div>
                  <ul className="list-disc pl-5 text-xs text-gray-300 print:text-neutral-700 space-y-1.5 pt-1">
                    <li>Represented Google technologies within my college community by promoting developer tools, organizing technical events, introducing students to Gemini AI, and encouraging modern software development practices.</li>
                  </ul>
                </div>

                    <div className="space-y-1 pt-2">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-semibold text-white print:text-black text-base">Google Student Ambassador</h4>
                        <span className="font-mono text-xs text-gray-400 print:text-neutral-500">2025 - 2026</span>
                      </div>
                      <div className="flex justify-between text-xs text-[#F5B942] print:text-neutral-700 font-mono font-medium">
                        <span>Google / Ambassador Program</span>
                        <span>Hyderabad, Telangana, India</span>
                      </div>
                      <ul className="list-disc pl-5 text-xs text-gray-300 print:text-neutral-700 space-y-1.5 pt-1">
                        <li>Representing Google technologies on campus, organizing tech workshops, hackathons, and study groups.</li>
                        <li>Fostering developer communities, spreading knowledge of Google Cloud, web technologies, and Gemini models.</li>
                        <li>Collaborating directly with student developer leads across Telangana to design collaborative technical learning paths.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Key Projects */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#F5B942] print:text-black border-b border-neutral-800 print:border-neutral-300 pb-1">
                    Key Projects
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-900/40 print:bg-transparent rounded border border-neutral-800/60 print:border-none print:p-0 space-y-1">
                      <h4 className="font-bold text-white print:text-black">Lumora AI</h4>
                      <p className="text-xs text-gray-400 print:text-neutral-500 font-mono">React G�� Next.js G�� Gemini API G�� Framer Motion</p>
                      <p className="text-xs text-gray-300 print:text-neutral-700">Flagship next-generation conversational AI interface. Employs advanced neural architectures for highly semantic chat grounding and instant streaming.</p>
                    </div>

                    <div className="p-3 bg-neutral-900/40 print:bg-transparent rounded border border-neutral-800/60 print:border-none print:p-0 space-y-1">
                      <h4 className="font-bold text-white print:text-black">BELVO</h4>
                      <p className="text-xs text-gray-400 print:text-neutral-500 font-mono">TypeScript G�� React G�� Supabase G�� Tailwind</p>
                      <p className="text-xs text-gray-300 print:text-neutral-700">Financial tracker that integrates real-time transaction processing pipelines and beautiful interactive chart boards.</p>
                    </div>

                    <div className="p-3 bg-neutral-900/40 print:bg-transparent rounded border border-neutral-800/60 print:border-none print:p-0 space-y-1">
                      <h4 className="font-bold text-white print:text-black">Naivaidya</h4>
                      <p className="text-xs text-gray-400 print:text-neutral-500 font-mono">Node.js G�� Express G�� MongoDB G�� JWT</p>
                      <p className="text-xs text-gray-300 print:text-neutral-700">A full-stack platform built for custom product delivery and local service management, featuring secure auth and logistics tracking.</p>
                    </div>

                    <div className="p-3 bg-neutral-900/40 print:bg-transparent rounded border border-neutral-800/60 print:border-none print:p-0 space-y-1">
                      <h4 className="font-bold text-white print:text-black">Sahay Foundation Portal</h4>
                      <p className="text-xs text-gray-400 print:text-neutral-500 font-mono">HTML5 G�� CSS3 G�� React G�� GitHub Pages</p>
                      <p className="text-xs text-gray-300 print:text-neutral-700">Social impact and non-profit portal designed to streamline donation flows, volunteer enrollment, and grassroots storytelling.</p>
                    </div>
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#F5B942] print:text-black border-b border-neutral-800 print:border-neutral-300 pb-1">
                    Technical Skills
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white print:text-black uppercase font-mono text-[11px] text-[#E8332A] print:text-neutral-800">Languages</h4>
                      <p className="text-gray-300 print:text-neutral-700">TypeScript, JavaScript, Python, C++, C, HTML5, CSS3</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white print:text-black uppercase font-mono text-[11px] text-[#E8332A] print:text-neutral-800">Frameworks / Frontend</h4>
                      <p className="text-gray-300 print:text-neutral-700">React.js, Next.js, Vite, Tailwind CSS, Framer Motion, GSAP</p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white print:text-black uppercase font-mono text-[11px] text-[#E8332A] print:text-neutral-800">Backend / Databases</h4>
                      <p className="text-gray-300 print:text-neutral-700">Node.js, Express.js, Supabase, Firebase, MongoDB, REST APIs, JWT</p>
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold uppercase tracking-wider text-[#F5B942] print:text-black border-b border-neutral-800 print:border-neutral-300 pb-1">
                    Education
                  </h3>
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-semibold text-white print:text-black text-sm">B.Sc (MSCS)</h4>
                    <span className="font-mono text-xs text-gray-400 print:text-neutral-500">Graduating 2027</span>
                  </div>
                  <p className="text-xs text-gray-300 print:text-neutral-700 font-mono">Wesley Degree College (affiliated to Osmania University)</p>
                  <p className="text-xs text-gray-400 print:text-neutral-500 font-mono">Telangana, India</p>
                </div>

              </div>

              {/* Print Only CSS Styles */}
              <style>{`
                @media print {
                  body {
                    background-color: white !important;
                    background: white !important;
                    color: black !important;
                  }
                  html, body {
                    height: auto !important;
                    overflow: visible !important;
                  }
                  /* Hide all screen elements during print */
                  body * {
                    visibility: hidden !important;
                  }
                  /* Show only the printable resume canvas and its descendants */
                  #printable-resume-canvas, #printable-resume-canvas * {
                    visibility: visible !important;
                  }
                  #printable-resume-canvas {
                    position: absolute !important;
                    left: 0 !important;
                    top: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    background: white !important;
                    color: black !important;
                  }
                  /* Force high-contrast black text on white paper for print */
                  #printable-resume-canvas h1,
                  #printable-resume-canvas h2,
                  #printable-resume-canvas h3,
                  #printable-resume-canvas h4,
                  #printable-resume-canvas h5,
                  #printable-resume-canvas h6,
                  #printable-resume-canvas span,
                  #printable-resume-canvas p,
                  #printable-resume-canvas li,
                  #printable-resume-canvas div {
                    color: black !important;
                  }
                  #printable-resume-canvas a {
                    color: #1a0dab !important;
                    text-decoration: underline !important;
                  }
                }
              `}</style>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



    </div>
  );
}

// Sub-component for decorative bounce arrow indicator
function ChevronDownAnimation() {
  return (
    <svg 
      className="w-6 h-6 animate-bounce" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// Interactive 3D Card Hover & perspective tilting system
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  key?: React.Key;
}

function TiltCard({ children, className = "", id = "" }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  const maxTilt = 8; // elegant professional maximum tilt angle (deg)
  const rect = cardRef.current?.getBoundingClientRect();
  const width = rect?.width || 1;
  const height = rect?.height || 1;
  
  const rotateX = isHovered ? -(coords.y / height * 2) * maxTilt : 0;
  const rotateY = isHovered ? (coords.x / width * 2) * maxTilt : 0;

  const glareX = isHovered ? `${(coords.x + width / 2)}px` : '50%';
  const glareY = isHovered ? `${(coords.y + height / 2)}px` : '50%';

  return (
    <div
      ref={cardRef}
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.015 : 1}, ${isHovered ? 1.015 : 1}, 1)`,
        transition: isHovered ? 'transform 0.05s linear' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`relative preserve-3d overflow-hidden ${className}`}
    >
      {/* 3D Deep content rendering context */}
      <div style={{ transform: 'translateZ(8px)', transformStyle: 'preserve-3d' }} className="w-full h-full relative z-10 preserve-3d">
        {children}
      </div>

      {/* Dynamic reflective cursor glare tracking */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-20 mix-blend-screen opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 220px at ${glareX} ${glareY}, rgba(251, 191, 36, 0.12), rgba(255, 61, 51, 0.04), transparent 70%)`,
          }}
        />
      )}
    </div>
  );
}
