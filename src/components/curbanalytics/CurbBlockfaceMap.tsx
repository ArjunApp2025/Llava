import React from 'react';
import type { CurbUseBlock } from '../../types';
import { getCurbUseColor } from './CurbUseLegend';

interface CurbBlockfaceMapProps {
  blocks: CurbUseBlock[];
  selectedBlockId: string | null;
  onBlockClick: (blockId: string) => void;
}

export function CurbBlockfaceMap({
  blocks,
  selectedBlockId,
  onBlockClick,
}: CurbBlockfaceMapProps) {
  // Group blocks by street
  const blocksByStreet = blocks.reduce((acc, block) => {
    if (!acc[block.streetName]) {
      acc[block.streetName] = [];
    }
    acc[block.streetName].push(block);
    return acc;
  }, {} as Record<string, CurbUseBlock[]>);

  const streets = Object.keys(blocksByStreet);
  const streetPositions: Record<string, { x: number; y: number }> = {
    'McAllister St': { x: 100, y: 200 },
    'Van Ness Ave': { x: 300, y: 200 },
    'Redwood St': { x: 200, y: 100 },
    'Golden Gate Ave': { x: 200, y: 300 },
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      <h3 className="text-base font-semibold mb-2">Curb Use Map</h3>
      <svg
        width="100%"
        height="350"
        viewBox="0 0 500 500"
        className="w-full"
        role="img"
        aria-label="Curb use blockface map"
      >
        {/* Background */}
        <rect width="500" height="500" fill="#111827" />

        {/* Draw streets as horizontal/vertical lines */}
        {streets.map((street, idx) => {
          const pos = streetPositions[street] || { x: 100 + idx * 100, y: 200 };
          const isHorizontal = idx % 2 === 0;

          return (
            <g key={street}>
              {/* Street line */}
              <line
                x1={isHorizontal ? 50 : pos.x}
                y1={isHorizontal ? pos.y : 50}
                x2={isHorizontal ? 450 : pos.x}
                y2={isHorizontal ? pos.y : 450}
                stroke="#374151"
                strokeWidth="3"
              />
              {/* Street label */}
              <text
                x={isHorizontal ? 20 : pos.x + 5}
                y={isHorizontal ? pos.y - 5 : 30}
                fill="#9CA3AF"
                fontSize="12"
                fontWeight="bold"
              >
                {street}
              </text>
            </g>
          );
        })}

        {/* Draw blockfaces */}
        {blocks.map((block) => {
          const streetPos = streetPositions[block.streetName] || { x: 200, y: 200 };
          const isHorizontal = streets.indexOf(block.streetName) % 2 === 0;
          const blockLength = block.endPositionFt - block.startPositionFt;
          const scale = 0.5; // Scale factor for feet to pixels
          const startX = isHorizontal ? 100 + block.startPositionFt * scale : streetPos.x - 30;
          const startY = isHorizontal ? streetPos.y - 15 : 100 + block.startPositionFt * scale;
          const width = isHorizontal ? blockLength * scale : 60;
          const height = isHorizontal ? 30 : blockLength * scale;

          const isSelected = selectedBlockId === block.id;
          const color = getCurbUseColor(block.curbUseType);

          return (
            <g key={block.id}>
              <rect
                x={startX}
                y={startY}
                width={width}
                height={height}
                fill={color}
                fillOpacity={0.7}
                stroke={isSelected ? '#3B82F6' : '#6B7280'}
                strokeWidth={isSelected ? 3 : 1}
                rx="2"
                tabIndex={0}
                role="button"
                aria-label={`Blockface on ${block.streetName}, ${block.curbUseType}, capacity ${block.capacity}`}
                onClick={() => onBlockClick(block.id)}
                className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Capacity label */}
              <text
                x={startX + width / 2}
                y={startY + height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                pointerEvents="none"
              >
                {block.capacity}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

