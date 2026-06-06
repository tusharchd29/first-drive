'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useGameStore, GamePhase } from '../lib/gameStore';
import { GameCanvas } from './GameCanvas';
import { Controls } from './Controls';
import { Gauges } from './Gauges';
import { InstructorFeedback, LessonOverlay } from './Instructor';
import { SkillsDashboard } from './SkillsDashboard';

const SLOPE_BY_PHASE: Record<GamePhase, number> = {
  menu: 0, lesson_1: 0, stall_challenge: 0.4, free_drive: 0, skills: 0,
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

  const gameLoop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
    const dt = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = timestamp;
    tickPhysics(dt, SLOPE_BY_PHASE[phase] || 0);
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
      addMessage('Great! Now slowly release the clutch.', 'success');
    }
    if (lessonStep === 2 && car.clutchEngagement > 0.1) {
      setLessonStep(3);
    }
    if (lessonStep === 3 && car.speed > 3) {
      addMessage("You're moving! Amazing clutch control! 🎉", 'success');
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
      onTouchStart={initAudio}
      style={{
        position: 'fixed',
        inset: 0,
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#e8f0e8',
        overflow: 'hidden',
      }}
    >
      {/* ── TOP BAR ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => setPhase('menu')}
          style={{
            background: '#f0f0f0',
            border: 'none',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#333',
            cursor: 'pointer',
          }}
        >← Menu</button>

        <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>
          {phase === 'lesson_1' ? '🅿️ Parking Lot' :
           phase === 'stall_challenge' ? '⛰️ Hill Start' : '🏙️ Free Drive'}
        </span>

        <button
          onClick={() => setPhase('skills')}
          style={{
            background: '#e8f5e9',
            border: 'none',
            borderRadius: 20,
            padding: '6px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#2e7d32',
            cursor: 'pointer',
          }}
        >📊 Skills</button>
      </div>

      {/* ── LESSON CARD (compact, above canvas) ── */}
      {(phase === 'lesson_1' || phase === 'stall_challenge') && (
        <LessonOverlay step={lessonStep} phase={phase} />
      )}

      {/* ── GAME WORLD (canvas fills remaining space) ── */}
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <GameCanvas
          carX={car.x}
          carY={car.y}
          carAngle={car.angle}
          isStalled={car.isStalled}
          speed={car.speed}
          phase={phase}
        />
        {/* Instructor bubble overlaid on canvas */}
        <InstructorFeedback messages={messages} />
      </div>

      {/* ── GAUGES BAR ── */}
      <div style={{
        background: 'white',
        borderTop: '1px solid #e8e8e8',
        borderBottom: '1px solid #e8e8e8',
        padding: '6px 12px',
        display: 'flex',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Gauges car={car} />
      </div>

      {/* ── CONTROLS ── */}
      <div style={{ flexShrink: 0 }}>
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
          onStart={() => {
            updateInputs({ startEngine: true });
            setTimeout(() => updateInputs({ startEngine: false }), 150);
          }}
          engineOn={car.engineOn}
          isStalled={car.isStalled}
        />
      </div>
    </div>
  );
}
