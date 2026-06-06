'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';

// ─── Touch ID tracking ────────────────────────────────────────────────────────
// Each interactive element tracks its own touch identifier so multi-touch works

interface SliderPedalProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  icon: string;
  releaseToZero?: boolean; // if true, releasing finger snaps back to 0
}

function SliderPedal({ label, value, onChange, color, icon, releaseToZero = true }: SliderPedalProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);

  const getVal = useCallback((clientY: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const pct = 1 - (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(100, pct * 100));
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    onChange(getVal(t.clientY));
  }, [onChange, getVal]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        onChange(getVal(e.changedTouches[i].clientY));
        break;
      }
    }
  }, [onChange, getVal]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null;
        if (releaseToZero) onChange(0);
        break;
      }
    }
  }, [onChange, releaseToZero]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onTouchMove, onTouchEnd]);

  // Mouse support (desktop testing)
  const mouseDown = useRef(false);
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDown.current = true;
    onChange(getVal(e.clientY));
  }, [onChange, getVal]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (mouseDown.current) onChange(getVal(e.clientY));
    };
    const onUp = () => {
      if (mouseDown.current) {
        mouseDown.current = false;
        if (releaseToZero) onChange(0);
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onChange, getVal, releaseToZero]);

  const isActive = value > 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold tracking-wide" style={{ color: isActive ? color : `${color}66` }}>
        {label}
      </span>
      <div
        ref={trackRef}
        className="relative rounded-2xl select-none"
        style={{
          width: 52,
          height: 120,
          background: 'rgba(255,255,255,0.04)',
          border: `2px solid ${isActive ? color : `${color}30`}`,
          touchAction: 'none',
          transition: 'border-color 0.1s',
          cursor: 'pointer',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Fill from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 rounded-xl"
          style={{
            height: `${value}%`,
            background: `linear-gradient(to top, ${color}, ${color}66)`,
            boxShadow: isActive ? `0 0 12px ${color}50` : 'none',
            transition: 'box-shadow 0.1s',
          }}
        />
        {/* Icon centered */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 2 }}>
          <span style={{ fontSize: 22 }}>{icon}</span>
        </div>
        {/* Value */}
        <div
          className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-black pointer-events-none"
          style={{ color: isActive ? color : `${color}50`, zIndex: 3 }}
        >
          {Math.round(value)}
        </div>
      </div>
    </div>
  );
}

// ─── Clutch Pedal ─────────────────────────────────────────────────────────────
// Drag DOWN to press clutch (like a real pedal)
// Stays where you leave it (no spring return) — you control the release

interface ClutchPedalProps {
  value: number;  // 0=released, 100=fully pressed
  onChange: (v: number) => void;
}

