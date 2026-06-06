'use client';

import React, { useRef, useCallback, useEffect } from 'react';

interface PedalProps {
  label: string;
  value: number;         // 0-100
  onChange: (v: number) => void;
  color: string;
  icon: string;
  inverted?: boolean;    // clutch is "pressed = engaged"
}

function Pedal({ label, value, onChange, color, icon, inverted }: PedalProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isActive = useRef(false);

  const getValueFromEvent = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const pct = 1 - (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(100, pct * 100));
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isActive.current = true;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    onChange(getValueFromEvent(clientY));
  }, [onChange, getValueFromEvent]);

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isActive.current) return;
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    onChange(getValueFromEvent(clientY));
  }, [onChange, getValueFromEvent]);

  const handleEnd = useCallback(() => {
    if (!isActive.current) return;
    isActive.current = false;
    onChange(0);
  }, [onChange]);

  useEffect(() => {
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [handleMove, handleEnd]);

  const displayValue = inverted ? 100 - value : value;
  const fillPct = displayValue;

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: 52 }}>
      <span className="text-[9px] font-semibold tracking-wider" style={{ color: `${color}cc` }}>
        {label}
      </span>
      <div
        ref={trackRef}
        className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{
          width: 48,
          height: 110,
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${color}30`,
          touchAction: 'none',
        }}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
      >
        {/* Fill */}
        <div
          className="absolute bottom-0 w-full rounded-b-xl transition-none"
          style={{
            height: `${fillPct}%`,
            background: `linear-gradient(to top, ${color}, ${color}88)`,
            boxShadow: fillPct > 5 ? `0 0 10px ${color}60` : 'none',
          }}
        />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
            {icon}
          </span>
        </div>
        {/* Value label */}
        <div
          className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold"
          style={{ color }}
        >
          {Math.round(fillPct)}
        </div>
      </div>
    </div>
  );
}

interface ClutchPedalProps {
  value: number;
  onChange: (v: number) => void;
}

// Clutch is special: pressed = disengaged (100), released = engaged (0)
// We show it inverted — top = fully pressed
function ClutchPedal({ value, onChange }: ClutchPedalProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isActive = useRef(false);

  const getValueFromEvent = useCallback((clientY: number) => {
    const track = trackRef.current;
    if (!track) return 100;
    const rect = track.getBoundingClientRect();
    // Top = fully pressed (100), bottom = released (0)
    const pct = (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(100, pct * 100));
  }, []);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    isActive.current = true;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    onChange(getValueFromEvent(clientY));
  }, [onChange, getValueFromEvent]);

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isActive.current) return;
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    onChange(getValueFromEvent(clientY));
  }, [onChange, getValueFromEvent]);

  const handleEnd = useCallback(() => {
    isActive.current = false;
    // Clutch spring returns to fully pressed when released
    onChange(100);
  }, [onChange]);

  useEffect(() => {
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    return () => {
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [handleMove, handleEnd]);

  const inBite = value >= 38 && value <= 62;
  const color = inBite ? '#f59e0b' : value < 38 ? '#ef4444' : '#4ade80';

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: 52 }}>
      <span className="text-[9px] font-semibold tracking-wider" style={{ color: `${color}cc` }}>
        CLUTCH
      </span>
      <div
        ref={trackRef}
        className="relative rounded-2xl overflow-hidden cursor-pointer select-none"
        style={{
          width: 48,
          height: 110,
          background: 'rgba(255,255,255,0.05)',
          border: `1.5px solid ${color}40`,
          touchAction: 'none',
          transition: 'border-color 0.1s',
        }}
        onTouchStart={handleStart}
        onMouseDown={handleStart}
      >
        {/* Bite zone markers */}
        <div className="absolute w-full" style={{ top: '38%', height: 1, background: '#f59e0b60', zIndex: 2 }} />
        <div className="absolute w-full" style={{ top: '62%', height: 1, background: '#f59e0b60', zIndex: 2 }} />

        {/* Fill from top (pressed down) */}
        <div
          className="absolute top-0 w-full"
          style={{
            height: `${value}%`,
            background: `linear-gradient(to bottom, ${color}, ${color}66)`,
            boxShadow: inBite ? `0 0 10px ${color}80` : 'none',
          }}
        />
        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 3 }}>
          <span style={{ fontSize: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>🦶</span>
        </div>
        {/* Bite indicator */}
        {inBite && (
          <div
            className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black animate-pulse"
            style={{ color: '#f59e0b', zIndex: 4 }}
          >
            BITE
          </div>
        )}
      </div>
    </div>
  );
}

interface SteeringProps {
  value: number;   // -1 to 1
  onChange: (v: number) => void;
}

function SteeringWheel({ value, onChange }: SteeringProps) {
  const wheelRef = useRef<HTMLDivElement>(null);

  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const wheel = wheelRef.current;
    if (!wheel) return;
    const rect = wheel.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const touch = e.touches[0];
    const dx = (touch.clientX - cx) / (rect.width / 2);
    onChange(Math.max(-1, Math.min(1, dx)));
  }, [onChange]);

  const handleTouchEnd = useCallback(() => {
    onChange(0);
  }, [onChange]);

  const rotation = value * 45;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-white/50">STEER</span>
      <div
        ref={wheelRef}
        className="rounded-full flex items-center justify-center cursor-pointer"
        style={{
          width: 72, height: 72,
          background: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.15)',
          touchAction: 'none',
        }}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: 'transform 0.05s',
            fontSize: 36,
          }}
        >
          🎡
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="text-white/60 text-lg px-2 py-1 rounded-lg active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', touchAction: 'none' }}
          onTouchStart={(e) => { e.preventDefault(); onChange(-1); }}
          onTouchEnd={() => onChange(0)}
        >◀</button>
        <button
          className="text-white/60 text-lg px-2 py-1 rounded-lg active:scale-95"
          style={{ background: 'rgba(255,255,255,0.08)', touchAction: 'none' }}
          onTouchStart={(e) => { e.preventDefault(); onChange(1); }}
          onTouchEnd={() => onChange(0)}
        >▶</button>
      </div>
    </div>
  );
}

interface GearShifterProps {
  currentGear: number;
  onGearChange: (g: number) => void;
  clutchPressed: boolean;
}

function GearShifter({ currentGear, onGearChange, clutchPressed }: GearShifterProps) {
  const gears = [
    { g: -1, label: 'R', col: 0, row: 2 },
    { g: 0,  label: 'N', col: 1, row: 1 },
    { g: 1,  label: '1', col: 0, row: 0 },
    { g: 2,  label: '2', col: 1, row: 0 },
    { g: 3,  label: '3', col: 2, row: 0 },
    { g: 4,  label: '4', col: 0, row: 2 },
    { g: 5,  label: '5', col: 2, row: 2 },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-semibold text-white/50">GEAR</span>
      <div
        className="grid gap-1 p-2 rounded-xl"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {gears.map(({ g, label, col, row }) => {
          const isActive = currentGear === g;
          const canChange = clutchPressed;
          return (
            <button
              key={g}
              onTouchStart={(e) => {
                e.preventDefault();
                if (canChange) onGearChange(g);
              }}
              onClick={() => { if (canChange) onGearChange(g); }}
              style={{
                gridColumn: col + 1,
                gridRow: row + 1,
                width: 32,
                height: 28,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                background: isActive ? (g === 0 ? '#f59e0b' : g < 0 ? '#ef4444' : '#4ade80') : 'rgba(255,255,255,0.08)',
                color: isActive ? '#000' : canChange ? '#fff' : '#ffffff40',
                border: isActive ? 'none' : '1px solid rgba(255,255,255,0.1)',
                cursor: canChange ? 'pointer' : 'not-allowed',
                transition: 'all 0.1s',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      {!clutchPressed && (
        <span className="text-[8px] text-[#ef4444]">Press clutch!</span>
      )}
    </div>
  );
}

interface ControlsProps {
  clutch: number;
  brake: number;
  throttle: number;
  steering: number;
  gear: number;
  onClutch: (v: number) => void;
  onBrake: (v: number) => void;
  onThrottle: (v: number) => void;
  onSteering: (v: number) => void;
  onGear: (g: number) => void;
  onStart: () => void;
  engineOn: boolean;
  isStalled: boolean;
}

export function Controls({
  clutch, brake, throttle, steering, gear,
  onClutch, onBrake, onThrottle, onSteering, onGear,
  onStart, engineOn, isStalled,
}: ControlsProps) {
  const clutchPressed = clutch > 70;

  return (
    <div
      className="flex items-end justify-between px-2 py-2 gap-1"
      style={{
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Left: Pedals */}
      <div className="flex items-end gap-1">
        <ClutchPedal value={clutch} onChange={onClutch} />
        <Pedal
          label="BRAKE"
          value={brake}
          onChange={onBrake}
          color="#ef4444"
          icon="🛑"
        />
        <Pedal
          label="GAS"
          value={throttle}
          onChange={onThrottle}
          color="#4ade80"
          icon="⛽"
        />
      </div>

      {/* Center: Start + Steering */}
      <div className="flex flex-col items-center gap-2">
        {(!engineOn || isStalled) && (
          <button
            onTouchStart={(e) => { e.preventDefault(); onStart(); }}
            onClick={onStart}
            className="rounded-full font-bold text-[11px] transition-all active:scale-95"
            style={{
              width: 52, height: 52,
              background: isStalled ? '#ef4444' : '#22c55e',
              color: 'white',
              boxShadow: `0 0 16px ${isStalled ? '#ef4444' : '#22c55e'}80`,
              border: 'none',
            }}
          >
            {isStalled ? '🔁' : '▶'}<br />
            <span className="text-[9px]">{isStalled ? 'RESTART' : 'START'}</span>
          </button>
        )}
        <SteeringWheel value={steering} onChange={onSteering} />
      </div>

      {/* Right: Gear shifter */}
      <GearShifter currentGear={gear} onGearChange={onGear} clutchPressed={clutchPressed} />
    </div>
  );
}
