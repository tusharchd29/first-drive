// ─── Car Physics Engine ───────────────────────────────────────────────────────
// Simulates manual transmission with realistic clutch bite point

export interface CarState {
  // Position & movement
  x: number;
  y: number;
  angle: number;          // radians
  speed: number;          // km/h
  
  // Engine
  rpm: number;
  gear: number;           // 0=neutral, 1-5=drive, -1=reverse
  engineOn: boolean;
  isStalled: boolean;
  
  // Pedals (0-100%)
  clutchPedal: number;    // 100 = fully pressed (clutch disengaged)
  brakePedal: number;
  throttlePedal: number;
  
  // Clutch internals
  clutchEngagement: number; // 0=disengaged, 1=fully engaged
  bitePoint: number;        // 40-60% pedal = bite point zone
  
  // Vehicle dynamics
  wheelSpin: boolean;
  handbrake: boolean;
  
  // Stats tracking
  stallCount: number;
  smoothnessScore: number;  // rolling average
  totalDistance: number;
  fuelLevel: number;
  
  // Feedback
  engineSound: 'idle' | 'low' | 'normal' | 'high' | 'stall' | 'off';
  shouldVibrate: boolean;
  vibrateIntensity: number;
}

export interface CarInputs {
  clutch: number;    // 0-100 (100 = fully pressed)
  brake: number;     // 0-100
  throttle: number;  // 0-100
  steering: number;  // -1 to 1 (left to right)
  gear: number;
  startEngine: boolean;
  handbrake: boolean;
}

// Gear ratios (affects how RPM translates to speed)
const GEAR_RATIOS = [0, 3.5, 2.1, 1.4, 1.0, 0.75, 3.2]; // 0=neutral, 6=reverse
const MAX_RPM = 6000;
const IDLE_RPM = 800;
const STALL_RPM = 400;
const BITE_POINT_LOW = 38;   // clutch pedal % where bite begins
const BITE_POINT_HIGH = 62;  // clutch pedal % where fully engaged

export function createInitialCarState(): CarState {
  return {
    x: 200,
    y: 300,
    angle: 0,
    speed: 0,
    rpm: 0,
    gear: 0,
    engineOn: false,
    isStalled: false,
    clutchPedal: 100, // starts fully pressed
    brakePedal: 0,
    throttlePedal: 0,
    clutchEngagement: 0,
    bitePoint: 50,
    wheelSpin: false,
    handbrake: false,
    stallCount: 0,
    smoothnessScore: 100,
    totalDistance: 0,
    fuelLevel: 100,
    engineSound: 'off',
    shouldVibrate: false,
    vibrateIntensity: 0,
  };
}