function ClutchPedal({ value, onChange }: ClutchPedalProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const mouseDown = useRef(false);

  const getVal = useCallback((clientY: number) => {
    const el = trackRef.current;
    if (!el) return value;
    const rect = el.getBoundingClientRect();
    // drag from top=pressed(100) to bottom=released(0)
    const pct = (clientY - rect.top) / rect.height;
    return Math.max(0, Math.min(100, pct * 100));
  }, [value]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    onChange(getVal(t.clientY));
  }, [onChange, getVal]);

  const onTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        onChange(getVal(e.changedTouches[i].clientY));
        break;
      }
    }
  }, [onChange, getVal]);

  const onTouchEnd = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null;
        // NO snap-back — clutch stays where released (intentional)
        break;
      }
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    return () => {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [onTouchMove, onTouchEnd]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (mouseDown.current) onChange(getVal(e.clientY));
    };
    const onUp = () => { mouseDown.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [onChange, getVal]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    mouseDown.current = true;
    onChange(getVal(e.clientY));
  }, [onChange, getVal]);

  // 0=released, 100=fully pressed
  // Bite zone is 38–62% pressed
  const inBite = value >= 38 && value <= 62;
  const isPressed = value > 70;
  const color = inBite ? '#f59e0b' : isPressed ? '#4ade80' : '#94a3b8';

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold tracking-wide" style={{ color }}>
        CLUTCH
      </span>
      <div
        ref={trackRef}
        className="relative rounded-2xl select-none overflow-hidden"
        style={{
          width: 52,
          height: 120,
          background: 'rgba(255,255,255,0.04)',
          border: `2px solid ${color}60`,
          touchAction: 'none',
          transition: 'border-color 0.1s',
          cursor: 'pointer',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Bite zone band */}
        <div
          className="absolute left-0 right-0"
          style={{
            top: '38%',
            height: '24%',
            background: '#f59e0b12',
            borderTop: '1px dashed #f59e0b50',
            borderBottom: '1px dashed #f59e0b50',
            zIndex: 1,
          }}
        />

        {/* Fill indicator — shows how far clutch is pressed (from top) */}
        <div
          className="absolute top-0 left-0 right-0"
          style={{
            height: `${value}%`,
            background: `linear-gradient(to bottom, ${color}, ${color}44)`,
            boxShadow: inBite ? `0 0 14px ${color}70` : 'none',
            transition: 'box-shadow 0.1s',
            zIndex: 0,
          }}
        />

        {/* Drag handle indicator */}
        <div
          className="absolute left-0 right-0 flex justify-center"
          style={{
            top: `${value}%`,
            transform: 'translateY(-50%)',
            zIndex: 4,
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        </div>

        {/* Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 3 }}>
          <span style={{ fontSize: 22, opacity: 0.6 }}>🦶</span>
        </div>

        {/* Bite label */}
        {inBite && (
          <div
            className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-black animate-pulse pointer-events-none"
            style={{ color: '#f59e0b', zIndex: 5 }}
          >
            ✦ BITE
          </div>
        )}

        {/* Press % */}
        {!inBite && (
          <div
            className="absolute bottom-1 left-0 right-0 text-center text-[10px] font-bold pointer-events-none"
            style={{ color: `${color}80`, zIndex: 5 }}
          >
            {Math.round(value)}
          </div>
        )}
      </div>
      {/* Hint */}
      <span className="text-[8px] text-white/30">
        {value < 10 ? 'Released' : isPressed ? 'Pressed' : inBite ? '↕ Bite zone' : 'Drag ↕'}
      </span>
    </div>
  );
}

// ─── Steering ─────────────────────────────────────────────────────────────────
// Simple hold-L / hold-R buttons. Much more usable than swipe wheel.

interface SteeringProps {
  value: number;
  onChange: (v: number) => void;
}

function SteeringControls({ value, onChange }: SteeringProps) {
  const leftTouchId = useRef<number | null>(null);
  const rightTouchId = useRef<number | null>(null);

  const handleLeft = useCallback((active: boolean, identifier?: number) => {
    if (active) {
      leftTouchId.current = identifier ?? -1;
      onChange(-1);
    } else {
      leftTouchId.current = null;
      if (rightTouchId.current === null) onChange(0);
    }
  }, [onChange]);

  const handleRight = useCallback((active: boolean, identifier?: number) => {
    if (active) {
      rightTouchId.current = identifier ?? -1;
      onChange(1);
    } else {
      rightTouchId.current = null;
      if (leftTouchId.current === null) onChange(0);
    }
  }, [onChange]);

  const isLeft = value < -0.1;
  const isRight = value > 0.1;

  const btnBase: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 16,
    fontSize: 22,
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    touchAction: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-white/40">STEER</span>
      <div className="flex items-center gap-2">
        <button
          style={{
            ...btnBase,
            background: isLeft ? '#22d3ee' : 'rgba(255,255,255,0.08)',
            boxShadow: isLeft ? '0 0 16px #22d3ee60' : 'none',
            transform: isLeft ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.07s',
          }}
          onTouchStart={(e) => { e.preventDefault(); handleLeft(true, e.changedTouches[0].identifier); }}
          onTouchEnd={(e) => { e.preventDefault(); handleLeft(false); }}
          onTouchCancel={(e) => { e.preventDefault(); handleLeft(false); }}
          onMouseDown={() => handleLeft(true)}
          onMouseUp={() => handleLeft(false)}
          onMouseLeave={() => handleLeft(false)}
        >
          ◀
        </button>

        {/* Center indicator */}
        <div
          className="flex flex-col items-center justify-center rounded-xl"
          style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.04)' }}
        >
          <div
            style={{
              width: 24,
              height: 3,
              borderRadius: 2,
              background: '#ffffff20',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: value === 0 ? '#ffffff40' : '#22d3ee',
                top: -2.5,
                left: `${(value + 1) / 2 * 16}px`,
                transition: 'left 0.05s',
                boxShadow: value !== 0 ? '0 0 6px #22d3ee' : 'none',
              }}
            />
          </div>
        </div>

        <button
          style={{
            ...btnBase,
            background: isRight ? '#22d3ee' : 'rgba(255,255,255,0.08)',
            boxShadow: isRight ? '0 0 16px #22d3ee60' : 'none',
            transform: isRight ? 'scale(1.08)' : 'scale(1)',
            transition: 'all 0.07s',
          }}
          onTouchStart={(e) => { e.preventDefault(); handleRight(true, e.changedTouches[0].identifier); }}
          onTouchEnd={(e) => { e.preventDefault(); handleRight(false); }}
          onTouchCancel={(e) => { e.preventDefault(); handleRight(false); }}
          onMouseDown={() => handleRight(true)}
          onMouseUp={() => handleRight(false)}
          onMouseLeave={() => handleRight(false)}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

// ─── Gear Shifter ─────────────────────────────────────────────────────────────

interface GearShifterProps {
  currentGear: number;
  onGearChange: (g: number) => void;
  clutchPressed: boolean;
}

function GearShifter({ currentGear, onGearChange, clutchPressed }: GearShifterProps) {
  const [flash, setFlash] = useState(false);

  const gears = [
    { g: 1, label: '1', col: 1, row: 1 },
    { g: 2, label: '2', col: 2, row: 1 },
    { g: 3, label: '3', col: 3, row: 1 },
    { g: 4, label: '4', col: 1, row: 2 },
    { g: 5, label: '5', col: 2, row: 2 },
    { g: 0, label: 'N', col: 3, row: 2 },
  ];

  const handleGearTap = useCallback((g: number) => {
    if (!clutchPressed) {
      setFlash(true);
      setTimeout(() => setFlash(false), 400);
      if ('vibrate' in navigator) navigator.vibrate(50);
      return;
    }
    onGearChange(g);
  }, [clutchPressed, onGearChange]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-white/40">GEARS</span>
      <div
        className="rounded-xl p-1.5"
        style={{
          background: flash ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${flash ? '#ef4444' : 'rgba(255,255,255,0.1)'}`,
          transition: 'all 0.1s',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}
      >
        {gears.map(({ g, label, col, row }) => {
          const isActive = currentGear === g;
          const gColor = g === 0 ? '#f59e0b' : '#4ade80';
          return (
            <button
              key={g}
              onTouchStart={(e) => { e.preventDefault(); handleGearTap(g); }}
              onClick={() => handleGearTap(g)}
              style={{
                gridColumn: col,
                gridRow: row,
                width: 38,
                height: 34,
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 'bold',
                fontFamily: 'monospace',
                background: isActive ? gColor : 'rgba(255,255,255,0.06)',
                color: isActive ? '#000' : clutchPressed ? '#fff' : '#ffffff50',
                border: isActive ? `2px solid ${gColor}` : '1.5px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'all 0.1s',
                boxShadow: isActive ? `0 0 10px ${gColor}60` : 'none',
                touchAction: 'manipulation',
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
      <span
        className="text-[9px] font-semibold"
        style={{ color: clutchPressed ? '#4ade80' : flash ? '#ef4444' : '#ffffff30' }}
      >
        {clutchPressed ? '✓ Clutch OK' : flash ? '⚠ Press clutch!' : 'Press clutch first'}
      </span>
    </div>
  );
}

// ─── Main Controls ─────────────────────────────────────────────────────────────

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
  const clutchPressed = clutch > 65;

  return (
    <div
      style={{
        background: 'rgba(8,12,20,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 8px 10px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 6,
      }}
    >
      {/* LEFT: 3 pedals */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        <ClutchPedal value={clutch} onChange={onClutch} />
        <SliderPedal label="BRAKE" value={brake} onChange={onBrake} color="#ef4444" icon="🛑" releaseToZero={true} />
        <SliderPedal label="GAS" value={throttle} onChange={onThrottle} color="#4ade80" icon="⛽" releaseToZero={true} />
      </div>

      {/* CENTER: Start button + Steering */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        {/* Always show start/restart state */}
        {(!engineOn || isStalled) ? (
          <button
            onTouchStart={(e) => { e.preventDefault(); onStart(); }}
            onClick={onStart}
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: isStalled ? '#dc2626' : '#16a34a',
              color: 'white',
              fontWeight: 'bold',
              fontSize: 10,
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 0 20px ${isStalled ? '#dc262680' : '#16a34a80'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              touchAction: 'manipulation',
              lineHeight: 1,
            }}
          >
            <span style={{ fontSize: 18 }}>{isStalled ? '🔁' : '▶'}</span>
            <span>{isStalled ? 'RESTART' : 'START'}</span>
          </button>
        ) : (
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: '50%',
              background: 'rgba(22,163,74,0.12)',
              border: '2px solid #16a34a40',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: 14 }}>🟢</span>
            <span style={{ fontSize: 8, color: '#16a34a', fontWeight: 'bold' }}>ON</span>
          </div>
        )}
        <SteeringControls value={steering} onChange={onSteering} />
      </div>

      {/* RIGHT: Gear shifter */}
      <GearShifter currentGear={gear} onGearChange={onGear} clutchPressed={clutchPressed} />
    </div>
  );
}
