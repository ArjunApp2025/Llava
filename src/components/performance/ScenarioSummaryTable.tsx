import { useMemo } from 'react';
import type { ScenarioMetrics, ScenarioType, RiskLevel } from '../../types';
import { PillChip } from '../common/PillChip';

interface ScenarioSummaryTableProps {
  scenarios: ScenarioMetrics[];
  selectedScenarios: ScenarioType[];
  vehicleCount: number;
}

const SLA_SEC = 90;

function calculateRiskLevel(scenario: ScenarioMetrics): RiskLevel {
  const breachRatePct = 100 - scenario.slaCompliancePct;
  const score =
    (scenario.avgDwellSec / SLA_SEC) * 0.5 +
    (scenario.occupancyPct / 100) * 0.3 +
    (breachRatePct / 100) * 0.2;

  if (score >= 0.85) return 'High';
  if (score >= 0.6) return 'Med';
  return 'Low';
}

function getRiskColor(risk: RiskLevel): 'green' | 'amber' | 'red' {
  switch (risk) {
    case 'Low':
      return 'green';
    case 'Med':
      return 'amber';
    case 'High':
      return 'red';
  }
}

export function ScenarioSummaryTable({
  scenarios,
  selectedScenarios,
  vehicleCount,
}: ScenarioSummaryTableProps) {
  const tableData = useMemo(() => {
    return selectedScenarios
      .map((scenarioType) => {
        const scenario = scenarios.find(
          (s) => s.scenario === scenarioType && s.vehicleCount === vehicleCount
        );
        if (!scenario) return null;

        const risk = calculateRiskLevel(scenario);
        return {
          scenario: scenarioType,
          avgThroughput: scenario.avgThroughput,
          avgDwell: scenario.avgDwellSec,
          slaCompliance: scenario.slaCompliancePct,
          occupancy: scenario.occupancyPct,
          risk,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [scenarios, selectedScenarios, vehicleCount]);

  const insights = useMemo(() => {
    if (tableData.length === 0) return [];

    const maxThroughput = tableData.reduce((max, item) =>
      item.avgThroughput > max.avgThroughput ? item : max
    );
    const bestSla = tableData.reduce((best, item) =>
      item.slaCompliance > best.slaCompliance ? item : best
    );
    const lowestRisk = tableData.reduce((lowest, item) => {
      const riskOrder = { Low: 0, Med: 1, High: 2 };
      return riskOrder[item.risk] < riskOrder[lowest.risk] ? item : lowest;
    });

    const insightsList: string[] = [];

    insightsList.push(
      `"${maxThroughput.scenario}" max throughput: ${Math.round(maxThroughput.avgThroughput)} veh/hr`
    );
    insightsList.push(
      `"${bestSla.scenario}" best SLA: ${Math.round(bestSla.slaCompliance)}%`
    );

    if (maxThroughput.scenario !== lowestRisk.scenario) {
      insightsList.push(
        `Tradeoff: Higher throughput (${maxThroughput.scenario}) but higher delay risk (${lowestRisk.scenario} has lower risk)`
      );
    }

    return insightsList;
  }, [tableData]);

  return (
    <div className="space-y-3">
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <h3 className="text-base font-semibold mb-2">Scenario Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" role="table" aria-label="Scenario summary table">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-1.5 px-2 text-gray-400 font-semibold text-xs">Scenario</th>
                <th className="text-right py-1.5 px-2 text-gray-400 font-semibold text-xs">Throughput</th>
                <th className="text-right py-1.5 px-2 text-gray-400 font-semibold text-xs">Dwell</th>
                <th className="text-right py-1.5 px-2 text-gray-400 font-semibold text-xs">SLA %</th>
                <th className="text-right py-1.5 px-2 text-gray-400 font-semibold text-xs">Occupancy</th>
                <th className="text-left py-1.5 px-2 text-gray-400 font-semibold text-xs">Risk</th>
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500 text-xs">
                    No data available
                  </td>
                </tr>
              ) : (
                tableData.map((row) => (
                  <tr key={row.scenario} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-1.5 px-2 font-medium text-xs">{row.scenario}</td>
                    <td className="py-1.5 px-2 text-right text-xs">{Math.round(row.avgThroughput)}</td>
                    <td className="py-1.5 px-2 text-right text-xs">{Math.round(row.avgDwell)}s</td>
                    <td className="py-1.5 px-2 text-right text-xs">{Math.round(row.slaCompliance)}%</td>
                    <td className="py-1.5 px-2 text-right text-xs">{Math.round(row.occupancy)}%</td>
                    <td className="py-1.5 px-2">
                      <PillChip label={row.risk} color={getRiskColor(row.risk)} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
          <h4 className="font-semibold mb-1 text-xs">Insights</h4>
          <ul className="space-y-1 text-xs text-gray-300">
            {insights.map((insight, idx) => (
              <li key={idx}>• {insight}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

