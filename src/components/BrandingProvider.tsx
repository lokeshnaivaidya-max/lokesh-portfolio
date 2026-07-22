import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchMetadata,
  applyMetadata,
  getCachedMetadata,
  getCachedAvatarUrl,
  preloadBrandingAssets,
} from '../lib/supabase';

export interface BrandingData {
  logoUrl: string;
  faviconUrl: string;
  opengraphUrl: string;
  avatarUrl: string;
  isBrandingReady: boolean;
}

interface BrandingContextType extends BrandingData {
  refreshBranding: () => Promise<void>;
}

const defaultBranding: BrandingData = {
  logoUrl: '',
  faviconUrl: '',
  opengraphUrl: '',
  avatarUrl: '',
  isBrandingReady: false,
};

const BrandingContext = createContext<BrandingContextType>({
  ...defaultBranding,
  refreshBranding: async () => {},
});

/**
 * initBranding executes BEFORE createRoot.render() in main.tsx.
 * It immediately applies cached favicon to <head> to eliminate any favicon flash,
 * fetches fresh branding metadata from Supabase/Backend, applies <head> tags,
 * preloads the logo & favicon into browser cache, and returns the initialized branding data.
 */
export async function initBranding(timeoutMs = 2500): Promise<BrandingData> {
  if (typeof window === 'undefined') {
    return { ...defaultBranding, isBrandingReady: true };
  }

  // 1. Immediately inject cached favicon & opengraph into document <head>
  const cached = getCachedMetadata();
  const cachedAvatar = getCachedAvatarUrl();
  applyMetadata(cached.logo, cached.favicon, cached.opengraph);

  // 2. Fetch fresh metadata & preload branding images with safety timeout
  const fetchPromise = (async (): Promise<BrandingData> => {
    try {
      const meta = await fetchMetadata().catch(() => cached);

      const logoUrl = meta.logo || cached.logo;
      const faviconUrl = meta.favicon || cached.favicon;
      const opengraphUrl = meta.opengraph || cached.opengraph;
      const avatarUrl = cachedAvatar;

      // Apply fresh favicon immediately to <head>
      applyMetadata(logoUrl, faviconUrl, opengraphUrl);

      // Preload branding assets (logo, favicon) into browser cache before rendering
      await preloadBrandingAssets({ logo: logoUrl, favicon: faviconUrl }, avatarUrl);

      return {
        logoUrl,
        faviconUrl,
        opengraphUrl,
        avatarUrl,
        isBrandingReady: true,
      };
    } catch (err) {
      console.warn('Branding initialization fallback to local cache:', err);
      return {
        logoUrl: cached.logo,
        faviconUrl: cached.favicon,
        opengraphUrl: cached.opengraph,
        avatarUrl: cachedAvatar,
        isBrandingReady: true,
      };
    }
  })();

  // Safety timeout wrapper so user is never blocked if network is slow
  const timeoutPromise = new Promise<BrandingData>((resolve) => {
    setTimeout(() => {
      resolve({
        logoUrl: cached.logo,
        faviconUrl: cached.favicon,
        opengraphUrl: cached.opengraph,
        avatarUrl: cachedAvatar,
        isBrandingReady: true,
      });
    }, timeoutMs);
  });

  return Promise.race([fetchPromise, timeoutPromise]);
}

export function BrandingProvider({
  children,
  initialBranding,
}: {
  children: React.ReactNode;
  initialBranding?: BrandingData;
}) {
  const [branding, setBranding] = useState<BrandingData>(() => {
    if (initialBranding) return initialBranding;
    const cached = getCachedMetadata();
    const avatar = getCachedAvatarUrl();
    return {
      logoUrl: cached.logo,
      faviconUrl: cached.favicon,
      opengraphUrl: cached.opengraph,
      avatarUrl: avatar,
      isBrandingReady: !!(cached.favicon || cached.logo),
    };
  });

  const refreshBranding = async () => {
    try {
      const fresh = await initBranding(5000);
      setBranding(fresh);
    } catch (err) {
      console.error('Failed to refresh branding:', err);
    }
  };

  useEffect(() => {
    if (!branding.isBrandingReady) {
      initBranding().then((data) => setBranding(data));
    } else {
      applyMetadata(branding.logoUrl, branding.faviconUrl, branding.opengraphUrl);
    }
  }, []);

  return (
    <BrandingContext.Provider value={{ ...branding, refreshBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
