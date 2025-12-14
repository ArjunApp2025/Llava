import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ScenarioMetrics, ScenarioType } from '../../types';

interface ScenarioComparisonChartProps {
  scenarios: ScenarioMetrics[];
  selectedScenarios: ScenarioType[];
  vehicleCount: number;
}

export function ScenarioComparisonChart({
  scenarios,
  selectedScenarios,
  vehicleCount,
}: ScenarioComparisonChartProps) {
  const chartData = useMemo(() => {
    const scenarioLabels: Record<string, string> = {
      'Baseline': 'Baseline',
      'Optimized Dispatch': 'Optimized',
      'Aggressive Enforcement': 'Enforcement',
      'High Demand Event': 'High Demand',
    };
    
    return selectedScenarios.map((scenarioType) => {
      const scenarioData = scenarios.find(
        (s) => s.scenario === scenarioType && s.vehicleCount === vehicleCount
      );
      if (!scenarioData) {
        return {
          scenario: scenarioLabels[scenarioType] || scenarioType,
          slaCompliance: 0,
          avgDwell: 0,
          occupancy: 0,
        };
      }
      return {
        scenario: scenarioLabels[scenarioType] || scenarioType,
        slaCompliance: Math.round(scenarioData.slaCompliancePct),
        avgDwell: Math.round(scenarioData.avgDwellSec),
        occupancy: Math.round(scenarioData.occupancyPct),
      };
    });
  }, [scenarios, selectedScenarios, vehicleCount]);

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-base font-semibold mb-2">Scenario Comparison</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData} aria-label="Scenario comparison chart">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="scenario" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="left" stroke="#9CA3AF" label={{ value: 'SLA % / Occupancy %', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" label={{ value: 'Avg Dwell (sec)', angle: 90, position: 'insideRight', fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '4px' }}
            labelStyle={{ color: '#D1D5DB' }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="slaCompliance" fill="#10B981" name="SLA Compliance %" />
          <Bar yAxisId="left" dataKey="occupancy" fill="#3B82F6" name="Occupancy %" />
          <Bar yAxisId="right" dataKey="avgDwell" fill="#F59E0B" name="Avg Dwell (sec)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

