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

export function GameCanvas({
  carX, carY, carAngle, isStalled, speed, phase
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const worldRef = useRef<RoadSegment[]>([]);
  const animRef = useRef<number>(0);

  // Build world based on phase
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

    const W = canvas.width;
    const H = canvas.height;

    // Camera follows car (centered)
    const camX = carX - W / 2;
    const camY = carY - H / 2;

    ctx.clearRect(0, 0, W, H);

    // Render world
    renderWorld(ctx, worldRef.current, camX, camY);

    // Render car
    renderCar(ctx, carX, carY, carAngle, camX, camY, isStalled, speed);

    // Lesson 1: Show target zone indicator
    if (phase === 'lesson_1') {
      // Draw a gentle "drive here" zone
      ctx.save();
      ctx.translate(350 - camX, 300 - camY);
      ctx.strokeStyle = '#22d3ee40';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.strokeRect(-60, -30, 120, 60);
      ctx.fillStyle = '#22d3ee10';
      ctx.fillRect(-60, -30, 120, 60);
      ctx.fillStyle = '#22d3ee80';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Drive here', 0, 5);
      ctx.restore();
    }

    // Stall challenge: Draw slope indicator
    if (phase === 'stall_challenge') {
      ctx.save();
      ctx.translate(W / 2, H / 2 - 60);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⛰️ Uphill slope active', 0, 0);
      ctx.restore();
    }
  }, [carX, carY, carAngle, isStalled, speed, phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = () => {
      draw();
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  );
}
