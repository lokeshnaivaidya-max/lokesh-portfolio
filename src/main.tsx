import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { applyMetadata } from './lib/supabase.ts';

// Immediately apply cached metadata (favicon, opengraph) on initial script evaluation
applyMetadata();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
