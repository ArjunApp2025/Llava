import { useState, useEffect, useCallback } from 'react';
import type {
  ZoneMetric,
  TimeSeriesPoint,
  AlertItem,
  CurbUseBlock,
  ScenarioMetrics,
  ZoneType,
  TimeRange,
  VehicleEvent,
} from '../types';

// Seeded Linear Congruential Generator for deterministic randomness
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  rand(): number {
    // LCG: (a * seed + c) mod m
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32;
    return this.seed / 2 ** 32;
  }

  reset(seed: number = 12345): void {
    this.seed = seed;
  }
}

const rng = new SeededRandom(12345);

// Constants
const SLA_SEC = 90;
const ZONES: ZoneType[] = ['Pickup', 'Dropoff', 'ADA', 'Shuttle', 'Rideshare'];
const CURB_USE_TYPES: CurbUseBlock['curbUseType'][] = [
  'Driveway',
  'Always No Parking',
  'Currently No Parking',
  'Loading Zone',
  'Free',
  'Residential Permit',
  'Paid Parking',
  'Other Permits',
];

// Generate initial mock data
function generateInitialZones(): ZoneMetric[] {
  return ZONES.map((name, idx) => {
    const baseDwell = 45 + idx * 10 + rng.rand() * 20;
    const baseOccupancy = 30 + idx * 15 + rng.rand() * 20;
    const baseThroughput = 80 + idx * 20 + rng.rand() * 30;
    const baseSla = 85 + rng.rand() * 10;
    const baseAlerts = Math.floor(rng.rand() * 5);

    let slaStatus: ZoneMetric['slaStatus'] = 'within';
    if (baseSla < 80) slaStatus = 'breach';
    else if (baseSla < 90) slaStatus = 'approaching';

    return {
      id: `zone-${idx}`,
      name,
      avgDwellSec: baseDwell,
      occupancyPct: baseOccupancy,
      vehiclesPerHour: baseThroughput,
      slaCompliancePct: baseSla,
      unattendedAlerts: baseAlerts,
      slaStatus,
      currentVehicles: Math.floor(baseOccupancy / 10),
    };
  });
}

function generateInitialTimeSeries(timeRange: TimeRange): TimeSeriesPoint[] {
  const hours = timeRange === '1h' ? 1 : timeRange === '4h' ? 4 : timeRange === '8h' ? 8 : 24;
  const points: TimeSeriesPoint[] = [];
  const now = new Date();
  const intervalMinutes = 15;

  for (let i = hours * 4 - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
    points.push({
      timestamp,
      avgDwellSec: 50 + rng.rand() * 40 + Math.sin(i * 0.1) * 10,
      throughputVehPerHr: 100 + rng.rand() * 50 + Math.cos(i * 0.15) * 20,
      occupancyPct: 40 + rng.rand() * 30 + Math.sin(i * 0.2) * 15,
    });
  }

  return points;
}

function generateInitialAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];
  const types: AlertItem['type'][] = ['Unattended Vehicle', 'Overstay', 'Spillback Risk'];
  const actions = [
    'Dispatch curb marshal',
    'Open overflow lane',
    'Send passenger advisory',
    'Activate dynamic pricing',
    'Redirect to alternate zone',
  ];
  const statuses: AlertStatus[] = ['New', 'Acknowledged', 'Closed'];

  for (let i = 0; i < 12; i++) {
    const type = types[Math.floor(rng.rand() * types.length)];
    const zone = ZONES[Math.floor(rng.rand() * ZONES.length)];
    const timestamp = new Date(Date.now() - rng.rand() * 3600000 * 2);
    alerts.push({
      id: `alert-${i}`,
      type,
      timestamp,
      zone,
      dwellDurationSec: 60 + rng.rand() * 120,
      recommendedAction: actions[Math.floor(rng.rand() * actions.length)],
      status: statuses[Math.floor(rng.rand() * statuses.length)],
      zoneId: `zone-${ZONES.indexOf(zone)}`,
    });
  }

  return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function generateInitialCurbBlocks(): CurbUseBlock[] {
  const streets = ['McAllister St', 'Van Ness Ave', 'Redwood St', 'Golden Gate Ave'];
  const crossStreets = ['Franklin St', 'Van Ness Avenue', 'Polk St', 'Larkin St'];
  const blocks: CurbUseBlock[] = [];

  let blockId = 0;
  streets.forEach((street, streetIdx) => {
    for (let i = 0; i < 3; i++) {
      const startPos = i * 150 + rng.rand() * 50;
      const endPos = startPos + 100 + rng.rand() * 50;
      blocks.push({
        id: `block-${blockId++}`,
        streetName: street,
        startPositionFt: startPos,
        endPositionFt: endPos,
        curbUseType: CURB_USE_TYPES[Math.floor(rng.rand() * CURB_USE_TYPES.length)],
        capacity: 2 + Math.floor(rng.rand() * 6),
        currentAvailabilityPct: rng.rand() * 100,
        predictedOccupancyLevel: rng.rand() < 0.33 ? 'LOW' : rng.rand() < 0.66 ? 'MED' : 'HIGH',
        fromStreet: crossStreets[streetIdx % crossStreets.length],
        toStreet: crossStreets[(streetIdx + 1) % crossStreets.length],
      });
    }
  });

  return blocks;
}

function generateScenarioMetrics(): ScenarioMetrics[] {
  const scenarios: ScenarioMetrics['scenario'][] = [
    'Baseline',
    'Optimized Dispatch',
    'Aggressive Enforcement',
    'High Demand Event',
  ];
  const vehicleCounts = [30, 35, 40, 45, 50];
  const metrics: ScenarioMetrics[] = [];

  scenarios.forEach((scenario) => {
    vehicleCounts.forEach((vehicleCount) => {
      // Different scenarios have different performance characteristics
      let baseThroughput = 130;
      let baseDwell = 60;
      let baseSla = 85;
      let baseOccupancy = 50;

      if (scenario === 'Optimized Dispatch') {
        baseThroughput = 140 + vehicleCount * 0.4;
        baseDwell = 55;
        baseSla = 90;
      } else if (scenario === 'Aggressive Enforcement') {
        baseThroughput = 135 + vehicleCount * 0.3;
        baseDwell = 50;
        baseSla = 92;
        baseOccupancy = 45;
      } else if (scenario === 'High Demand Event') {
        baseThroughput = 145 + vehicleCount * 0.5;
        baseDwell = 70;
        baseSla = 75;
        baseOccupancy = 70;
      } else {
        // Baseline
        baseThroughput = 130 + vehicleCount * 0.35;
        baseDwell = 60;
      }

      // Peak around 40 vehicles for most scenarios
      const peakFactor = vehicleCount === 40 ? 1.1 : vehicleCount < 40 ? 0.95 + (vehicleCount - 30) * 0.01 : 1.05 - (vehicleCount - 40) * 0.01;

      metrics.push({
        scenario,
        vehicleCount,
        avgThroughput: baseThroughput * peakFactor + (rng.rand() - 0.5) * 5,
        avgDwellSec: baseDwell + (rng.rand() - 0.5) * 10,
        slaCompliancePct: baseSla + (rng.rand() - 0.5) * 5,
        occupancyPct: baseOccupancy + (rng.rand() - 0.5) * 10,
        stdDev: 2 + rng.rand() * 3,
      });
    });
  });

  return metrics;
}

export interface UseITFMetricsOptions {
  timeRange: TimeRange;
  selectedZones: ZoneType[];
  demoMode: boolean;
}

