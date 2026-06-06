'use client';
import React, { useRef, useCallback, useEffect, useState } from 'react';

// ─── Slider Pedal (Brake / Gas) ───────────────────────────────────────────────
function SliderPedal({
  label, value, onChange, color, icon,
}: {
  label: string; value: number; onChange: (v: number) => void;
  color: string; icon: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const mouseDown = useRef(false);

  const getVal = useCallback((clientY: number) => {
    const el = trackRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, (1 - (clientY - r.top) / r.height) * 100));
  }, []);

  const onTS = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    onChange(getVal(t.clientY));
  }, [onChange, getVal]);

  const onTM = useCallback((e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        onChange(getVal(e.changedTouches[i].clientY)); break;
      }
    }
  }, [onChange, getVal]);

  const onTE = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null; onChange(0); break;
      }
    }
  }, [onChange]);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    el.addEventListener('touchmove', onTM, { passive: false });
    el.addEventListener('touchend', onTE);
    el.addEventListener('touchcancel', onTE);
    return () => { el.removeEventListener('touchmove', onTM); el.removeEventListener('touchend', onTE); el.removeEventListener('touchcancel', onTE); };
  }, [onTM, onTE]);

  useEffect(() => {
    const mv = (e: MouseEvent) => { if (mouseDown.current) onChange(getVal(e.clientY)); };
    const up = () => { if (mouseDown.current) { mouseDown.current = false; onChange(0); } };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, [onChange, getVal]);

  const active = value > 2;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: active ? color : '#aaa', letterSpacing: 1 }}>{label}</span>
      <div
        ref={trackRef}
        onMouseDown={(e) => { mouseDown.current = true; onChange(getVal(e.clientY)); }}
        onTouchStart={onTS}
        style={{
          width: 48, height: 100,
          borderRadius: 14,
          background: '#f5f5f5',
          border: `2px solid ${active ? color : '#ddd'}`,
          position: 'relative',
          cursor: 'pointer',
          touchAction: 'none',
          overflow: 'hidden',
          transition: 'border-color 0.1s',
        }}
      >
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: `${value}%`,
          background: `linear-gradient(to top, ${color}, ${color}88)`,
          borderRadius: 12,
          boxShadow: active ? `0 0 8px ${color}60` : 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, zIndex: 2,
        }}>{icon}</div>
        <div style={{
          position: 'absolute', bottom: 3, left: 0, right: 0,
          textAlign: 'center', fontSize: 9, fontWeight: 700,
          color: active ? 'white' : '#bbb', zIndex: 3,
        }}>{Math.round(value)}</div>
      </div>
    </div>
  );
}

