'use client';
import React from 'react';
import { CarState, getGearLabel } from '../lib/carPhysics';

export function Gauges({ car }: { car: CarState }) {
  const rpm = car.rpm;
  const rpmPct = Math.min(1, rpm / 6000);
  const speed = Math.max(0, Math.round(Math.abs(car.speed)));
  const gear = car.gear;
  const gearLabel = getGearLabel(gear);
  const inBite = car.clutchPedal >= 38 && car.clutchPedal <= 62;

  const rpmColor = rpmPct > 0.8 ? '#e53935' : rpmPct > 0.65 ? '#fb8c00' : '#1e88e5';
  const gearColor = gear === 0 ? '#fb8c00' : gear < 0 ? '#e53935' : '#2e7d32';
  const speedColor = speed > 60 ? '#e53935' : speed > 30 ? '#fb8c00' : '#1a1a1a';

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      maxWidth: 400,
    }}>
      {/* RPM bar */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: '#666' }}>RPM</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: rpmColor }}>{Math.round(rpm)}</span>
        </div>
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${rpmPct * 100}%`,
            background: `linear-gradient(to right, #42a5f5, ${rpmColor})`,
            borderRadius: 4,
            transition: 'width 0.05s',
          }} />
        </div>
        {/* Redline marker */}
        <div style={{ position: 'relative', height: 4 }}>
          <div style={{
            position: 'absolute',
            left: '80%',
            top: 0,
            width: 1,
            height: 4,
            background: '#e53935',
          }} />
        </div>
      </div>

      {/* Speed */}
      <div style={{ textAlign: 'center', minWidth: 48 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: speedColor, lineHeight: 1 }}>{speed}</div>
        <div style={{ fontSize: 9, color: '#999', fontWeight: 600 }}>km/h</div>
      </div>

      {/* Gear */}
      <div style={{
        width: 44, height: 44,
        borderRadius: 10,
        background: `${gearColor}18`,
        border: `2px solid ${gearColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 900, color: gearColor,
        fontFamily: 'monospace',
      }}>
        {gearLabel}
      </div>

      {/* Status pill */}
      <div style={{
        padding: '4px 10px',
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        background: car.isStalled ? '#fdecea' :
                    !car.engineOn ? '#f5f5f5' :
                    inBite ? '#fff8e1' : '#e8f5e9',
        color: car.isStalled ? '#c62828' :
               !car.engineOn ? '#9e9e9e' :
               inBite ? '#e65100' : '#2e7d32',
        border: `1px solid ${car.isStalled ? '#ef9a9a' : inBite ? '#ffcc02' : '#a5d6a7'}`,
        whiteSpace: 'nowrap',
      }}>
        {car.isStalled ? '⚠ STALLED' :
         !car.engineOn ? '○ OFF' :
         inBite ? '✦ BITE!' : '● ON'}
      </div>
    </div>
  );
}
