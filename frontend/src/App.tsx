import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './store/theme-store';

// Layout components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import TraceExplorer from './pages/TraceExplorer';
import TraceDetail from './pages/TraceDetail';
import ServiceInsights from './pages/ServiceInsights';
import ServiceMap from './pages/service-map/ServiceMap';
import TraceComparisonPage from './pages/comparison/TraceComparisonPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const { theme } = useTheme();
  
  // Apply theme class to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  // Set RTL direction
  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="traces" element={<TraceExplorer />} />
        <Route path="traces/:traceId" element={<TraceDetail />} />
        <Route path="services" element={<ServiceInsights />} />
        <Route path="services/:service" element={<ServiceInsights />} />
        <Route path="service-map" element={<ServiceMap />} />
        <Route path="comparison" element={<TraceComparisonPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default App;
