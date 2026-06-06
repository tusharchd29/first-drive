'use client';
import React from 'react';
import { GamePhase } from '../lib/gameStore';

const ITEMS = [
  { phase: 'lesson_1' as GamePhase, title: 'Lesson 1', subtitle: 'Find the Bite Point', desc: 'Empty parking lot. Learn clutch from zero.', icon: '🅿️', color: '#1565c0', tag: 'START HERE' },
  { phase: 'stall_challenge' as GamePhase, title: 'Stall Challenge', subtitle: 'Hill Start & Recovery', desc: 'Stall on purpose. Remove the fear.', icon: '⛰️', color: '#e65100', tag: 'INTERMEDIATE' },
  { phase: 'free_drive' as GamePhase, title: 'Free Drive', subtitle: 'Open Town', desc: 'Explore freely. No pressure.', icon: '🏙️', color: '#2e7d32', tag: 'SANDBOX' },
];

export function MainMenu({ onSelect }: { onSelect: (p: GamePhase) => void }) {
  return (
    <div style={{ background: '#f5f7fa', minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e8e8e8',
        padding: '32px 20px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 28 }}>🚗</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#1565c0', textTransform: 'uppercase' }}>First Drive</span>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#1a1a1a', margin: 0, lineHeight: 1.2 }}>
          Learn Manual<br />Driving
        </h1>
        <p style={{ fontSize: 12, color: '#888', marginTop: 6, marginBottom: 0 }}>
          Real clutch physics · Instructor AI · No racing
        </p>
      </div>

      {/* Cards */}
      <div style={{ flex: 1, padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }}>
        {ITEMS.map(({ phase, title, subtitle, desc, icon, color, tag }) => (
          <button
            key={phase}
            onClick={() => onSelect(phase)}
            style={{
              background: 'white', border: `1.5px solid ${color}30`,
              borderRadius: 16, padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 14,
              textAlign: 'left', cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.1s',
            }}
          >
            <span style={{ fontSize: 36, flexShrink: 0 }}>{icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{title}</span>
                <span style={{
                  fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 10,
                  background: `${color}15`, color,
                }}>{tag}</span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 2 }}>{subtitle}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{desc}</div>
            </div>
            <span style={{ color: '#ccc', fontSize: 18 }}>›</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '12px 20px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#bbb', margin: 0 }}>
          "Duolingo for Manual Driving" — understand clutch before your first real lesson
        </p>
      </div>
    </div>
  );
}
