import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ZoneMetric } from '../../types';

interface SlaOccupancyCombinedProps {
  zones: ZoneMetric[];
  occupancy: number;
}

export function SlaOccupancyCombined({ zones, occupancy }: SlaOccupancyCombinedProps) {
  const slaData = useMemo(() => {
    let withinSla = 0;
    let breached = 0;

    zones.forEach((zone) => {
      // Estimate vehicle count from throughput
      const vehicleCount = Math.floor(zone.vehiclesPerHour / 4);
      const withinCount = Math.floor((vehicleCount * zone.slaCompliancePct) / 100);
      withinSla += withinCount;
      breached += vehicleCount - withinCount;
    });

    return [
      { name: 'Within SLA', value: withinSla, color: '#10B981' },
      { name: 'Breached SLA', value: breached, color: '#EF4444' },
    ];
  }, [zones]);

  const total = slaData.reduce((sum, item) => sum + item.value, 0);
  const withinPct = total > 0 ? ((slaData[0].value / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="grid grid-cols-2 gap-4">
        {/* SLA Compliance */}
        <div>
          <h3 className="text-base font-semibold mb-2">SLA Compliance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={slaData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
                aria-label="SLA compliance donut chart"
              >
                {slaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '4px' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <div className="text-xl font-bold text-green-400">{withinPct}%</div>
            <div className="text-xs text-gray-400">Within SLA</div>
          </div>
        </div>

        {/* Curb Occupancy */}
        <div>
          <h3 className="text-base font-semibold mb-2">Curb Occupancy</h3>
          <div className="space-y-3">
            <div className="relative h-6 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  occupancy < 50
                    ? 'bg-green-500'
                    : occupancy < 75
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${occupancy}%` }}
                role="progressbar"
                aria-valuenow={occupancy}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Curb occupancy: ${occupancy.toFixed(1)}%`}
              />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(occupancy)}%</div>
              <div className="text-xs text-gray-400">Current occupancy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


