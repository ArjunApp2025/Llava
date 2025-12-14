import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ZoneMetric } from '../../types';

interface SlaDonutProps {
  zones: ZoneMetric[];
}

export function SlaDonut({ zones }: SlaDonutProps) {
  const data = useMemo(() => {
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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const withinPct = total > 0 ? ((data[0].value / total) * 100).toFixed(1) : '0';

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4">SLA Compliance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            aria-label="SLA compliance donut chart"
          >
            {data.map((entry, index) => (
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
      <div className="text-center mt-4">
        <div className="text-2xl font-bold text-green-400">{withinPct}%</div>
        <div className="text-sm text-gray-400">Within SLA</div>
      </div>
    </div>
  );
}


