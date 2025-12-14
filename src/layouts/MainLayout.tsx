import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCurrentTime } from '../hooks/useCurrentTime';
import { Toggle } from '../components/common/Toggle';
import { Dropdown } from '../components/common/Dropdown';
import { MultiSelect } from '../components/common/MultiSelect';
import type { TimeRange, ZoneType } from '../types';

export interface MainLayoutProps {
  children: React.ReactNode;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  selectedZones: ZoneType[];
  onZonesChange: (zones: ZoneType[]) => void;
  demoMode: boolean;
  onDemoModeChange: (enabled: boolean) => void;
}

export function MainLayout({
  children,
  timeRange,
  onTimeRangeChange,
  selectedZones,
  onZonesChange,
  demoMode,
  onDemoModeChange,
}: MainLayoutProps) {
  const location = useLocation();
  const currentTime = useCurrentTime();

  const timeRangeOptions = [
    { value: '1h', label: 'Last 1h' },
    { value: '4h', label: 'Last 4h' },
    { value: '8h', label: 'Last 8h' },
    { value: '24h', label: 'Last 24h' },
  ];

  const zoneOptions = [
    { value: 'All', label: 'All' },
    { value: 'Pickup', label: 'Pickup' },
    { value: 'Dropoff', label: 'Dropoff' },
    { value: 'ADA', label: 'ADA' },
    { value: 'Shuttle', label: 'Shuttle' },
    { value: 'Rideshare', label: 'Rideshare' },
  ];

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Top App Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">
              LAWA
            </div>
            <div>
              <h1 className="text-xl font-semibold">LAWA – ITF Curbside Performance</h1>
              <p className="text-sm text-gray-400">Operations Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-gray-300">
              <span className="text-gray-500">Time:</span> {formatDateTime(currentTime)}
            </div>
            <div className="flex items-center gap-3">
              <Dropdown
                options={timeRangeOptions}
                value={timeRange}
                onChange={(value) => onTimeRangeChange(value as TimeRange)}
                className="w-32"
              />
              <MultiSelect
                options={zoneOptions}
                selected={selectedZones}
                onChange={(zones) => onZonesChange(zones as ZoneType[])}
                className="w-40"
              />
              <Toggle
                label="Demo Mode"
                checked={demoMode}
                onChange={onDemoModeChange}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <nav className="bg-gray-800 border-r border-gray-700 w-64 flex-shrink-0 p-4">
          <ul className="space-y-2" role="navigation" aria-label="Main navigation">
            <li>
              <Link
                to="/"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive('/')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={isActive('/') ? 'page' : undefined}
              >
                Live Ops
              </Link>
            </li>
            <li>
              <Link
                to="/curb-analytics"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive('/curb-analytics')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={isActive('/curb-analytics') ? 'page' : undefined}
              >
                Curb Analytics
              </Link>
            </li>
            <li>
              <Link
                to="/performance-insights"
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  isActive('/performance-insights')
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={isActive('/performance-insights') ? 'page' : undefined}
              >
                Performance Insights
              </Link>
            </li>
          </ul>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6" role="main">
          {children}
        </main>
      </div>
    </div>
  );
}


