'use client';

import React from 'react';
import { CarState, getGearLabel } from '../lib/carPhysics';

interface GaugesProps {
  car: CarState;
}

export function RPMGauge({ value, max = 6000 }: { value: number; max?: number }) {
  const pct = Math.min(1, value / max);
  const angle = -135 + pct * 270;
  const isRedline = pct > 0.8;
  const isWarning = pct > 0.65;

  const color = isRedline ? '#ef4444' : isWarning ? '#f59e0b' : '#22d3ee';

  // SVG arc
  const r = 38;
  const cx = 50, cy = 50;
  const startAngle = -135 * (Math.PI / 180);
  const sweepAngle = pct * 270 * (Math.PI / 180);
  const endAngle = startAngle + sweepAngle;
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const largeArc = sweepAngle > Math.PI ? 1 : 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 100 100">
        {/* Background arc */}
        <path
          d={`M ${cx + r * Math.cos(-135 * Math.PI / 180)} ${cy + r * Math.sin(-135 * Math.PI / 180)} A ${r} ${r} 0 1 1 ${cx + r * Math.cos(135 * Math.PI / 180)} ${cy + r * Math.sin(135 * Math.PI / 180)}`}
          fill="none"
          stroke="#ffffff15"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Value arc */}
        {pct > 0.01 && (
          <path
            d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        )}
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={cx + 28 * Math.cos(angle * Math.PI / 180)}
          y2={cy + 28 * Math.sin(angle * Math.PI / 180)}
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="4" fill={color} />
        {/* RPM text */}
        <text x={cx} y={cy + 18} textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">
          {Math.round(value / 100) * 100}
        </text>
        <text x={cx} y={cy + 27} textAnchor="middle" fill="#ffffff60" fontSize="6">
          RPM
        </text>
      </svg>
    </div>
  );
}

export function SpeedGauge({ value }: { value: number }) {
  const speed = Math.max(0, Math.round(Math.abs(value)));
  const pct = Math.min(1, speed / 120);
  const color = speed > 80 ? '#ef4444' : speed > 50 ? '#f59e0b' : '#4ade80';

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: 72, height: 72,
          background: `conic-gradient(${color} ${pct * 360}deg, #ffffff10 0deg)`,
          boxShadow: `0 0 12px ${color}40`,
        }}
      >
        <div className="absolute inset-[5px] rounded-full bg-[#111] flex flex-col items-center justify-center">
          <span className="text-white font-bold text-lg leading-none">{speed}</span>
          <span className="text-[#ffffff60] text-[9px]">km/h</span>
        </div>
      </div>
    </div>
  );
}

export function GearIndicator({ gear }: { gear: number }) {
  const label = getGearLabel(gear);
  const isNeutral = gear === 0;
  const isReverse = gear < 0;
  const color = isNeutral ? '#f59e0b' : isReverse ? '#ef4444' : '#4ade80';

  return (
    <div
      className="flex items-center justify-center rounded-xl font-black text-3xl"
      style={{
        width: 56, height: 56,
        color,
        background: `${color}15`,
        border: `2px solid ${color}40`,
        textShadow: `0 0 12px ${color}`,
        fontFamily: 'monospace',
      }}
    >
      {label}
    </div>
  );
}

export function ClutchBiteIndicator({ clutchPedal }: { clutchPedal: number }) {
  // clutchPedal: 100 = fully pressed, 0 = released
  const pedalPos = 100 - clutchPedal; // 0=disengaged, 100=engaged
  const inBiteZone = pedalPos >= 38 && pedalPos <= 62;
  const isEngaged = pedalPos > 62;

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: 32 }}>
      <span className="text-[#ffffff60] text-[8px] font-medium">CLUTCH</span>
      <div className="relative rounded-full overflow-hidden" style={{ width: 16, height: 80, background: '#ffffff10' }}>
        {/* Fill from bottom */}
        <div
          className="absolute bottom-0 w-full rounded-full transition-all duration-75"
          style={{
            height: `${pedalPos}%`,
            background: inBiteZone
              ? 'linear-gradient(to top, #f59e0b, #fde68a)'
              : isEngaged
              ? 'linear-gradient(to top, #4ade80, #86efac)'
              : '#ef444460',
            boxShadow: inBiteZone ? '0 0 8px #f59e0b' : 'none',
          }}
        />
        {/* Bite zone markers */}
        <div className="absolute w-full" style={{ bottom: '38%', height: 1, background: '#f59e0b80' }} />
        <div className="absolute w-full" style={{ bottom: '62%', height: 1, background: '#f59e0b80' }} />
      </div>
      {inBiteZone && (
        <span className="text-[#f59e0b] text-[7px] font-bold animate-pulse">BITE!</span>
      )}
    </div>
  );
}

export function FuelBar({ level }: { level: number }) {
  const color = level > 50 ? '#4ade80' : level > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px]">⛽</span>
      <div className="rounded-full overflow-hidden" style={{ width: 40, height: 6, background: '#ffffff10' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${level}%`, background: color }}
        />
      </div>
    </div>
  );
}

export function Gauges({ car }: GaugesProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <ClutchBiteIndicator clutchPedal={car.clutchPedal} />
      <div className="w-px h-12 bg-white/10" />
      <RPMGauge value={car.rpm} />
      <GearIndicator gear={car.gear} />
      <SpeedGauge value={car.speed} />
      <div className="flex flex-col gap-2 items-end">
        <FuelBar level={car.fuelLevel} />
        {car.isStalled && (
          <span className="text-[#ef4444] text-[9px] font-bold animate-pulse">STALLED</span>
        )}
        {!car.engineOn && !car.isStalled && (
          <span className="text-[#ffffff40] text-[9px]">ENGINE OFF</span>
        )}
      </div>
    </div>
  );
}
