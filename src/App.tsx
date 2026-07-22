import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import MainPortfolio from './components/MainPortfolio';
import StudioDashboard from './components/StudioDashboard';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/studio" element={<StudioDashboard />} />
          <Route path="/studio/login" element={<StudioDashboard />} />
          <Route path="*" element={<MainPortfolio />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