export function updateCarPhysics(
  state: CarState,
  inputs: CarInputs,
  deltaTime: number, // seconds
  roadSlope: number = 0 // -1 to 1, positive = uphill
): CarState {
  const dt = Math.min(deltaTime, 0.05); // cap at 50ms
  const next = { ...state };

  // Apply inputs
  next.clutchPedal = inputs.clutch;
  next.brakePedal = inputs.brake;
  next.throttlePedal = inputs.throttle;
  next.handbrake = inputs.handbrake;

  // --- Handle gear change ---
  // Allow gear change when clutch pressed >65% OR engine is off
  if (inputs.gear !== state.gear && (inputs.clutch > 65 || !state.engineOn)) {
    next.gear = inputs.gear;
  }

  // --- Engine start/stall ---
  if (inputs.startEngine && !state.engineOn && !state.isStalled) {
    next.engineOn = true;
    next.rpm = IDLE_RPM;
    next.engineSound = 'idle';
  }

  if (!next.engineOn) {
    next.rpm = 0;
    next.engineSound = 'off';
    next.speed = 0;
    return next;
  }

  // --- Clutch engagement calculation ---
  // clutchPedal: 100 = fully pressed (disengaged), 0 = fully released (engaged)
  const pedalPos = 100 - inputs.clutch; // inverted: 0=disengaged, 100=engaged
  
  let engagement = 0;
  if (pedalPos <= BITE_POINT_LOW) {
    engagement = 0; // fully disengaged
  } else if (pedalPos >= BITE_POINT_HIGH) {
    engagement = 1; // fully engaged
  } else {
    // Bite point zone — partial engagement
    engagement = (pedalPos - BITE_POINT_LOW) / (BITE_POINT_HIGH - BITE_POINT_LOW);
    engagement = Math.pow(engagement, 1.5); // non-linear feel
  }
  next.clutchEngagement = engagement;

  // --- RPM simulation ---
  const throttleEffect = (inputs.throttle / 100) * 3000;
  const idleRPM = IDLE_RPM;
  
  if (next.gear === 0 || inputs.clutch > 80) {
    // Neutral or clutch fully pressed — free revving
    const targetRPM = idleRPM + throttleEffect;
    next.rpm = next.rpm + (targetRPM - next.rpm) * dt * 5;
  } else {
    // Clutch engaged — RPM tied to wheel speed via gear ratio
    const ratio = GEAR_RATIOS[Math.abs(next.gear)] || 1;
    const speedKmh = Math.abs(next.speed);
    const wheelRPM = (speedKmh * 1000 / 60) / (2 * Math.PI * 0.3) * ratio * 60;
    
    const freeRPM = idleRPM + throttleEffect;
    const engineRPM = freeRPM * (1 - engagement) + wheelRPM * engagement;
    next.rpm = Math.max(0, Math.min(MAX_RPM, engineRPM));
  }

  // --- Stall detection ---
  if (next.engineOn && next.rpm < STALL_RPM && next.gear !== 0 && engagement > 0.3) {
    // Check if there's not enough throttle to maintain
    const loadTooHigh = (engagement * GEAR_RATIOS[Math.abs(next.gear)]) > (inputs.throttle / 30 + 0.5);
    if (loadTooHigh) {
      next.isStalled = true;
      next.engineOn = false;
      next.rpm = 0;
      next.speed = 0;
      next.stallCount += 1;
      next.engineSound = 'stall';
      next.shouldVibrate = true;
      next.vibrateIntensity = 200;
      return next;
    }
  }

  // Restart after stall — require clutch to be pressed first
  if (inputs.startEngine && (state.isStalled || !state.engineOn)) {
    next.isStalled = false;
    next.engineOn = true;
    next.rpm = IDLE_RPM;
    next.gear = 0;  // drop to neutral on restart
    next.engineSound = 'idle';
  }

  // --- Force / acceleration calculation ---
  let drivingForce = 0;
  
  if (next.gear !== 0 && !next.isStalled) {
    const ratio = GEAR_RATIOS[Math.abs(next.gear)];
    const throttleNorm = inputs.throttle / 100;
    const engineTorque = throttleNorm * 200 * (1 - next.rpm / (MAX_RPM * 1.2));
    drivingForce = engineTorque * ratio * next.clutchEngagement;
    if (next.gear < 0) drivingForce *= -1;
  }

  // Braking force
  const brakeForce = (inputs.brake / 100) * 150;
  const handbrakeForce = inputs.handbrake ? 80 : 0;
  
  // Road slope resistance
  const slopeForce = roadSlope * 30; // uphill resistance
  
  // Drag / rolling resistance
  const dragForce = next.speed * 0.8 + Math.sign(next.speed) * 2;

  // Net acceleration (m/s² equivalent, scaled)
  const netForce = drivingForce - brakeForce - handbrakeForce - slopeForce - dragForce;
  const acceleration = netForce / 12; // vehicle mass factor

  // Update speed (km/h)
  next.speed = next.speed + acceleration * dt * 3.6;
  
  // Speed limits
  next.speed = Math.max(-20, Math.min(120, next.speed));
  
  // Stop creep at very low speeds with brake
  if (Math.abs(next.speed) < 0.5 && inputs.brake > 10) {
    next.speed = 0;
  }

  // --- Position update ---
  const speedMs = next.speed / 3.6;
  next.x = state.x + Math.cos(state.angle) * speedMs * dt * 20;
  next.y = state.y + Math.sin(state.angle) * speedMs * dt * 20;
  
  // Steering (only effective when moving)
  if (Math.abs(next.speed) > 2) {
    const steerEffect = (inputs.steering * dt * 2.5) * (1 / (1 + Math.abs(next.speed) * 0.05));
    next.angle = state.angle + steerEffect;
  }

  // --- Total distance ---
  next.totalDistance += Math.abs(speedMs * dt);

  // --- Fuel consumption ---
  const fuelRate = (0.001 + inputs.throttle * 0.00008 + Math.abs(next.speed) * 0.000005) * dt;
  next.fuelLevel = Math.max(0, state.fuelLevel - fuelRate);

  // --- Sound state ---
  if (!next.engineOn) {
    next.engineSound = 'off';
  } else if (next.rpm < 1200) {
    next.engineSound = 'idle';
  } else if (next.rpm < 2500) {
    next.engineSound = 'low';
  } else if (next.rpm < 4000) {
    next.engineSound = 'normal';
  } else {
    next.engineSound = 'high';
  }

  // --- Vibration (about-to-stall warning) ---
  const stallRisk = next.gear !== 0 && engagement > 0.1 && next.rpm < 1000 && next.engineOn;
  next.shouldVibrate = stallRisk;
  next.vibrateIntensity = stallRisk ? Math.max(0, (1000 - next.rpm) / 10) : 0;

  // --- Smoothness score ---
  // Penalize: abrupt clutch release in bite zone
  const clutchJerk = Math.abs(inputs.clutch - state.clutchPedal);
  const isInBiteZone = pedalPos > BITE_POINT_LOW && pedalPos < BITE_POINT_HIGH;
  if (isInBiteZone && clutchJerk > 8) {
    next.smoothnessScore = Math.max(0, state.smoothnessScore - clutchJerk * 0.3);
  } else {
    next.smoothnessScore = Math.min(100, state.smoothnessScore + dt * 2);
  }

  return next;
}