export function useITFMetrics(options: UseITFMetricsOptions) {
  const { timeRange, selectedZones, demoMode } = options;

  const [zones, setZones] = useState<ZoneMetric[]>(() => {
    rng.reset(12345);
    return generateInitialZones();
  });

  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>(() => {
    rng.reset(12345);
    return generateInitialTimeSeries(timeRange);
  });

  const [alerts, setAlerts] = useState<AlertItem[]>(() => {
    rng.reset(12345);
    return generateInitialAlerts();
  });

  const [curbUseBlocks, setCurbUseBlocks] = useState<CurbUseBlock[]>(() => {
    rng.reset(12345);
    return generateInitialCurbBlocks();
  });

  const [simulationScenarios, setSimulationScenarios] = useState<ScenarioMetrics[]>(() => {
    rng.reset(12345);
    return generateScenarioMetrics();
  });

  // Perturb data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const volatility = demoMode ? 1.5 : 1.0;

      // Update zones
      setZones((prev) =>
        prev.map((zone) => {
          const change = (rng.rand() - 0.5) * volatility;
          const newDwell = Math.max(20, zone.avgDwellSec + change * 5);
          const newOccupancy = Math.max(0, Math.min(100, zone.occupancyPct + change * 3));
          const newThroughput = Math.max(50, zone.vehiclesPerHour + change * 5);
          const newSla = Math.max(0, Math.min(100, zone.slaCompliancePct + change * 2));
          const newAlerts = Math.max(0, zone.unattendedAlerts + (rng.rand() < 0.1 ? (demoMode ? 2 : 1) : 0));

          let slaStatus: ZoneMetric['slaStatus'] = 'within';
          if (newSla < 80) slaStatus = 'breach';
          else if (newSla < 90) slaStatus = 'approaching';

          return {
            ...zone,
            avgDwellSec: newDwell,
            occupancyPct: newOccupancy,
            vehiclesPerHour: newThroughput,
            slaCompliancePct: newSla,
            unattendedAlerts: newAlerts,
            slaStatus,
            currentVehicles: Math.floor(newOccupancy / 10),
          };
        })
      );

      // Update time series - add new point
      setTimeSeries((prev) => {
        const newPoint: TimeSeriesPoint = {
          timestamp: new Date(),
          avgDwellSec: 50 + rng.rand() * 40 + Math.sin(Date.now() * 0.0001) * 10,
          throughputVehPerHr: 100 + rng.rand() * 50 + Math.cos(Date.now() * 0.00015) * 20,
          occupancyPct: 40 + rng.rand() * 30 + Math.sin(Date.now() * 0.0002) * 15,
        };
        // Keep last N points based on time range
        const maxPoints = timeRange === '1h' ? 4 : timeRange === '4h' ? 16 : timeRange === '8h' ? 32 : 96;
        return [...prev.slice(-maxPoints + 1), newPoint];
      });

      // Occasionally add new alerts
      if (rng.rand() < (demoMode ? 0.3 : 0.15)) {
        setAlerts((prev) => {
          const types: AlertItem['type'][] = ['Unattended Vehicle', 'Overstay', 'Spillback Risk'];
          const actions = [
            'Dispatch curb marshal',
            'Open overflow lane',
            'Send passenger advisory',
            'Activate dynamic pricing',
          ];
          const newAlert: AlertItem = {
            id: `alert-${Date.now()}`,
            type: types[Math.floor(rng.rand() * types.length)],
            timestamp: new Date(),
            zone: ZONES[Math.floor(rng.rand() * ZONES.length)],
            dwellDurationSec: 60 + rng.rand() * 120,
            recommendedAction: actions[Math.floor(rng.rand() * actions.length)],
            status: 'New',
            zoneId: `zone-${Math.floor(rng.rand() * ZONES.length)}`,
          };
          return [newAlert, ...prev].slice(0, 20);
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange, demoMode]);

  // Filter zones based on selection
  const filteredZones = zones.filter((z) => selectedZones.includes('All') || selectedZones.includes(z.name));

  // Filter time series based on time range (already handled in state)
  const filteredTimeSeries = timeSeries;

  // Filter alerts based on selected zones
  const filteredAlerts = alerts.filter(
    (a) => selectedZones.includes('All') || selectedZones.includes(a.zone)
  );

  return {
    zones: filteredZones,
    timeSeries: filteredTimeSeries,
    alerts: filteredAlerts,
    curbUseBlocks,
    simulationScenarios,
    allZones: zones, // For zone map that shows all zones
  };
}


