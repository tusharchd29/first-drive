'use client';

import React from 'react';
import { GamePhase } from '../lib/gameStore';

interface MenuProps {
  onSelect: (phase: GamePhase) => void;
}

const MENU_ITEMS = [
  {
    phase: 'lesson_1' as GamePhase,
    title: 'Lesson 1',
    subtitle: 'Find the Bite Point',
    desc: 'Learn the clutch from scratch. Empty parking lot.',
    icon: '🅿️',
    color: '#22d3ee',
    tag: 'BEGINNER',
  },
  {
    phase: 'stall_challenge' as GamePhase,
    title: 'Stall Challenge',
    subtitle: 'Hill Start & Stop-Go',
    desc: 'Purposeful stalls. Kill the fear. Learn recovery.',
    icon: '⛰️',
    color: '#f59e0b',
    tag: 'INTERMEDIATE',
  },
  {
    phase: 'free_drive' as GamePhase,
    title: 'Free Drive',
    subtitle: 'Open Town',
    desc: 'Explore the town. No pressure. Just drive.',
    icon: '🏙️',
    color: '#4ade80',
    tag: 'SANDBOX',
  },
];

export function MainMenu({ onSelect }: MenuProps) {
  return (
    <div
      className="absolute inset-0 flex flex-col overflow-hidden"
      style={{ background: '#080c14' }}
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1a4a7a 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-64 opacity-10"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, #22d3ee 0%, transparent 60%)',
        }}
      />

      {/* Road lines decoration */}
      <svg className="absolute bottom-0 left-0 right-0 opacity-5" height="200" style={{ width: '100%' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <line
            key={i}
            x1={i * 80 - 20}
            y1="200"
            x2={i * 80 + 40}
            y2="0"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="20 20"
          />
        ))}
      </svg>

      {/* Header */}
      <div className="relative z-10 px-6 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🚗</span>
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: '#22d3ee' }}
          >
            First Drive
          </span>
        </div>
        <h1
          className="text-4xl font-black leading-tight tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #22d3ee 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Learn to Drive<br />a Manual Car
        </h1>
        <p className="text-white/40 text-[12px] mt-2">
          The only simulator that teaches you the clutch.
        </p>
      </div>

      {/* Menu items */}
      <div className="relative z-10 flex-1 px-4 flex flex-col gap-3 overflow-y-auto pb-4">
        {MENU_ITEMS.map(({ phase, title, subtitle, desc, icon, color, tag }) => (
          <button
            key={phase}
            onClick={() => onSelect(phase)}
            className="text-left rounded-2xl p-4 transition-all active:scale-98"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${color}25`,
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl flex-shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-bold text-[14px]">{title}</span>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: `${color}20`, color }}
                  >
                    {tag}
                  </span>
                </div>
                <div className="font-semibold text-[12px] mb-0.5" style={{ color }}>{subtitle}</div>
                <p className="text-white/40 text-[11px] leading-snug">{desc}</p>
              </div>
              <span className="text-white/20 text-lg">›</span>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 pb-8 text-center">
        <p className="text-white/20 text-[10px]">
          "Duolingo for Manual Driving" • Real clutch physics • No racing
        </p>
      </div>
    </div>
  );
}
