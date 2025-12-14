import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioMetrics, ScenarioType } from '../../types';

interface ScenarioChartProps {
  scenarios: ScenarioMetrics[];
  selectedScenarios: ScenarioType[];
  showErrorBars: boolean;
}

// Group scenarios by vehicle count and filter by selected scenarios
function prepareChartData(
  scenarios: ScenarioMetrics[],
  selectedScenarios: ScenarioType[],
  showErrorBars: boolean
) {
  const vehicleCounts = [30, 35, 40, 45, 50];
  const scenarioLabels: Record<ScenarioType, string> = {
    Baseline: 'WOS',
    'Optimized Dispatch': 'W025',
    'Aggressive Enforcement': 'W050',
    'High Demand Event': 'W075',
  };

  const dataByVehicleCount: Record<
    number,
    Record<string, { value: number; error?: [number, number] }>
  > = {};

  vehicleCounts.forEach((count) => {
    dataByVehicleCount[count] = {};
  });

  scenarios
    .filter((s) => selectedScenarios.includes(s.scenario))
    .forEach((scenario) => {
      const label = scenarioLabels[scenario.scenario] || scenario.scenario;
      if (!dataByVehicleCount[scenario.vehicleCount]) {
        dataByVehicleCount[scenario.vehicleCount] = {};
      }
      dataByVehicleCount[scenario.vehicleCount][label] = {
        value: scenario.avgThroughput,
        error: showErrorBars && scenario.stdDev
          ? [scenario.avgThroughput - scenario.stdDev, scenario.avgThroughput + scenario.stdDev]
          : undefined,
      };
    });

  // Convert to array format for Recharts
  const chartData = vehicleCounts.map((count) => {
    const dataPoint: Record<string, number | [number, number]> = { vehicles: count };
    Object.entries(dataByVehicleCount[count]).forEach(([label, data]) => {
      dataPoint[label] = data.value;
      if (data.error) {
        dataPoint[`${label}_error`] = data.error;
      }
    });
    return dataPoint;
  });

  const series = selectedScenarios.map((scenario) => scenarioLabels[scenario] || scenario);

  return { chartData, series };
}

const COLORS = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#F97316'];

export function ScenarioChart({
  scenarios,
  selectedScenarios,
  showErrorBars,
}: ScenarioChartProps) {
  const { chartData, series } = useMemo(
    () => prepareChartData(scenarios, selectedScenarios, showErrorBars),
    [scenarios, selectedScenarios, showErrorBars]
  );

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-base font-semibold mb-2">Average Throughput vs Number of Vehicles</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} aria-label="Throughput vs vehicles chart">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="vehicles"
            label={{ value: 'Number of vehicles', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <YAxis
            label={{ value: 'Average throughput', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            stroke="#9CA3AF"
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '4px' }}
            labelStyle={{ color: '#D1D5DB' }}
          />
          <Legend />
          {series.map((serie, idx) => (
            <Line
              key={serie}
              type="monotone"
              dataKey={serie}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              name={serie}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

