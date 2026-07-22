import React from 'react';
import * as Si from 'react-icons/si';
import * as Fa from 'react-icons/fa';

interface TechIconProps {
  name: string;
  className?: string;
  size?: number;
  iconUrl?: string;
}

export default function TechIcon({ name, className = '', size = 24, iconUrl }: TechIconProps) {
  const [imageError, setImageError] = React.useState(false);

  if (iconUrl && !imageError) {
    return (
      <img
        src={iconUrl}
        alt={name}
        className={className}
        style={{ width: size, height: size, objectFit: 'contain' }}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
      />
    );
  }

  const normName = name.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Color Map for Tech Stack containing official colors
  const colorMap: Record<string, string> = {
    typescript: '#3178C6',
    javascript: '#F7DF1E',
    javascriptes6: '#F7DF1E',
    html5: '#E34F26',
    html: '#E34F26',
    css3: '#1572B6',
    css: '#1572B6',
    react: '#61DAFB',
    reactjs: '#61DAFB',
    reactnative: '#61DAFB',
    nextjs: 'var(--color-brand-adaptive)',
    tailwindcss: '#06B6D4',
    tailwind: '#06B6D4',
    bootstrap: '#7952B3',
    framermotion: '#0055FF',
    gsap: '#88CE02',
    threejs: 'var(--color-brand-adaptive)',
    nodejs: '#339933',
    express: 'var(--color-brand-adaptive)',
    expressjs: 'var(--color-brand-adaptive)',
    python: '#3776AB',
    django: '#092E20',
    mongodb: '#47A248',
    supabase: '#3ECF8E',
    firebase: '#FFCA28',
    mysql: '#4479A1',
    c: '#A8B9CC',
    cplusplus: '#00599C',
    cpp: '#00599C',
    expo: 'var(--color-brand-adaptive)',
    openaiapi: '#10A37F',
    openai: '#10A37F',
    gemini: '#F5B942',
    googlegeminiapi: '#F5B942',
    vercel: 'var(--color-brand-adaptive)',
    render: '#46E3B7',
    netlify: '#00C8AC',
    git: '#F05032',
    github: 'var(--color-brand-adaptive)',
    githubpages: 'var(--color-brand-adaptive)',
    vscode: '#007ACC',
    postman: '#FF6C37',
    figma: '#F24E1E',
    npm: '#CB3837',
    yarn: '#2C8EBB',
    eslint: '#4B32C3',
    prettier: '#F7B93E',
    docker: '#2496ED',
    redis: '#DC382D',
    aws: '#FF9900',
    responsivewebdesign: '#E8332A',
    responsivedesign: '#E8332A',
    aichat: '#F5B942',
    rag: '#E8332A',
    realtime: '#F5B942',
    glassmorphism: '#61DAFB',
    accessibility: '#1572B6',
    darklight: '#F5B942',
    cicd: '#0055FF',
    jwt: '#4B32C3',
    jwtauthentication: '#4B32C3',
    vite: '#646CFF',
    shadcnui: 'var(--color-brand-adaptive)',
    shadcn: 'var(--color-brand-adaptive)',
    groq: '#F5B942',
    groqapi: '#F5B942',
    promptengineering: '#3ECF8E',
    restapis: '#F05032',
    api: '#F05032',
  };

  const matchedColor = colorMap[normName] || 'currentColor';

  // Custom Gemini Icon
  if (normName === 'gemini' || normName === 'googlegeminiapi') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        style={{ color: matchedColor }}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2C12 2 12.5 7.5 14.5 9.5C16.5 11.5 22 12 22 12C22 12 16.5 12.5 14.5 14.5C12.5 16.5 12 22 12 22C12 22 11.5 16.5 9.5 14.5C7.5 12.5 2 12 2 12C2 12 7.5 11.5 9.5 9.5C11.5 7.5 12 2 12 2Z" />
        <path d="M19 6C19 6 19.2 8.2 20 9C20.8 9.8 23 10 23 10C23 10 20.8 10.2 20 11C19.2 11.8 19 14 19 14C19 14 18.8 11.8 18 11C17.2 10.2 15 10 15 10C15 10 17.2 9.8 18 9C18.8 8.2 19 6 19 6Z" opacity="0.7" />
      </svg>
    );
  }

  // Custom OpenAI Icon
  if (normName === 'openai' || normName === 'openaiapi') {
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        style={{ color: matchedColor }}
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M22.5 12.5c0-1.58-.8-2.95-2.02-3.76.46-1.16.32-2.5-.45-3.52s-2.07-1.42-3.26-1.12c-.8-1.34-2.22-2.1-3.77-2.1-1.55 0-2.97.76-3.77 2.1-1.19-.3-2.49.1-3.26 1.12s-.91 2.36-.45 3.52C4.3 9.55 3.5 10.92 3.5 12.5c0 1.58.8 2.95 2.02 3.76-.46 1.16-.32 2.5.45 3.52.77 1.02 2.07 1.42 3.26 1.12.8 1.34 2.22 2.1 3.77 2.1s2.97-.76 3.77-2.1c1.19.3 2.49-.1 3.26-1.12.77-1.02.91-2.36.45-3.52 1.22-.81 2.02-2.18 2.02-3.76z" opacity="0.15" />
        <path d="M21.1 11.2c-.3-.5-.7-.8-1.2-1 .1-.3.1-.6.1-.9 0-1-.5-2-1.4-2.5-.9-.5-2-.4-2.8.2-.3-.4-.7-.7-1.2-.9-.9-.4-2-.2-2.7.5-.4-.3-.8-.5-1.3-.5-.9 0-1.8.6-2.2 1.5-.5-.1-.9-.1-1.4.1-1 .4-1.6 1.4-1.6 2.4 0 .3.1.6.2.8-.5.2-.9.6-1.1 1.1-.6.9-.5 2 .2 2.7.1.3.1.6 0 .9 0 1 .5 2 1.4 2.5.5.3 1.1.4 1.7.4.4 0 .8-.1 1.1-.3.3.4.7.7 1.2.9.4.2.8.3 1.2.3.5 0 1-.1 1.5-.4.4.3.8.5 1.3.5.9 0 1.8-.6 2.2-1.5.5.1.9.1 1.4-.1 1-.4 1.6-1.4 1.6-2.4 0-.3-.1-.6-.2-.8.5-.2.9-.6 1.1-1.1.5-.8.4-1.9-.2-2.6zm-8.8 8.1c-.6 0-1.1-.3-1.4-.8l.1-.1 4.5-2.6c.2-.1.4-.4.4-.7v-5l2.1 1.2c.1.1.1.2.1.3v5.2c0 .8-.6 1.5-1.4 1.5zm-6.6-3.8c-.3-.5-.3-1.1 0-1.6l.1-.1 4.5-2.6c.2-.1.3-.4.3-.7V7.6l2.1-1.2c.1-.1.2-.1.3 0l4.5 2.6c.7.4 1 1.2.7 1.9l-.1.1-4.5 2.6c-.2.1-.3.4-.3.7v4.8l-2.1 1.2c-.1.1-.2.1-.3 0l-4.5-2.6c-.5-.3-.7-1-.7-1.5zm1.5-6.6c.3-.5.9-.8 1.5-.8h.1l4.5 2.6c.2.1.5.1.7 0l4.5-2.6c.1-.1.2-.1.3 0l2.1 1.2c.7.4.9 1.3.5 2l-.1.1-4.5 2.6c-.2.1-.5.1-.7 0v4.8l-2.1-1.2c-.1-.1-.1-.2-.1-.3V9.2l-4.5-2.6c-.4-.2-.8-.7-.8-1.3z" />
      </svg>
    );
  }

  // Icon mapping
  let IconComponent: React.ComponentType<{ className?: string; size?: number; style?: React.CSSProperties }> | null = null;

  try {
    switch (normName) {
      case 'typescript':
        IconComponent = Si.SiTypescript;
        break;
      case 'javascript':
      case 'javascriptes6':
        IconComponent = Si.SiJavascript;
        break;
      case 'java':
        IconComponent = Fa.FaJava;
        break;
      case 'python':
        IconComponent = Si.SiPython;
        break;
      case 'django':
        IconComponent = Si.SiDjango;
        break;
      case 'cplusplus':
      case 'cpp':
        IconComponent = Si.SiCplusplus;
        break;
      case 'c':
        IconComponent = Si.SiC;
        break;
      case 'html5':
      case 'html':
        IconComponent = Si.SiHtml5;
        break;
      case 'css3':
      case 'css':
        IconComponent = Fa.FaCss3Alt;
        break;
      case 'react':
      case 'reactjs':
      case 'reactnative':
        IconComponent = Si.SiReact;
        break;
      case 'nextjs':
        IconComponent = Si.SiNextdotjs;
        break;
      case 'tailwindcss':
      case 'tailwind':
        IconComponent = Si.SiTailwindcss;
        break;
      case 'bootstrap':
        IconComponent = Si.SiBootstrap;
        break;
      case 'framermotion':
        IconComponent = Si.SiFramer;
        break;
      case 'gsap':
        IconComponent = Si.SiGreensock;
        break;
      case 'threejs':
        IconComponent = Si.SiThreedotjs;
        break;
      case 'nodejs':
        IconComponent = Si.SiNodedotjs;
        break;
      case 'express':
      case 'expressjs':
        IconComponent = Si.SiExpress;
        break;
      case 'mongodb':
        IconComponent = Si.SiMongodb;
        break;
      case 'supabase':
        IconComponent = Si.SiSupabase;
        break;
      case 'firebase':
        IconComponent = Si.SiFirebase;
        break;
      case 'mysql':
        IconComponent = Si.SiMysql;
        break;
      case 'expo':
        IconComponent = Si.SiExpo;
        break;
      case 'openaiapi':
      case 'openai':
        IconComponent = Fa.FaBrain;
        break;
      case 'jwt':
      case 'jwtauthentication':
        IconComponent = Si.SiJsonwebtokens;
        break;
      case 'vite':
        IconComponent = Si.SiVite;
        break;
      case 'shadcnui':
      case 'shadcn':
        IconComponent = (Si as any).SiShadcnui || Fa.FaCode;
        break;
      case 'groq':
      case 'groqapi':
        IconComponent = (Si as any).SiGroq || Fa.FaBrain;
        break;
      case 'promptengineering':
        IconComponent = Fa.FaBrain;
        break;
      case 'restapis':
      case 'api':
        IconComponent = Fa.FaCloud;
        break;
      case 'git':
        IconComponent = Si.SiGit;
        break;
      case 'github':
      case 'githubpages':
        IconComponent = Si.SiGithub;
        break;
      case 'vercel':
        IconComponent = Si.SiVercel;
        break;
      case 'render':
        IconComponent = Si.SiRender;
        break;
      case 'netlify':
        IconComponent = Si.SiNetlify;
        break;
      case 'vscode':
        IconComponent = Fa.FaLaptopCode;
        break;
      case 'postman':
        IconComponent = Si.SiPostman;
        break;
      case 'figma':
        IconComponent = Si.SiFigma;
        break;
      case 'npm':
        IconComponent = Si.SiNpm;
        break;
      case 'yarn':
        IconComponent = Si.SiYarn;
        break;
      case 'eslint':
        IconComponent = Si.SiEslint;
        break;
      case 'prettier':
        IconComponent = Si.SiPrettier;
        break;
      case 'docker':
        IconComponent = Si.SiDocker;
        break;
      case 'redis':
        IconComponent = Si.SiRedis;
        break;
      case 'aws':
        IconComponent = Fa.FaAws;
        break;
      case 'responsivewebdesign':
      case 'responsivedesign':
        IconComponent = Fa.FaMobileAlt;
        break;
      case 'accessibility':
        IconComponent = Fa.FaUniversalAccess;
        break;
      default: {
        const siKey = `Si${name.charAt(0).toUpperCase()}${name.slice(1).replace(/[^a-zA-Z0-9]/g, '')}`;
        if (siKey in Si) {
          IconComponent = (Si as any)[siKey];
        } else {
          IconComponent = Fa.FaCode;
        }
      }
    }
  } catch {
    IconComponent = Fa.FaCode;
  }

  const RenderedIcon = IconComponent || Fa.FaCode;
  return <RenderedIcon className={className} size={size} style={{ color: matchedColor }} />;
}
