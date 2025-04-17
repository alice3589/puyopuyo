'use client';

import { FIELD_WIDTH, FIELD_HEIGHT, PuyoColor } from '@/types/game';
import Puyo from './Puyo';

interface GameFieldProps {
  field: PuyoColor[][];
  currentPuyo: { color: PuyoColor; x: number; y: number }[];
}

export default function GameField({ field, currentPuyo }: GameFieldProps) {
  return (
    <div className="relative border-2 border-gray-700 bg-gray-800">
      <div className="relative" style={{ width: `${FIELD_WIDTH * 40}px`, height: `${FIELD_HEIGHT * 40}px` }}>
        {field.map((row, y) =>
          row.map((color, x) => (
            <Puyo key={`${x}-${y}`} color={color} x={x} y={y} />
          ))
        )}
        {currentPuyo.map((puyo, index) => (
          <Puyo key={`current-${index}`} {...puyo} />
        ))}
      </div>
    </div>
  );
} 