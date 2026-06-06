'use client';

import React, { useEffect, useState } from 'react';
import { InstructorMessage } from '../lib/gameStore';

interface InstructorProps {
  messages: InstructorMessage[];
}

const TYPE_COLORS = {
  tip: { bg: '#1e3a5f', border: '#3b82f6', icon: '💡' },
  warning: { bg: '#3b1f1f', border: '#ef4444', icon: '⚠️' },
  success: { bg: '#1a3a2a', border: '#22c55e', icon: '✅' },
};

export function InstructorFeedback({ messages }: InstructorProps) {
  const [visible, setVisible] = useState<InstructorMessage[]>([]);

  useEffect(() => {
    setVisible(messages.slice(0, 2));
    const timer = setTimeout(() => {
      setVisible([]);
    }, 4000);
    return () => clearTimeout(timer);
  }, [messages]);

  if (visible.length === 0) return null;

  const latest = visible[0];
  const style = TYPE_COLORS[latest.type];

  return (
    <div
      className="absolute left-3 right-3 animate-slideUp"
      style={{ top: 70 }}
    >
      <div
        className="flex items-start gap-2 rounded-2xl px-3 py-2"
        style={{
          background: style.bg,
          border: `1px solid ${style.border}40`,
          backdropFilter: 'blur(8px)',
          boxShadow: `0 4px 20px rgba(0,0,0,0.4)`,
        }}
      >
        {/* Instructor avatar */}
        <div className="instructor-bounce flex-shrink-0 text-2xl">🧑‍🏫</div>
        <div className="flex-1">
          <span className="text-[11px] font-semibold text-white/90 leading-snug">
            {style.icon} {latest.text}
          </span>
        </div>
      </div>
    </div>
  );
}

interface LessonCardProps {
  step: number;
  phase: string;
}

const LESSONS: Record<string, { steps: { title: string; desc: string; hint?: string }[] }> = {
  lesson_1: {
    steps: [
      {
        title: 'Start the Engine',
        desc: 'Press the green START button. Make sure clutch is fully pressed first.',
        hint: '🦶 Clutch pedal must be at top',
      },
      {
        title: 'Find 1st Gear',
        desc: 'With clutch pressed, tap the "1" on the gear shifter.',
        hint: '⚙️ Clutch > 70% to change gears',
      },
      {
        title: 'Find the Bite Point',
        desc: 'Slowly slide your finger DOWN on the clutch. When it vibrates — STOP. That\'s the bite point.',
        hint: '⚡ Watch the yellow BITE indicator',
      },
      {
        title: 'Move the Car',
        desc: 'Add a little gas while slowly releasing the clutch through the bite zone.',
        hint: '🔑 Clutch + Gas coordination is everything',
      },
    ],
  },
  stall_challenge: {
    steps: [
      {
        title: 'Hill Start',
        desc: 'The car is on a slope. Use handbrake + clutch + gas together.',
        hint: '⛰️ Hold handbrake until you feel drive',
      },
    ],
  },
};

export function LessonOverlay({ step, phase }: LessonCardProps) {
  const lesson = LESSONS[phase];
  if (!lesson || step >= lesson.steps.length) return null;

  const current = lesson.steps[step];

  return (
    <div
      className="absolute left-3 right-3 rounded-2xl p-3 animate-fadeIn"
      style={{
        bottom: 310,
        background: 'rgba(10,10,20,0.92)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-[#22d3ee] tracking-widest uppercase">
          Step {step + 1} of {lesson.steps.length}
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
      <p className="text-white font-semibold text-[13px] mb-1">{current.title}</p>
      <p className="text-white/60 text-[11px] leading-snug">{current.desc}</p>
      {current.hint && (
        <p className="text-[#f59e0b] text-[10px] mt-1 font-medium">{current.hint}</p>
      )}
    </div>
  );
}
