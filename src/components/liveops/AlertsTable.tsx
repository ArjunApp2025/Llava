import React, { useState } from 'react';
import type { AlertItem, AlertStatus } from '../../types';
import { PillChip } from '../common/PillChip';

interface AlertsTableProps {
  alerts: AlertItem[];
  selectedZoneId: string | null;
  onAlertClick: (zoneId: string) => void;
}

export function AlertsTable({ alerts, selectedZoneId, onAlertClick }: AlertsTableProps) {
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'All'>('All');

  const filteredAlerts = alerts.filter(
    (alert) => statusFilter === 'All' || alert.status === statusFilter
  );

  const getStatusColor = (status: AlertStatus): 'green' | 'amber' | 'red' | 'blue' | 'gray' => {
    switch (status) {
      case 'New':
        return 'red';
      case 'Acknowledged':
        return 'amber';
      case 'Closed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  const handleMarkAllAcknowledged = () => {
    // This would typically update state, but for now it's just a UI action
    // In a real app, this would call a callback to update the alerts
    console.log('Mark all as acknowledged');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Alerts & Actions</h3>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AlertStatus | 'All')}
            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm text-white"
            aria-label="Filter alerts by status"
          >
            <option value="All">All Status</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Closed">Closed</option>
          </select>
          <button
            onClick={handleMarkAllAcknowledged}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm text-white transition-colors"
          >
            Mark All Acknowledged
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Alerts and actions table">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Type</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Timestamp</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Zone</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Dwell</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Action</th>
              <th className="text-left py-2 px-3 text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-500">
                  No alerts found
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => {
                const isSelected = selectedZoneId === alert.zoneId;
                return (
                  <tr
                    key={alert.id}
                    onClick={() => onAlertClick(alert.zoneId)}
                    className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-900/30' : ''
                    }`}
                    role="row"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onAlertClick(alert.zoneId);
                      }
                    }}
                    aria-label={`Alert: ${alert.type} in ${alert.zone} zone`}
                  >
                    <td className="py-2 px-3">{alert.type}</td>
                    <td className="py-2 px-3 text-gray-400">
                      {alert.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 px-3">{alert.zone}</td>
                    <td className="py-2 px-3">{formatDuration(alert.dwellDurationSec)}</td>
                    <td className="py-2 px-3 text-gray-300">{alert.recommendedAction}</td>
                    <td className="py-2 px-3">
                      <PillChip label={alert.status} color={getStatusColor(alert.status)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


