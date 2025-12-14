import React, { useState, useMemo } from 'react';
import { useITFMetrics } from '../hooks/useITFMetrics';
import { KpiCard } from '../components/common/KpiCard';
import { PillChip } from '../components/common/PillChip';
import { ZoneMap } from '../components/liveops/ZoneMap';
import { DwellHistogram } from '../components/liveops/DwellHistogram';
import { ThroughputTrend } from '../components/liveops/ThroughputTrend';
import { SlaCompliance } from '../components/liveops/SlaCompliance';
import { AlertsTable } from '../components/liveops/AlertsTable';
import type { TimeRange, ZoneType, RiskLevel } from '../types';

interface LiveOpsDashboardProps {
  timeRange: TimeRange;
  selectedZones: ZoneType[];
  demoMode: boolean;
}

const SLA_SEC = 90;

export function LiveOpsDashboard({ timeRange, selectedZones, demoMode }: LiveOpsDashboardProps) {
  const { zones, timeSeries, alerts, allZones } = useITFMetrics({
    timeRange,
    selectedZones,
    demoMode,
  });

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Calculate KPIs
  const kpis = useMemo(() => {
    if (zones.length === 0) {
      return {
        avgDwell: 0,
        slaCompliance: 0,
        throughput: 0,
        occupancy: 0,
        unattendedAlerts: 0,
        delayRisk: 'Low' as RiskLevel,
      };
    }

    // Avg Vehicle Dwell = mean(exitTs - entryTs) across vehicles in the time window
    const avgDwell = zones.reduce((sum, z) => sum + z.avgDwellSec, 0) / zones.length;

    // Throughput (veh/hr) = vehiclesProcessed / hoursInWindow
    const hoursInWindow = timeRange === '1h' ? 1 : timeRange === '4h' ? 4 : timeRange === '8h' ? 8 : 24;
    const totalThroughput = zones.reduce((sum, z) => sum + z.vehiclesPerHour, 0);
    const throughput = totalThroughput / zones.length;

    // Curb Occupancy % = occupiedSpotTime / totalSpotTime * 100
    const occupancy = zones.reduce((sum, z) => sum + z.occupancyPct, 0) / zones.length;

    // SLA Compliance % = count(dwellSec <= SLA_SEC) / totalVehicles * 100
    const slaCompliance = zones.reduce((sum, z) => sum + z.slaCompliancePct, 0) / zones.length;

    // Unattended Rate
    const unattendedAlerts = zones.reduce((sum, z) => sum + z.unattendedAlerts, 0);

    // Passenger Service Delay Risk
    // score = (avgDwell / SLA_SEC) * 0.5 + (occupancyPct / 100) * 0.3 + (breachRatePct / 100) * 0.2
    const breachRatePct = 100 - slaCompliance;
    const score =
      (avgDwell / SLA_SEC) * 0.5 + (occupancy / 100) * 0.3 + (breachRatePct / 100) * 0.2;

    let delayRisk: RiskLevel = 'Low';
    if (score >= 0.85) delayRisk = 'High';
    else if (score >= 0.6) delayRisk = 'Med';

    return {
      avgDwell,
      slaCompliance,
      throughput,
      occupancy,
      unattendedAlerts,
      delayRisk,
    };
  }, [zones, timeRange]);

  const getRiskColor = (risk: RiskLevel): 'green' | 'amber' | 'red' => {
    switch (risk) {
      case 'Low':
        return 'green';
      case 'Med':
        return 'amber';
      case 'High':
        return 'red';
    }
  };

  const handleZoneClick = (zoneId: string) => {
    setSelectedZoneId(selectedZoneId === zoneId ? null : zoneId);
  };

  const handleZoneFocus = (zoneId: string | null) => {
    // Optional: handle focus for keyboard navigation
  };

  // Filter zones for charts based on selected zone
  const filteredZonesForCharts = selectedZoneId
    ? zones.filter((z) => z.id === selectedZoneId)
    : zones;

  return (
    <div className="space-y-4">
      {/* Compact KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          title="Avg Dwell Time"
          value={`${kpis.avgDwell.toFixed(1)}s`}
          subtitle="< 90s target"
          className="text-sm"
        />
        <KpiCard
          title="SLA Compliance"
          value={`${kpis.slaCompliance.toFixed(1)}%`}
          subtitle="> 90% target"
          className="text-sm"
        />
        <KpiCard
          title="Throughput"
          value={`${kpis.throughput.toFixed(0)}`}
          subtitle="veh/hr"
          className="text-sm"
        />
        <KpiCard
          title="Occupancy"
          value={`${kpis.occupancy.toFixed(1)}%`}
          subtitle="utilization"
          className="text-sm"
        />
        <KpiCard
          title="Alerts"
          value={kpis.unattendedAlerts}
          subtitle="today"
          className="text-sm"
        />
        <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
          <div className="text-xs text-gray-400 mb-1">Delay Risk</div>
          <div className="flex items-center gap-2">
            <PillChip label={kpis.delayRisk} color={getRiskColor(kpis.delayRisk)} />
          </div>
        </div>
      </div>

      {/* Main Content: Curb Zone Map as Highlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Large Curb Zone Map - Highlight Feature */}
        <div className="lg:col-span-8">
          <ZoneMap
            zones={allZones}
            selectedZoneId={selectedZoneId}
            onZoneClick={handleZoneClick}
            onZoneFocus={handleZoneFocus}
          />
        </div>

        {/* Right: Vehicle Dwell Time Distribution */}
        <div className="lg:col-span-4 space-y-4">
          <DwellHistogram zones={filteredZonesForCharts} />
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SlaCompliance zones={filteredZonesForCharts} />
        <ThroughputTrend timeSeries={timeSeries} />
      </div>

      {/* Alerts Section */}
      <div>
        <AlertsTable
          alerts={alerts}
          selectedZoneId={selectedZoneId}
          onAlertClick={handleZoneClick}
        />
      </div>
    </div>
  );
}
