import React from 'react';

export interface PillChipProps {
  label: string;
  color?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
  className?: string;
}

export function PillChip({ label, color = 'gray', className = '' }: PillChipProps) {
  const colorClasses = {
    green: 'bg-green-900/50 text-green-300 border-green-700',
    amber: 'bg-amber-900/50 text-amber-300 border-amber-700',
    red: 'bg-red-900/50 text-red-300 border-red-700',
    blue: 'bg-blue-900/50 text-blue-300 border-blue-700',
    gray: 'bg-gray-800 text-gray-300 border-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[color]} ${className}`}
    >
      {label}
    </span>
  );
}


