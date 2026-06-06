'use client';
import React from 'react';
import { SkillStats } from '../lib/gameStore';

const SKILLS = [
  { key: 'clutchControl' as keyof SkillStats, label: 'Clutch Control', icon: '🦶', color: '#e65100' },
  { key: 'gearSelection' as keyof SkillStats, label: 'Gear Selection', icon: '⚙️', color: '#1565c0' },
  { key: 'smoothBraking' as keyof SkillStats, label: 'Smooth Braking', icon: '🛑', color: '#c62828' },
  { key: 'hillStarts' as keyof SkillStats, label: 'Hill Starts', icon: '⛰️', color: '#6a1b9a' },
  { key: 'parkingAccuracy' as keyof SkillStats, label: 'Parking', icon: '🅿️', color: '#2e7d32' },
];

export function SkillsDashboard({ skills, stallCount, distance, sessionTime, onBack }: {
  skills: SkillStats; stallCount: number; distance: number; sessionTime: number; onBack: () => void;
}) {
  const avg = Math.round(Object.values(skills).reduce((a, b) => a + b, 0) / 5);
  const mins = Math.floor(sessionTime / 60);
  const secs = Math.floor(sessionTime % 60);

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e8e8e8', padding: '40px 16px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onBack} style={{ background: '#f0f0f0', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a' }}>Skill Report</div>
          <div style={{ fontSize: 11, color: '#999' }}>This session</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 30, fontWeight: 900, color: avg >= 60 ? '#2e7d32' : '#e65100' }}>{avg}%</div>
          <div style={{ fontSize: 10, color: '#999' }}>Overall</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-around' }}>
        {[
          { label: 'Stalls', value: stallCount, color: '#c62828' },
          { label: 'Distance', value: `${Math.round(distance)}m`, color: '#1565c0' },
          { label: 'Time', value: `${mins}:${String(secs).padStart(2,'0')}`, color: '#2e7d32' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: '#999' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skill bars */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SKILLS.map(({ key, label, icon, color }) => {
          const val = Math.round(skills[key]);
          const grade = val >= 80 ? 'A' : val >= 60 ? 'B' : val >= 40 ? 'C' : 'D';
          return (
            <div key={key} style={{ background: 'white', borderRadius: 12, padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1a1a1a' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 900, color, minWidth: 28, textAlign: 'right' }}>{grade}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{val}%</span>
              </div>
              <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${val}%`, background: `linear-gradient(to right, ${color}88, ${color})`, borderRadius: 4, transition: 'width 0.6s' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '12px 16px 24px' }}>
        <div style={{ background: '#e3f2fd', borderRadius: 12, padding: '10px 14px', border: '1px solid #90caf9' }}>
          <p style={{ fontSize: 11, color: '#0d47a1', margin: 0, fontWeight: 600 }}>
            💡 Focus: {skills.clutchControl < 50 ? 'Practice the bite point — slow drag through 38–62%.' : 'Work on gear timing — shift up at 15 km/h intervals.'}
          </p>
        </div>
      </div>
    </div>
  );
}
