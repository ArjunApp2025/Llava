import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TimeSeriesPoint } from '../../types';

interface ThroughputTrendProps {
  timeSeries: TimeSeriesPoint[];
}

export function ThroughputTrend({ timeSeries }: ThroughputTrendProps) {
  const chartData = timeSeries.map((point) => ({
    time: point.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    timestamp: point.timestamp,
    avgDwell: Math.round(point.avgDwellSec),
    throughput: Math.round(point.throughputVehPerHr),
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-sm font-semibold mb-2">Throughput & Dwell Time Trend</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData} aria-label="Throughput and dwell time trend">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9CA3AF" />
          <YAxis yAxisId="left" stroke="#9CA3AF" label={{ value: 'Avg Dwell (sec)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" label={{ value: 'Throughput (veh/hr)', angle: 90, position: 'insideRight', fill: '#9CA3AF' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '4px' }}
            labelStyle={{ color: '#D1D5DB' }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avgDwell"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Avg Dwell (sec)"
            dot={{ r: 3 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="throughput"
            stroke="#10B981"
            strokeWidth={2}
            name="Throughput (veh/hr)"
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

