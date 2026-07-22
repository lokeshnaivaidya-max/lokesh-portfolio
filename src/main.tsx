import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrandingProvider, initBranding } from './components/BrandingProvider.tsx';

async function startApp() {
  // Fetch branding metadata (favicon, logo) & preload images BEFORE rendering
  const initialBranding = await initBranding();

  const container = document.getElementById('root');
  if (container) {
    createRoot(container).render(
      <StrictMode>
        <BrandingProvider initialBranding={initialBranding}>
          <App />
        </BrandingProvider>
      </StrictMode>,
    );
  }
}

startApp();

