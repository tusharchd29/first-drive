'use client';

import React from 'react';
import { SkillStats } from '../lib/gameStore';

interface SkillBarProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  description: string;
}

function SkillBar({ label, value, icon, color, description }: SkillBarProps) {
  const rounded = Math.round(value);
  const grade = rounded >= 80 ? 'A' : rounded >= 60 ? 'B' : rounded >= 40 ? 'C' : 'D';
  const gradeColor = rounded >= 80 ? '#4ade80' : rounded >= 60 ? '#22d3ee' : rounded >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 flex-shrink-0">{icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white text-[12px] font-semibold">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]" style={{ color: gradeColor, fontWeight: 'bold' }}>
              {grade}
            </span>
            <span className="text-[11px] font-bold" style={{ color }}>{rounded}%</span>
          </div>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, background: '#ffffff10' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${rounded}%`,
              background: `linear-gradient(to right, ${color}88, ${color})`,
              boxShadow: `0 0 8px ${color}60`,
            }}
          />
        </div>
        <p className="text-[10px] text-white/40 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

const SKILLS_CONFIG = [
  {
    key: 'clutchControl' as keyof SkillStats,
    label: 'Clutch Control',
    icon: '🦶',
    color: '#f59e0b',
    description: 'Smooth bite point engagement',
  },
  {
    key: 'gearSelection' as keyof SkillStats,
    label: 'Gear Selection',
    icon: '⚙️',
    color: '#22d3ee',
    description: 'Right gear for the right speed',
  },
  {
    key: 'smoothBraking' as keyof SkillStats,
    label: 'Smooth Braking',
    icon: '🛑',
    color: '#ef4444',
    description: 'Progressive, controlled stops',
  },
  {
    key: 'hillStarts' as keyof SkillStats,
    label: 'Hill Starts',
    icon: '⛰️',
    color: '#8b5cf6',
    description: 'Handbrake + clutch + gas coordination',
  },
  {
    key: 'parkingAccuracy' as keyof SkillStats,
    label: 'Parking',
    icon: '🅿️',
    color: '#4ade80',
    description: 'Precise low-speed maneuvering',
  },
];

interface SkillsDashboardProps {
  skills: SkillStats;
  stallCount: number;
  distance: number;
  sessionTime: number;
  onBack: () => void;
}

export function SkillsDashboard({
  skills, stallCount, distance, sessionTime, onBack
}: SkillsDashboardProps) {
  const avg = Math.round(
    Object.values(skills).reduce((a, b) => a + b, 0) / Object.values(skills).length
  );
  const minutes = Math.floor(sessionTime / 60);
  const seconds = Math.floor(sessionTime % 60);

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{ background: '#080c14', color: 'white' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 pt-safe"
        style={{
          background: 'linear-gradient(to bottom, #0f1929, transparent)',
          paddingTop: 48, paddingBottom: 16,
        }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          ←
        </button>
        <div>
          <h1 className="text-lg font-black tracking-tight">Skill Report</h1>
          <p className="text-[11px] text-white/40">This session</p>
        </div>
        <div className="ml-auto text-right">
          <div
            className="text-3xl font-black"
            style={{ color: avg >= 60 ? '#4ade80' : '#f59e0b' }}
          >
            {avg}%
          </div>
          <div className="text-[10px] text-white/40">Overall</div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex justify-around px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="text-center">
          <div className="text-xl font-bold text-[#ef4444]">{stallCount}</div>
          <div className="text-[10px] text-white/40">Stalls</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#22d3ee]">{Math.round(distance)}m</div>
          <div className="text-[10px] text-white/40">Distance</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-[#4ade80]">{minutes}:{String(seconds).padStart(2, '0')}</div>
          <div className="text-[10px] text-white/40">Time</div>
        </div>
      </div>

      {/* Skill bars */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {SKILLS_CONFIG.map((cfg) => (
          <SkillBar
            key={cfg.key}
            label={cfg.label}
            value={skills[cfg.key]}
            icon={cfg.icon}
            color={cfg.color}
            description={cfg.description}
          />
        ))}
      </div>

      {/* Tip */}
      <div
        className="mx-4 mb-6 p-3 rounded-xl"
        style={{ background: 'rgba(34, 211, 238, 0.08)', border: '1px solid rgba(34,211,238,0.15)' }}
      >
        <p className="text-[11px] text-[#22d3ee]">
          💡 <strong>Focus area:</strong>{' '}
          {skills.clutchControl < skills.gearSelection
            ? 'Practice the bite point — slow and steady through that 40-60% zone.'
            : 'Work on gear timing — shift up earlier when you hit 15-20 km/h.'}
        </p>
      </div>
    </div>
  );
}
