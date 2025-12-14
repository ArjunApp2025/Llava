import React, { useState, useMemo } from 'react';
import { useITFMetrics } from '../hooks/useITFMetrics';
import { ScenarioChart } from '../components/performance/ScenarioChart';
import { ScenarioComparisonChart } from '../components/performance/ScenarioComparisonChart';
import { ScenarioSummaryTable } from '../components/performance/ScenarioSummaryTable';
import { Dropdown } from '../components/common/Dropdown';
import { Toggle } from '../components/common/Toggle';
import type { TimeRange, ZoneType, ScenarioType } from '../types';

interface PerformanceInsightsPageProps {
  timeRange: TimeRange;
  selectedZones: ZoneType[];
  demoMode: boolean;
}

export function PerformanceInsightsPage({
  timeRange,
  selectedZones,
  demoMode,
}: PerformanceInsightsPageProps) {
  const { simulationScenarios } = useITFMetrics({
    timeRange,
    selectedZones,
    demoMode,
  });

  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('Baseline');
  const [vehicleCount, setVehicleCount] = useState(40);
  const [showErrorBars, setShowErrorBars] = useState(false);

  // For multi-scenario comparison, allow selecting multiple scenarios
  const [selectedScenarios, setSelectedScenarios] = useState<ScenarioType[]>([
    'Baseline',
    'Optimized Dispatch',
    'Aggressive Enforcement',
    'High Demand Event',
  ]);

  const scenarioOptions = [
    { value: 'Baseline', label: 'Baseline' },
    { value: 'Optimized Dispatch', label: 'Optimized Dispatch' },
    { value: 'Aggressive Enforcement', label: 'Aggressive Enforcement' },
    { value: 'High Demand Event', label: 'High Demand Event' },
  ];

  const vehicleCountOptions = [
    { value: '30', label: '30 vehicles' },
    { value: '35', label: '35 vehicles' },
    { value: '40', label: '40 vehicles' },
    { value: '45', label: '45 vehicles' },
    { value: '50', label: '50 vehicles' },
  ];

  const handleScenarioToggle = (scenario: ScenarioType) => {
    setSelectedScenarios((prev) => {
      if (prev.includes(scenario)) {
        return prev.filter((s) => s !== scenario);
      } else {
        return [...prev, scenario];
      }
    });
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Compare Scenarios</label>
            <div className="space-y-2">
              {scenarioOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedScenarios.includes(option.value as ScenarioType)}
                    onChange={() => handleScenarioToggle(option.value as ScenarioType)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Dropdown
              label="Vehicle Count"
              options={vehicleCountOptions}
              value={vehicleCount.toString()}
              onChange={(value) => setVehicleCount(parseInt(value, 10))}
            />
          </div>
          <div>
            <Toggle
              label="Show Error Bars"
              checked={showErrorBars}
              onChange={setShowErrorBars}
            />
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <ScenarioChart
        scenarios={simulationScenarios}
        selectedScenarios={selectedScenarios}
        showErrorBars={showErrorBars}
      />

      {/* Secondary Charts and Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ScenarioComparisonChart
          scenarios={simulationScenarios}
          selectedScenarios={selectedScenarios}
          vehicleCount={vehicleCount}
        />
        <ScenarioSummaryTable
          scenarios={simulationScenarios}
          selectedScenarios={selectedScenarios}
          vehicleCount={vehicleCount}
        />
      </div>
    </div>
  );
}

