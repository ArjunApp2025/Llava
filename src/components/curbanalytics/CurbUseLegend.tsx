import React from 'react';
import type { CurbUseType } from '../../types';

interface CurbUseLegendProps {
  className?: string;
}

const CURB_USE_COLORS: Record<CurbUseType, string> = {
  Driveway: '#7F1D1D', // dark red
  'Always No Parking': '#DC2626', // red
  'Currently No Parking': '#F97316', // orange
  'Loading Zone': '#86EFAC', // light green
  Free: '#16A34A', // dark green
  'Residential Permit': '#60A5FA', // light blue
  'Paid Parking': '#1E40AF', // dark blue
  'Other Permits': '#A855F7', // purple
};

export function CurbUseLegend({ className = '' }: CurbUseLegendProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-2 border border-gray-700 ${className}`}>
      <h4 className="text-xs font-semibold mb-2">Curb Use</h4>
      <div className="grid grid-cols-2 gap-1.5 text-[10px]">
        {Object.entries(CURB_USE_COLORS).map(([type, color]) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: color }}
              aria-label={`${type} color indicator`}
            />
            <span className="text-gray-300">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function getCurbUseColor(type: CurbUseType): string {
  return CURB_USE_COLORS[type];
}

