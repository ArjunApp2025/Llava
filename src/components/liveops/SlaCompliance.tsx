import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ZoneMetric } from '../../types';

interface SlaComplianceProps {
  zones: ZoneMetric[];
}

export function SlaCompliance({ zones }: SlaComplianceProps) {
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
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-sm font-semibold mb-3 text-white">SLA Compliance</h3>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              aria-label="SLA compliance donut chart"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151', 
                borderRadius: '4px',
                color: '#D1D5DB'
              }}
              labelStyle={{ color: '#D1D5DB', fontWeight: 'bold' }}
              itemStyle={{ color: '#D1D5DB' }}
            />
            <Legend 
              wrapperStyle={{ color: '#D1D5DB', fontSize: '12px' }}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{withinPct}%</div>
            <div className="text-xs text-gray-300 mt-1">Within SLA</div>
          </div>
        </div>
      </div>
    </div>
  );
}

