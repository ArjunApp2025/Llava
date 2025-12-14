import React, { useState } from 'react';
import { useITFMetrics } from '../hooks/useITFMetrics';
import { CurbBlockfaceMap } from '../components/curbanalytics/CurbBlockfaceMap';
import { CurbUseLegend } from '../components/curbanalytics/CurbUseLegend';
import { BlockfaceDetailPanel } from '../components/curbanalytics/BlockfaceDetailPanel';
import { Dropdown } from '../components/common/Dropdown';
import { Toggle } from '../components/common/Toggle';
import type { TimeRange, ZoneType, CurbUseBlock } from '../types';

interface CurbAnalyticsPageProps {
  timeRange: TimeRange;
  selectedZones: ZoneType[];
  demoMode: boolean;
}

type ScenarioType = 'Current Policy' | 'Event Day' | 'Construction Detour';

export function CurbAnalyticsPage({
  timeRange,
  selectedZones,
  demoMode,
}: CurbAnalyticsPageProps) {
  const { curbUseBlocks } = useITFMetrics({
    timeRange,
    selectedZones,
    demoMode,
  });

  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [onStreet, setOnStreet] = useState(true);
  const [offStreet, setOffStreet] = useState(false);
  const [areasOfInterest, setAreasOfInterest] = useState(false);
  const [scenario, setScenario] = useState<ScenarioType>('Current Policy');

  const selectedBlock = curbUseBlocks.find((b) => b.id === selectedBlockId) || null;

  // Adjust block metrics based on scenario
  const adjustedBlocks: CurbUseBlock[] = curbUseBlocks.map((block) => {
    let adjustedBlock = { ...block };

    if (scenario === 'Event Day') {
      adjustedBlock.currentAvailabilityPct = Math.max(0, block.currentAvailabilityPct - 20);
      adjustedBlock.predictedOccupancyLevel =
        block.predictedOccupancyLevel === 'LOW' ? 'MED' : block.predictedOccupancyLevel === 'MED' ? 'HIGH' : 'HIGH';
    } else if (scenario === 'Construction Detour') {
      adjustedBlock.currentAvailabilityPct = Math.max(0, block.currentAvailabilityPct - 30);
      adjustedBlock.predictedOccupancyLevel = 'HIGH';
    }

    return adjustedBlock;
  });

  const scenarioOptions = [
    { value: 'Current Policy', label: 'Current Policy' },
    { value: 'Event Day', label: 'Event Day' },
    { value: 'Construction Detour', label: 'Construction Detour' },
  ];

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
        <div className="flex items-center gap-3 flex-wrap">
          <Toggle
            label="On-Street"
            checked={onStreet}
            onChange={setOnStreet}
          />
          <Toggle
            label="Off-Street"
            checked={offStreet}
            onChange={setOffStreet}
          />
          <Toggle
            label="Areas of Interest"
            checked={areasOfInterest}
            onChange={setAreasOfInterest}
          />
          <div className="ml-auto">
            <Dropdown
              label="Scenario"
              options={scenarioOptions}
              value={scenario}
              onChange={(value) => setScenario(value as ScenarioType)}
              className="w-40"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        {/* Map Section */}
        <div className="lg:col-span-3 space-y-3">
          <CurbBlockfaceMap
            blocks={adjustedBlocks}
            selectedBlockId={selectedBlockId}
            onBlockClick={setSelectedBlockId}
          />
          <CurbUseLegend />
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-2">
          <BlockfaceDetailPanel block={selectedBlock} />
        </div>
      </div>
    </div>
  );
}

