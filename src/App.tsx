import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LiveOpsDashboard } from './pages/LiveOpsDashboard';
import { CurbAnalyticsPage } from './pages/CurbAnalyticsPage';
import { PerformanceInsightsPage } from './pages/PerformanceInsightsPage';
import type { TimeRange, ZoneType } from './types';

function App() {
  const [timeRange, setTimeRange] = useState<TimeRange>('8h');
  const [selectedZones, setSelectedZones] = useState<ZoneType[]>(['All']);
  const [demoMode, setDemoMode] = useState(false);

  return (
    <BrowserRouter>
      <MainLayout
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        selectedZones={selectedZones}
        onZonesChange={setSelectedZones}
        demoMode={demoMode}
        onDemoModeChange={setDemoMode}
      >
        <Routes>
          <Route
            path="/"
            element={
              <LiveOpsDashboard
                timeRange={timeRange}
                selectedZones={selectedZones}
                demoMode={demoMode}
              />
            }
          />
          <Route
            path="/curb-analytics"
            element={
              <CurbAnalyticsPage
                timeRange={timeRange}
                selectedZones={selectedZones}
                demoMode={demoMode}
              />
            }
          />
          <Route
            path="/performance-insights"
            element={
              <PerformanceInsightsPage
                timeRange={timeRange}
                selectedZones={selectedZones}
                demoMode={demoMode}
              />
            }
          />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;


