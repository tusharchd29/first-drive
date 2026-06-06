'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore, GamePhase } from '../lib/gameStore';
import { GameCanvas } from './GameCanvas';
import { Controls } from './Controls';
import { Gauges } from './Gauges';
import { InstructorFeedback, LessonOverlay } from './Instructor';
import { SkillsDashboard } from './SkillsDashboard';

const SLOPE_BY_PHASE: Record<GamePhase, number> = {
  menu: 0,
  lesson_1: 0,
  stall_challenge: 0.4,
  free_drive: 0,
  skills: 0,
};

export function GameScreen({ phase }: { phase: GamePhase }) {
  const {
    car, inputs, updateInputs, tickPhysics, tickSession,
    messages, clearOldMessages, updateSkills,
    lessonStep, setLessonStep,
    skills, stallChallengeCount, sessionDistance, sessionTime,
    setPhase, addMessage, resetCar,
  } = useGameStore();

  const lastTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const audioInitRef = useRef(false);

  // Game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;

    const slope = SLOPE_BY_PHASE[phase] || 0;
    tickPhysics(dt, slope);
    tickSession(dt);
    updateSkills();
    clearOldMessages();

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [tickPhysics, tickSession, updateSkills, clearOldMessages, phase]);

  useEffect(() => {
    resetCar();
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase, gameLoop]);

  // Init audio on first interaction
  const initAudio = useCallback(async () => {
    if (audioInitRef.current) return;
    audioInitRef.current = true;
    const mod = await import('../lib/audio');
    mod.initAudio();
    (window as any).__audioModule = mod;
  }, []);

  // Lesson progression
  useEffect(() => {
    if (phase !== 'lesson_1') return;

    if (lessonStep === 0 && car.engineOn) {
      setLessonStep(1);
      addMessage('Engine started! Now select 1st gear.', 'success');
    }
    if (lessonStep === 1 && car.gear === 1) {
      setLessonStep(2);
      addMessage('1st gear engaged! Now slowly release the clutch.', 'success');
    }
    if (lessonStep === 2 && car.clutchEngagement > 0.1) {
      setLessonStep(3);
    }
    if (lessonStep === 3 && car.speed > 3) {
      addMessage('You\'re moving! Great clutch control! 🎉', 'success');
      setLessonStep(4);
    }
  }, [car, lessonStep, phase, setLessonStep, addMessage]);

  if (phase === 'skills') {
    return (
      <SkillsDashboard
        skills={skills}
        stallCount={stallChallengeCount}
        distance={sessionDistance}
        sessionTime={sessionTime}
        onBack={() => setPhase('menu')}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 flex flex-col"
      onTouchStart={initAudio}
      onClick={initAudio}
    >
      {/* Game world */}
      <div className="relative flex-1 overflow-hidden">
        <GameCanvas
          carX={car.x}
          carY={car.y}
          carAngle={car.angle}
          isStalled={car.isStalled}
          speed={car.speed}
          phase={phase}
        />

        {/* Instructor feedback bubbles */}
        <InstructorFeedback messages={messages} />

        {/* Lesson card */}
        {(phase === 'lesson_1' || phase === 'stall_challenge') && (
          <LessonOverlay step={lessonStep} phase={phase} />
        )}

        {/* Top HUD */}
        <div className="absolute top-3 left-3 right-3">
          <div className="flex items-start justify-between">
            {/* Back button */}
            <button
              onClick={() => setPhase('menu')}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold text-white/60"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            >
              ← Menu
            </button>

            {/* Skills shortcut */}
            <button
              onClick={() => setPhase('skills')}
              className="rounded-full px-3 py-1.5 text-[11px] font-semibold"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                color: '#22d3ee',
              }}
            >
              📊 Skills
            </button>
          </div>
        </div>

        {/* Stall counter */}
        {car.stallCount > 0 && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid #ef444440' }}
          >
            <span className="text-[#ef4444] text-[11px] font-bold">
              ⚠️ {car.stallCount} stall{car.stallCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Gauges */}
      <div className="flex justify-center px-3 py-2"
        style={{ background: 'rgba(0,0,0,0.85)' }}>
        <Gauges car={car} />
      </div>

      {/* Controls */}
      <Controls
        clutch={inputs.clutch}
        brake={inputs.brake}
        throttle={inputs.throttle}
        steering={inputs.steering}
        gear={inputs.gear}
        onClutch={(v) => updateInputs({ clutch: v })}
        onBrake={(v) => updateInputs({ brake: v })}
        onThrottle={(v) => updateInputs({ throttle: v })}
        onSteering={(v) => updateInputs({ steering: v })}
        onGear={(g) => updateInputs({ gear: g })}
        onStart={() => updateInputs({ startEngine: true })}
        engineOn={car.engineOn}
        isStalled={car.isStalled}
      />
    </div>
  );
}
