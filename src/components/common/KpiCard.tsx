import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function KpiCard({ title, value, subtitle, trend, className = '' }: KpiCardProps) {
  return (
    <div
      className={`bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors ${className}`}
      role="region"
      aria-label={`KPI: ${title}`}
    >
      <div className="text-xs text-gray-400 mb-1">{title}</div>
      <div className="text-xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      {trend && (
        <div className="mt-2 text-xs">
          {trend === 'up' && <span className="text-green-400">↑</span>}
          {trend === 'down' && <span className="text-red-400">↓</span>}
          {trend === 'neutral' && <span className="text-gray-400">→</span>}
        </div>
      )}
    </div>
  );
}

