'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import {
  buildParkingLotWorld,
  buildTownWorld,
  renderWorld,
  renderCar,
  RoadSegment,
} from '../lib/renderer';
import { GamePhase } from '../lib/gameStore';

interface GameCanvasProps {
  carX: number;
  carY: number;
  carAngle: number;
  isStalled: boolean;
  speed: number;
  phase: GamePhase;
}

export function GameCanvas({ carX, carY, carAngle, isStalled, speed, phase }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<RoadSegment[]>([]);
  const animRef = useRef<number>(0);
  // Store CSS dimensions separately from canvas pixel dimensions
  const cssSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (phase === 'lesson_1' || phase === 'stall_challenge') {
      worldRef.current = buildParkingLotWorld();
    } else {
      worldRef.current = buildTownWorld();
    }
  }, [phase]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Always use CSS dimensions for game logic (camera, positions)
    const W = cssSize.current.w;
    const H = cssSize.current.h;
    if (W === 0 || H === 0) return;

    // Clear full pixel buffer
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale for retina, then use CSS coords for everything
    ctx.save();
    const dpr = window.devicePixelRatio || 1;
    ctx.scale(dpr, dpr);

    // Fill background first so it's never black
    ctx.fillStyle = '#5a8a5a';
    ctx.fillRect(0, 0, W, H);

    // Camera centres on car using CSS coords
    const camX = carX - W / 2;
    const camY = carY - H / 2;

    renderWorld(ctx, worldRef.current, camX, camY);
    renderCar(ctx, carX, carY, carAngle, camX, camY, isStalled, speed);

    // Target zone for lesson 1
    if (phase === 'lesson_1') {
      ctx.save();
      ctx.translate(350 - camX, 300 - camY);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(-60, -30, 120, 60);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(-60, -30, 120, 60);
      ctx.setLineDash([]);
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🎯 Drive here', 0, 5);
      ctx.restore();
    }

    ctx.restore();
  }, [carX, carY, carAngle, isStalled, speed, phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      cssSize.current = { w, h };
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };

    // Use ResizeObserver for reliable sizing
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    resize();

    const loop = () => {
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block', touchAction: 'none' }}
    />
  );
}
