'use client';
import React, { useEffect, useState } from 'react';
import { InstructorMessage } from '../lib/gameStore';

export function InstructorFeedback({ messages }: { messages: InstructorMessage[] }) {
  const [visible, setVisible] = useState<InstructorMessage | null>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    setVisible(messages[0]);
    const t = setTimeout(() => setVisible(null), 3500);
    return () => clearTimeout(t);
  }, [messages]);

  if (!visible) return null;

  const isWarning = visible.type === 'warning';
  const isSuccess = visible.type === 'success';

  return (
    <div
      className="animate-instructorPop"
      style={{
        position: 'absolute',
        bottom: 12, left: 10, right: 10,
        zIndex: 20,
        background: isWarning ? '#fff3e0' : isSuccess ? '#e8f5e9' : '#e3f2fd',
        border: `1.5px solid ${isWarning ? '#ffb74d' : isSuccess ? '#81c784' : '#64b5f6'}`,
        borderRadius: 14,
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}
    >
      <span style={{ fontSize: 20, flexShrink: 0 }}>🧑‍🏫</span>
      <span style={{
        fontSize: 12, fontWeight: 600, lineHeight: 1.4,
        color: isWarning ? '#e65100' : isSuccess ? '#1b5e20' : '#0d47a1',
      }}>
        {isWarning ? '⚠ ' : isSuccess ? '✅ ' : '💡 '}{visible.text}
      </span>
    </div>
  );
}

const LESSONS: Record<string, { steps: { title: string; desc: string; hint: string }[] }> = {
  lesson_1: {
    steps: [
      { title: 'Start the Engine', desc: 'Press the green START button. Clutch must be fully pressed.', hint: '🦶 Clutch pedal drag to top = pressed' },
      { title: 'Find 1st Gear', desc: 'With clutch pressed (✓ Ready shown), tap gear "1".', hint: '⚙ Clutch > 70% to change gears' },
      { title: 'Find the Bite Point', desc: 'Slowly drag the clutch DOWN. When you see ✦ BITE — hold it there.', hint: '⚡ Watch the orange BITE indicator' },
      { title: 'Move the Car!', desc: 'Add gas while slowly releasing clutch through the bite zone.', hint: '🔑 Clutch + Gas together is the key' },
    ],
  },
  stall_challenge: {
    steps: [
      { title: 'Hill Start', desc: 'You\'re on a slope. Hold clutch in bite zone, add gas, then slowly release.', hint: '⛰ Add more gas than flat ground' },
    ],
  },
};

export function LessonOverlay({ step, phase }: { step: number; phase: string }) {
  const lesson = LESSONS[phase];
  if (!lesson || step >= lesson.steps.length) return null;
  const cur = lesson.steps[step];
  const total = lesson.steps.length;

  return (
    <div style={{
      background: 'white',
      borderBottom: '1px solid #e0e0e0',
      padding: '8px 14px',
      flexShrink: 0,
    }}>
      {/* Progress dots */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: i === step ? 18 : 6, height: 6, borderRadius: 3,
            background: i < step ? '#2e7d32' : i === step ? '#1565c0' : '#e0e0e0',
            transition: 'all 0.3s',
          }} />
        ))}
        <span style={{ fontSize: 10, color: '#999', marginLeft: 2 }}>Step {step + 1}/{total}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{cur.title}</div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 1 }}>{cur.desc}</div>
        </div>
        <div style={{
          background: '#fff8e1', borderRadius: 8, padding: '4px 8px',
          fontSize: 10, color: '#e65100', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0,
        }}>{cur.hint}</div>
      </div>
    </div>
  );
}