// ─── Clutch Pedal ─────────────────────────────────────────────────────────────
function ClutchPedal({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const touchId = useRef<number | null>(null);
  const mouseDown = useRef(false);

  // value 0=released, 100=fully pressed; drag from top=pressed
  const getVal = useCallback((clientY: number) => {
    const el = trackRef.current; if (!el) return value;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(100, ((clientY - r.top) / r.height) * 100));
  }, [value]);

  const onTS = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (touchId.current !== null) return;
    const t = e.changedTouches[0];
    touchId.current = t.identifier;
    onChange(getVal(t.clientY));
  }, [onChange, getVal]);

  const onTM = useCallback((e: TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        onChange(getVal(e.changedTouches[i].clientY)); break;
      }
    }
  }, [onChange, getVal]);

  const onTE = useCallback((e: TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchId.current) {
        touchId.current = null; break; // no snap
      }
    }
  }, []);

  useEffect(() => {
    const el = trackRef.current; if (!el) return;
    el.addEventListener('touchmove', onTM, { passive: false });
    el.addEventListener('touchend', onTE);
    el.addEventListener('touchcancel', onTE);
    return () => { el.removeEventListener('touchmove', onTM); el.removeEventListener('touchend', onTE); el.removeEventListener('touchcancel', onTE); };
  }, [onTM, onTE]);

  useEffect(() => {
    const mv = (e: MouseEvent) => { if (mouseDown.current) onChange(getVal(e.clientY)); };
    const up = () => { mouseDown.current = false; };
    window.addEventListener('mousemove', mv); window.addEventListener('mouseup', up);
    return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
  }, [onChange, getVal]);

  const inBite = value >= 38 && value <= 62;
  const pressed = value > 65;
  const color = inBite ? '#e65100' : pressed ? '#2e7d32' : '#1565c0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 1 }}>CLUTCH</span>
      <div
        ref={trackRef}
        onMouseDown={(e) => { mouseDown.current = true; onChange(getVal(e.clientY)); }}
        onTouchStart={onTS}
        style={{
          width: 48, height: 100,
          borderRadius: 14,
          background: '#f0f4ff',
          border: `2px solid ${inBite ? '#ff6d00' : pressed ? '#2e7d32' : '#90caf9'}`,
          position: 'relative',
          cursor: 'pointer',
          touchAction: 'none',
          overflow: 'hidden',
          transition: 'border-color 0.1s',
        }}
      >
        {/* Bite zone band */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          top: '38%', height: '24%',
          background: '#ff6d0015',
          borderTop: '1.5px dashed #ff6d0060',
          borderBottom: '1.5px dashed #ff6d0060',
          zIndex: 1,
        }} />
        {/* Fill from top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: `${value}%`,
          background: `linear-gradient(to bottom, ${color}, ${color}66)`,
          boxShadow: inBite ? `0 4px 12px ${color}50` : 'none',
          transition: 'box-shadow 0.1s',
        }} />
        {/* Drag handle */}
        <div style={{
          position: 'absolute', left: 6, right: 6,
          top: `${value}%`, transform: 'translateY(-50%)',
          height: 4, borderRadius: 2,
          background: color,
          boxShadow: `0 0 4px ${color}`,
          zIndex: 4,
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, zIndex: 3, opacity: 0.5,
        }}>🦶</div>
        {inBite && (
          <div style={{
            position: 'absolute', bottom: 3, left: 0, right: 0,
            textAlign: 'center', fontSize: 8, fontWeight: 900,
            color: '#e65100', zIndex: 5,
            animation: 'pulse 1s infinite',
          }}>✦ BITE</div>
        )}
      </div>
      <span style={{ fontSize: 8, color: '#aaa' }}>
        {value < 5 ? 'Released' : pressed ? 'Pressed ✓' : inBite ? 'Bite zone' : `${Math.round(value)}%`}
      </span>
    </div>
  );
}

// ─── Steering ─────────────────────────────────────────────────────────────────
function SteeringControls({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const leftRef = useRef<number | null>(null);
  const rightRef = useRef<number | null>(null);

  const L = useCallback((on: boolean, id?: number) => {
    leftRef.current = on ? (id ?? -1) : null;
    onChange(on ? -1 : rightRef.current !== null ? 1 : 0);
  }, [onChange]);
  const R = useCallback((on: boolean, id?: number) => {
    rightRef.current = on ? (id ?? -1) : null;
    onChange(on ? 1 : leftRef.current !== null ? -1 : 0);
  }, [onChange]);

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: 52, height: 52, borderRadius: 14,
    fontSize: 20, fontWeight: 700,
    background: active ? '#1565c0' : '#e8eaf6',
    color: active ? 'white' : '#5c6bc0',
    border: active ? '2px solid #0d47a1' : '2px solid #c5cae9',
    cursor: 'pointer', touchAction: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transform: active ? 'scale(1.07)' : 'scale(1)',
    transition: 'all 0.07s',
    boxShadow: active ? '0 4px 12px #1565c040' : 'none',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#aaa', letterSpacing: 1 }}>STEER</span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          style={btnStyle(value < -0.1)}
          onTouchStart={(e) => { e.preventDefault(); L(true, e.changedTouches[0].identifier); }}
          onTouchEnd={() => L(false)}
          onTouchCancel={() => L(false)}
          onMouseDown={() => L(true)}
          onMouseUp={() => L(false)}
          onMouseLeave={() => L(false)}
        >◀</button>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#f5f5f5', border: '2px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16,
        }}>🚗</div>
        <button
          style={btnStyle(value > 0.1)}
          onTouchStart={(e) => { e.preventDefault(); R(true, e.changedTouches[0].identifier); }}
          onTouchEnd={() => R(false)}
          onTouchCancel={() => R(false)}
          onMouseDown={() => R(true)}
          onMouseUp={() => R(false)}
          onMouseLeave={() => R(false)}
        >▶</button>
      </div>
    </div>
  );
}