export function getInstructorFeedback(state: CarState, prevState: CarState): string | null {
  // Too fast clutch release in bite zone
  const pedalPos = 100 - state.clutchPedal;
  const prevPedalPos = 100 - prevState.clutchPedal;
  const inBiteZone = pedalPos > BITE_POINT_LOW && pedalPos < BITE_POINT_HIGH;
  const releaseSpeed = pedalPos - prevPedalPos;

  if (inBiteZone && releaseSpeed > 15) {
    return "Slow down! Release the clutch gently through the bite point.";
  }

  // Wrong gear for speed
  if (state.engineOn && state.gear > 0) {
    const optimalGear = getOptimalGear(Math.abs(state.speed));
    if (state.gear < optimalGear - 1 && Math.abs(state.speed) > 20) {
      return `You're in ${state.gear}${getOrdinal(state.gear)} gear at ${Math.round(state.speed)} km/h. Shift up!`;
    }
    if (state.gear > optimalGear + 1 && Math.abs(state.speed) > 5) {
      return `Too high a gear for ${Math.round(state.speed)} km/h. Shift down to ${optimalGear}${getOrdinal(optimalGear)}.`;
    }
  }

  // High RPM warning
  if (state.rpm > 4500 && state.engineOn) {
    return "RPM is too high! Shift up to the next gear.";
  }

  // Stall recovery hint
  if (state.isStalled) {
    return "Engine stalled. Press clutch fully, then press start to restart.";
  }

  // Clutch not pressed before gear change
  if (!state.engineOn && !state.isStalled) {
    return "Press the green START button to start the engine.";
  }

  return null;
}

export function getOptimalGear(speedKmh: number): number {
  if (speedKmh < 15) return 1;
  if (speedKmh < 30) return 2;
  if (speedKmh < 50) return 3;
  if (speedKmh < 70) return 4;
  return 5;
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

export function getGearLabel(gear: number): string {
  if (gear === 0) return 'N';
  if (gear === -1) return 'R';
  return String(gear);
}
