'use client';

import dynamic from 'next/dynamic';
const GameCanvas = dynamic(() => import('./GameCanvas'), { ssr: false });

export default function GamePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900">
      <GameCanvas />
    </main>
  );
}
