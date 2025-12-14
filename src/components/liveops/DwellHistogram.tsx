import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ZoneMetric } from '../../types';

interface DwellHistogramProps {
  zones: ZoneMetric[];
}

export function DwellHistogram({ zones }: DwellHistogramProps) {
  // Calculate histogram bins from zone dwell times
  // We'll use a simplified approach: aggregate all vehicles' dwell times
  const histogramData = useMemo(() => {
    const bins = [
      { range: '0-30s', min: 0, max: 30, count: 0 },
      { range: '31-60s', min: 31, max: 60, count: 0 },
      { range: '61-90s', min: 61, max: 90, count: 0 },
      { range: '91-120s', min: 91, max: 120, count: 0 },
      { range: '121-180s', min: 121, max: 180, count: 0 },
      { range: '181-300s', min: 181, max: 300, count: 0 },
      { range: '300s+', min: 301, max: Infinity, count: 0 },
    ];

    // Simulate vehicle distribution based on zone metrics
    zones.forEach((zone) => {
      const vehicleCount = Math.floor(zone.vehiclesPerHour / 4); // Approximate vehicles in current window
      const avgDwell = zone.avgDwellSec;

      // Distribute vehicles around the average
      for (let i = 0; i < vehicleCount; i++) {
        // Add some variance
        const dwell = avgDwell + (Math.random() - 0.5) * 40;
        const bin = bins.find((b) => dwell >= b.min && dwell <= b.max);
        if (bin) bin.count++;
      }
    });

    return bins.map((bin) => ({
      range: bin.range,
      count: bin.count,
    }));
  }, [zones]);

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-sm font-semibold mb-2">Vehicle Dwell Time Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={histogramData} aria-label="Dwell time histogram">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="range" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '4px' }}
            labelStyle={{ color: '#D1D5DB' }}
          />
          <ReferenceLine x="61-90s" stroke="#EF4444" strokeDasharray="3 3" label="SLA Threshold" />
          <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