// ─── Gear Shifter ─────────────────────────────────────────────────────────────
function GearShifter({ currentGear, onGearChange, clutchPressed }: {
  currentGear: number; onGearChange: (g: number) => void; clutchPressed: boolean;
}) {
  const [flash, setFlash] = useState(false);

  const tap = useCallback((g: number) => {
    if (!clutchPressed) {
      setFlash(true); setTimeout(() => setFlash(false), 350);
      if ('vibrate' in navigator) navigator.vibrate(40);
      return;
    }
    onGearChange(g);
  }, [clutchPressed, onGearChange]);

  const gears = [
    { g: 1, label: '1', col: 1, row: 1 },
    { g: 2, label: '2', col: 2, row: 1 },
    { g: 3, label: '3', col: 3, row: 1 },
    { g: 4, label: '4', col: 1, row: 2 },
    { g: 5, label: '5', col: 2, row: 2 },
    { g: 0, label: 'N', col: 3, row: 2 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: 9, fontWeight: 700, color: '#aaa', letterSpacing: 1 }}>GEARS</span>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 4,
        padding: 6,
        borderRadius: 12,
        background: flash ? '#fdecea' : '#f5f5f5',
        border: `2px solid ${flash ? '#ef9a9a' : '#e0e0e0'}`,
        transition: 'all 0.1s',
      }}>
        {gears.map(({ g, label, col, row }) => {
          const active = currentGear === g;
          const gc = g === 0 ? '#f57c00' : '#2e7d32';
          return (
            <button
              key={g}
              onTouchStart={(e) => { e.preventDefault(); tap(g); }}
              onClick={() => tap(g)}
              style={{
                gridColumn: col, gridRow: row,
                width: 36, height: 32,
                borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: 'monospace',
                background: active ? gc : 'white',
                color: active ? 'white' : clutchPressed ? '#333' : '#ccc',
                border: active ? `2px solid ${gc}` : '2px solid #e0e0e0',
                cursor: 'pointer', touchAction: 'manipulation',
                transition: 'all 0.1s',
                boxShadow: active ? `0 2px 8px ${gc}40` : 'none',
              }}
            >{label}</button>
          );
        })}
      </div>
      <span style={{ fontSize: 8, color: clutchPressed ? '#2e7d32' : flash ? '#c62828' : '#bbb', fontWeight: 600 }}>
        {clutchPressed ? '✓ Ready' : flash ? '⚠ Press clutch!' : 'Press clutch first'}
      </span>
    </div>
  );
}

// ─── Main Controls ─────────────────────────────────────────────────────────────
interface ControlsProps {
  clutch: number; brake: number; throttle: number; steering: number; gear: number;
  onClutch: (v: number) => void; onBrake: (v: number) => void;
  onThrottle: (v: number) => void; onSteering: (v: number) => void;
  onGear: (g: number) => void; onStart: () => void;
  engineOn: boolean; isStalled: boolean;
}

export function Controls({
  clutch, brake, throttle, steering, gear,
  onClutch, onBrake, onThrottle, onSteering, onGear,
  onStart, engineOn, isStalled,
}: ControlsProps) {
  const clutchPressed = clutch > 65;

  return (
    <div style={{
      background: 'white',
      borderTop: '1px solid #e8e8e8',
      padding: '8px 10px 10px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 6,
    }}>
      {/* LEFT: 3 pedals */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
        <ClutchPedal value={clutch} onChange={onClutch} />
        <SliderPedal label="BRAKE" value={brake} onChange={onBrake} color="#e53935" icon="🛑" />
        <SliderPedal label="GAS"   value={throttle} onChange={onThrottle} color="#43a047" icon="⛽" />
      </div>

      {/* CENTER: engine status + steering */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {(!engineOn || isStalled) ? (
          <button
            onTouchStart={(e) => { e.preventDefault(); onStart(); }}
            onClick={onStart}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: isStalled ? '#c62828' : '#2e7d32',
              color: 'white', fontWeight: 700, fontSize: 10,
              border: 'none', cursor: 'pointer',
              boxShadow: `0 4px 16px ${isStalled ? '#c6282860' : '#2e7d3260'}`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 1, lineHeight: 1, touchAction: 'manipulation',
            }}
          >
            <span style={{ fontSize: 20 }}>{isStalled ? '🔁' : '▶'}</span>
            <span>{isStalled ? 'RESTART' : 'START'}</span>
          </button>
        ) : (
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#e8f5e9', border: '2px solid #a5d6a7',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <span style={{ fontSize: 16 }}>🟢</span>
            <span style={{ fontSize: 8, color: '#2e7d32', fontWeight: 700 }}>ON</span>
          </div>
        )}
        <SteeringControls value={steering} onChange={onSteering} />
      </div>

      {/* RIGHT: gear shifter */}
      <GearShifter currentGear={gear} onGearChange={onGear} clutchPressed={clutchPressed} />
    </div>
  );
}
