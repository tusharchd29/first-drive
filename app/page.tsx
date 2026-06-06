'use client';

import React from 'react';
import { useGameStore } from '../lib/gameStore';
import { MainMenu } from '../components/MainMenu';
import { GameScreen } from '../components/GameScreen';

export default function Home() {
  const { phase, setPhase } = useGameStore();

  if (phase === 'menu') {
    return (
      <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <MainMenu onSelect={setPhase} />
      </main>
    );
  }

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <GameScreen phase={phase} />
    </main>
  );
}
