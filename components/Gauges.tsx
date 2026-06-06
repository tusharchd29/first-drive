'use client';

import React from 'react';
import { CarState, getGearLabel } from '../lib/carPhysics';

interface GaugesProps {
  car: CarState;
}

export function RPMGauge({ value, max = 6000 }: { value: number; max?: number }) {
  const pct = Math.min(1, value / max);
  const isRedline = pct > 0.8;
  const isWarning = pct > 0.65;
  const color = isRedline ? '#ef4444' : isWarning ? '#f59e0b' : '#22d3ee';

  const r = 32;
  const cx = 42, cy = 42;
  const startAngle = -135 * (Math.PI / 180);
  const sweepAngle = pct * 270 * (Math.PI / 180);
  const endAngle = startAngle + sweepAngle;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = sweepAngle > Math.PI ? 1 : 0;
  const needleAngle = -135 + pct * 270;

  return (
    <svg width="76" height="76" viewBox="0 0 84 84">
      <path
        d={`M ${cx + r * Math.cos(-135 * Math.PI / 180)} ${cy + r * Math.sin(-135 * Math.PI / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(135 * Math.PI / 180)} ${cy + r * Math.sin(135 * Math.PI / 180)}`}
        fill="none" stroke="#ffffff12" strokeWidth="5" strokeLinecap="round"
      />
      {pct > 0.01 && (
        <path
          d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
          fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 3px ${color})` }}
        />
      )}
      <line
        x1={cx} y1={cy}
        x2={cx + 22 * Math.cos(needleAngle * Math.PI / 180)}
        y2={cy + 22 * Math.sin(needleAngle * Math.PI / 180)}
        stroke={color} strokeWidth="2" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="3.5" fill={color} />
      <text x={cx} y={cy + 15} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
        {value < 100 ? '0' : Math.round(value / 100) * 100}
      </text>
      <text x={cx} y={cx + 22} textAnchor="middle" fill="#ffffff50" fontSize="6">RPM</text>
    </svg>
  );
}

export function SpeedGauge({ value }: { value: number }) {
  const speed = Math.max(0, Math.round(Math.abs(value)));
  const pct = Math.min(1, speed / 120);
  const color = speed > 80 ? '#ef4444' : speed > 50 ? '#f59e0b' : '#4ade80';

  return (
    <div
      style={{
        width: 64, height: 64,
        borderRadius: '50%',
        background: `conic-gradient(${color} ${pct * 360}deg, #ffffff08 0deg)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: speed > 5 ? `0 0 10px ${color}40` : 'none',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute', inset: 5, borderRadius: '50%',
          background: '#0a0e1a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: 15, lineHeight: 1 }}>{speed}</span>
        <span style={{ color: '#ffffff50', fontSize: 8 }}>km/h</span>
      </div>
    </div>
  );
}

export function GearIndicator({ gear }: { gear: number }) {
  const label = getGearLabel(gear);
  const color = gear === 0 ? '#f59e0b' : gear < 0 ? '#ef4444' : '#4ade80';
  return (
    <div style={{
      width: 48, height: 48,
      borderRadius: 12,
      background: `${color}18`,
      border: `2px solid ${color}50`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: 22, fontWeight: 900, fontFamily: 'monospace',
      textShadow: `0 0 10px ${color}`,
    }}>
      {label}
    </div>
  );
}

export function Gauges({ car }: GaugesProps) {
  // clutchPedal: 0=released, 100=fully pressed
  const inBite = car.clutchPedal >= 38 && car.clutchPedal <= 62;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 12px',
      borderRadius: 16,
      background: 'rgba(0,0,0,0.7)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}>
      <RPMGauge value={car.rpm} />
      <GearIndicator gear={car.gear} />
      <SpeedGauge value={car.speed} />

      {/* Status column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end', minWidth: 52 }}>
        {/* Fuel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>⛽</span>
          <div style={{ width: 36, height: 5, borderRadius: 3, background: '#ffffff10', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${car.fuelLevel}%`,
              background: car.fuelLevel > 50 ? '#4ade80' : car.fuelLevel > 20 ? '#f59e0b' : '#ef4444',
              borderRadius: 3,
            }} />
          </div>
        </div>

        {/* Engine/stall status */}
        {car.isStalled ? (
          <span style={{ color: '#ef4444', fontSize: 9, fontWeight: 'bold', animation: 'pulse 1s infinite' }}>
            ⚠ STALLED
          </span>
        ) : !car.engineOn ? (
          <span style={{ color: '#ffffff30', fontSize: 9 }}>ENGINE OFF</span>
        ) : inBite ? (
          <span style={{ color: '#f59e0b', fontSize: 9, fontWeight: 'bold' }}>✦ BITE POINT</span>
        ) : (
          <span style={{ color: '#4ade80', fontSize: 9 }}>● RUNNING</span>
        )}

        {/* Stall count */}
        {car.stallCount > 0 && (
          <span style={{ color: '#ef444480', fontSize: 8 }}>
            {car.stallCount} stall{car.stallCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
