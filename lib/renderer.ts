// ─── World Renderer ───────────────────────────────────────────────────────────
// Draws the parking lot / town environment on canvas

export interface WorldConfig {
  phase: 'parking_lot' | 'stall_challenge' | 'town';
}

export interface RoadSegment {
  x: number; y: number; w: number; h: number;
  type: 'road' | 'grass' | 'parking' | 'building' | 'marking';
  color?: string;
}

// Parking lot world
export function buildParkingLotWorld(): RoadSegment[] {
  return [
    // Grass surround
    { x: 0, y: 0, w: 2000, h: 2000, type: 'grass', color: '#4a7c59' },
    // Main parking lot asphalt
    { x: 80, y: 80, w: 840, h: 640, type: 'parking', color: '#2d2d2d' },
    // Parking lines (white markings)
    ...generateParkingLines(100, 200, 12),
    // Center open area
    { x: 200, y: 180, w: 500, h: 350, type: 'road', color: '#323232' },
  ];
}

function generateParkingLines(startX: number, startY: number, count: number): RoadSegment[] {
  const lines: RoadSegment[] = [];
  for (let i = 0; i < count; i++) {
    lines.push({
      x: startX + i * 65,
      y: startY,
      w: 3,
      h: 120,
      type: 'marking',
      color: '#ffffff55',
    });
  }
  return lines;
}

export function buildTownWorld(): RoadSegment[] {
  const segments: RoadSegment[] = [
    // Base grass
    { x: 0, y: 0, w: 3000, h: 3000, type: 'grass', color: '#3d6b4a' },
    // Main roads
    { x: 0, y: 350, w: 3000, h: 120, type: 'road', color: '#2a2a2a' },   // horizontal main
    { x: 0, y: 900, w: 3000, h: 120, type: 'road', color: '#2a2a2a' },   // horizontal 2
    { x: 400, y: 0, w: 120, h: 3000, type: 'road', color: '#2a2a2a' },   // vertical main
    { x: 1000, y: 0, w: 120, h: 3000, type: 'road', color: '#2a2a2a' },  // vertical 2
    // Buildings
    { x: 600, y: 100, w: 200, h: 150, type: 'building', color: '#8B7355' },
    { x: 600, y: 550, w: 250, h: 200, type: 'building', color: '#7B5E7B' },
    { x: 1300, y: 100, w: 300, h: 180, type: 'building', color: '#5B7B6F' },
    { x: 150, y: 550, w: 180, h: 250, type: 'building', color: '#8B7355' },
    { x: 1300, y: 600, w: 200, h: 250, type: 'building', color: '#6B8CAE' },
    // Parking area
    { x: 600, y: 180, w: 300, h: 150, type: 'parking', color: '#252525' },
  ];
  return segments;
}

export function renderWorld(
  ctx: CanvasRenderingContext2D,
  segments: RoadSegment[],
  camX: number,
  camY: number,
  scale: number = 1
): void {
  ctx.save();
  ctx.translate(-camX, -camY);
  ctx.scale(scale, scale);

  for (const seg of segments) {
    ctx.fillStyle = seg.color || '#333';
    ctx.fillRect(seg.x, seg.y, seg.w, seg.h);

    // Road center line dashes
    if (seg.type === 'road' && seg.w > seg.h && seg.w > 100) {
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(seg.x, seg.y + seg.h / 2);
      ctx.lineTo(seg.x + seg.w, seg.y + seg.h / 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (seg.type === 'road' && seg.h > seg.w && seg.h > 100) {
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(seg.x + seg.w / 2, seg.y);
      ctx.lineTo(seg.x + seg.w / 2, seg.y + seg.h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Building details
    if (seg.type === 'building') {
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(seg.x, seg.y, seg.w, seg.h);
      // Windows
      ctx.fillStyle = 'rgba(255,255,200,0.3)';
      for (let wx = seg.x + 15; wx < seg.x + seg.w - 15; wx += 30) {
        for (let wy = seg.y + 15; wy < seg.y + seg.h - 15; wy += 30) {
          ctx.fillRect(wx, wy, 15, 12);
        }
      }
    }

    // Grass texture dots
    if (seg.type === 'grass') {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      for (let gx = seg.x; gx < seg.x + seg.w; gx += 40) {
        for (let gy = seg.y; gy < seg.y + seg.h; gy += 40) {
          ctx.beginPath();
          ctx.arc(gx + 10, gy + 10, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  ctx.restore();
}

export function renderCar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  camX: number,
  camY: number,
  isStalled: boolean,
  speed: number
): void {
  const screenX = x - camX;
  const screenY = y - camY;

  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate(angle);

  // Car shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(-18, -10, 36, 22);

  // Car body
  const bodyColor = isStalled ? '#e74c3c' : '#3498db';
  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(-15, -9, 30, 18, 3);
  ctx.fill();

  // Windshield
  ctx.fillStyle = 'rgba(173,216,230,0.8)';
  ctx.fillRect(-8, -7, 14, 8);

  // Rear window
  ctx.fillStyle = 'rgba(173,216,230,0.6)';
  ctx.fillRect(-10, 2, 12, 6);

  // Wheels
  ctx.fillStyle = '#1a1a1a';
  // Front left
  ctx.fillRect(8, -11, 7, 5);
  // Front right
  ctx.fillRect(8, 6, 7, 5);
  // Rear left
  ctx.fillRect(-15, -11, 7, 5);
  // Rear right
  ctx.fillRect(-15, 6, 7, 5);

  // Headlights
  ctx.fillStyle = '#FFE87C';
  ctx.fillRect(14, -8, 3, 4);
  ctx.fillRect(14, 4, 3, 4);

  // Tail lights (when braking / reverse)
  ctx.fillStyle = speed < -0.5 ? '#ff0000' : '#ff000066';
  ctx.fillRect(-18, -8, 3, 4);
  ctx.fillRect(-18, 4, 3, 4);

  // Stall indicator
  if (isStalled) {
    ctx.fillStyle = '#FFE87C';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚠', 0, -18);
  }

  ctx.restore();
}

export function renderDirectionArrow(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  targetX: number, targetY: number,
  camX: number, camY: number
): void {
  const screenX = x - camX;
  const screenY = y - camY;
  const angle = Math.atan2(targetY - y, targetX - x);

  ctx.save();
  ctx.translate(screenX, screenY - 35);
  ctx.rotate(angle);
  
  ctx.fillStyle = '#FFE87C';
  ctx.shadowColor = '#FFE87C';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(15, 0);
  ctx.lineTo(-8, -8);
  ctx.lineTo(-8, 8);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}
