import React from 'react';
import type { CurbUseBlock } from '../../types';
import { PillChip } from '../common/PillChip';

interface BlockfaceDetailPanelProps {
  block: CurbUseBlock | null;
}

// Generate parking schedule data
function generateScheduleData() {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const timeSlots = ['12am', '2am', '6am', '7am', '10am', '12pm', '3pm', '6pm'];
  const schedule: Array<{ day: string; time: string; type: 'free' | 'paid' | 'restricted' }> = [];

  days.forEach((day) => {
    timeSlots.forEach((time, idx) => {
      let type: 'free' | 'paid' | 'restricted' = 'free';

      // Business logic: weekdays have restrictions and paid parking
      const isWeekend = day === 'Sa' || day === 'Su';
      const timeHour = idx === 0 ? 0 : idx === 1 ? 2 : idx === 2 ? 6 : idx === 3 ? 7 : idx === 4 ? 10 : idx === 5 ? 12 : idx === 6 ? 15 : 18;

      if (!isWeekend) {
        if (timeHour >= 2 && timeHour < 10) {
          type = 'restricted';
        } else if (timeHour >= 10 && timeHour < 18) {
          type = 'paid';
        }
      }

      schedule.push({ day, time, type });
    });
  });

  return { days, timeSlots, schedule };
}

export function BlockfaceDetailPanel({ block }: BlockfaceDetailPanelProps) {
  if (!block) {
    return (
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400">Select a blockface to view details</p>
      </div>
    );
  }

  const { days, timeSlots, schedule } = generateScheduleData();

  const getCellColor = (type: 'free' | 'paid' | 'restricted') => {
    switch (type) {
      case 'free':
        return 'bg-green-600';
      case 'paid':
        return 'bg-blue-600';
      case 'restricted':
        return 'bg-orange-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getCellLabel = (type: 'free' | 'paid' | 'restricted') => {
    switch (type) {
      case 'free':
        return 'FREE';
      case 'paid':
        return '$ 2HR';
      case 'restricted':
        return 'P';
      default:
        return '';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700 space-y-3">
      <div>
        <h3 className="text-lg font-semibold mb-1">{block.streetName}</h3>
        <p className="text-xs text-gray-400">
          {block.fromStreet} → {block.toStreet}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-gray-400">Capacity</div>
          <div className="text-xl font-bold">{block.capacity}</div>
        </div>
        <div>
          <div className="text-xs text-gray-400">Availability</div>
          <div className="text-xl font-bold">{Math.round(block.currentAvailabilityPct)}%</div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Predicted Occupancy</div>
          <div className="mt-1">
            <PillChip
              label={block.predictedOccupancyLevel}
              color={
                block.predictedOccupancyLevel === 'LOW'
                  ? 'green'
                  : block.predictedOccupancyLevel === 'MED'
                  ? 'amber'
                  : 'red'
              }
            />
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-400">Blockface Length</div>
          <div className="text-lg font-semibold">
            {Math.round(block.endPositionFt - block.startPositionFt)} ft
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h4 className="text-sm font-semibold">$ Paid Parking</h4>
        </div>
        <div className="text-xs text-gray-400 mb-2">
          Zone: {Math.round(block.startPositionFt)}-{Math.round(block.endPositionFt)} ft ({block.capacity} spaces)
        </div>

        {/* Schedule Grid */}
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[10px]" role="table" aria-label="Parking schedule">
            <thead>
              <tr>
                <th className="text-left py-1 px-1 text-gray-400"></th>
                {days.map((day) => (
                  <th key={day} className="text-center py-1 px-1 text-gray-400 font-semibold">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time, timeIdx) => {
                if (timeIdx === timeSlots.length - 1) return null; // Skip last time slot for grid
                const nextTime = timeSlots[timeIdx + 1];
                return (
                  <tr key={time}>
                    <td className="py-1 px-1 text-gray-400 text-right">{time}</td>
                    {days.map((day) => {
                      const scheduleItem = schedule.find(
                        (s) => s.day === day && s.time === time
                      );
                      const type = scheduleItem?.type || 'free';
                      return (
                        <td key={`${day}-${time}`} className="py-1 px-1">
                          <div
                            className={`${getCellColor(type)} rounded text-white text-center py-1 px-1 font-semibold`}
                            title={`${day} ${time}-${nextTime}: ${getCellLabel(type)}`}
                          >
                            {getCellLabel(type)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-900 rounded p-2 border border-gray-700">
        <h5 className="font-semibold mb-1 text-xs">Policy Insights</h5>
        <ul className="text-[10px] text-gray-300 space-y-0.5">
          <li>• Peak: 10am-6pm weekdays</li>
          <li>• Spillover risk: {block.predictedOccupancyLevel === 'HIGH' ? 'High' : 'Low'}</li>
          <li>• Availability: {block.currentAvailabilityPct > 50 ? 'Good' : 'Limited'}</li>
        </ul>
      </div>
    </div>
  );
}

