'use client';

import { PuyoColor } from '@/types/game';

interface PuyoProps {
  color: PuyoColor;
  x: number;
  y: number;
}

export default function Puyo({ color, x, y }: PuyoProps) {
  if (color === 'empty') return null;

  const colorMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
  };

  return (
    <div
      className={`${colorMap[color]} w-10 h-10 rounded-full absolute`}
      style={{
        left: `${x * 40}px`,
        top: `${y * 40}px`,
      }}
    />
  );
} 