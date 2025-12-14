// Core data types for the ITF Curbside Performance dashboard

export type ZoneType = 'Pickup' | 'Dropoff' | 'ADA' | 'Shuttle' | 'Rideshare';

export type TimeRange = '1h' | '4h' | '8h' | '24h';

export type AlertType = 'Unattended Vehicle' | 'Overstay' | 'Spillback Risk';

export type AlertStatus = 'New' | 'Acknowledged' | 'Closed';

export type RiskLevel = 'Low' | 'Med' | 'High';

export type SlaStatus = 'within' | 'approaching' | 'breach';

export type CurbUseType =
  | 'Driveway'
  | 'Always No Parking'
  | 'Currently No Parking'
  | 'Loading Zone'
  | 'Free'
  | 'Residential Permit'
  | 'Paid Parking'
  | 'Other Permits';

export type OccupancyLevel = 'LOW' | 'MED' | 'HIGH';

export type ScenarioType = 'Baseline' | 'Optimized Dispatch' | 'Aggressive Enforcement' | 'High Demand Event';

export interface ZoneMetric {
  id: string;
  name: ZoneType;
  avgDwellSec: number;
  occupancyPct: number;
  vehiclesPerHour: number;
  slaCompliancePct: number;
  unattendedAlerts: number;
  slaStatus: SlaStatus;
  currentVehicles: number;
}

export interface TimeSeriesPoint {
  timestamp: Date;
  avgDwellSec: number;
  throughputVehPerHr: number;
  occupancyPct: number;
}

export interface AlertItem {
  id: string;
  type: AlertType;
  timestamp: Date;
  zone: ZoneType;
  dwellDurationSec: number;
  recommendedAction: string;
  status: AlertStatus;
  zoneId: string;
}

export interface CurbUseBlock {
  id: string;
  streetName: string;
  startPositionFt: number;
  endPositionFt: number;
  curbUseType: CurbUseType;
  capacity: number;
  currentAvailabilityPct: number;
  predictedOccupancyLevel: OccupancyLevel;
  fromStreet: string;
  toStreet: string;
}

export interface ScenarioMetrics {
  scenario: ScenarioType;
  vehicleCount: number;
  avgThroughput: number;
  avgDwellSec: number;
  slaCompliancePct: number;
  occupancyPct: number;
  stdDev?: number; // for error bars
}

export interface VehicleEvent {
  id: string;
  zoneId: string;
  entryTs: Date;
  exitTs: Date | null;
  dwellSec: number | null;
}


