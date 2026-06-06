// ─── Game Store ───────────────────────────────────────────────────────────────

import { create } from 'zustand';
import {
  CarState,
  CarInputs,
  createInitialCarState,
  updateCarPhysics,
  getInstructorFeedback,
} from './carPhysics';

export type GamePhase = 'menu' | 'lesson_1' | 'stall_challenge' | 'free_drive' | 'skills';

export interface SkillStats {
  clutchControl: number;      // 0-100
  gearSelection: number;
  smoothBraking: number;
  hillStarts: number;
  parkingAccuracy: number;
}

export interface InstructorMessage {
  id: number;
  text: string;
  type: 'tip' | 'warning' | 'success';
  timestamp: number;
}

export interface GameStore {
  // Phase
  phase: GamePhase;
  setPhase: (p: GamePhase) => void;

  // Car
  car: CarState;
  inputs: CarInputs;
  updateInputs: (partial: Partial<CarInputs>) => void;
  tickPhysics: (deltaTime: number, roadSlope?: number) => void;

  // Instructor
  messages: InstructorMessage[];
  addMessage: (text: string, type: InstructorMessage['type']) => void;
  clearOldMessages: () => void;

  // Skills
  skills: SkillStats;
  updateSkills: () => void;

  // Lesson tracking
  lessonStep: number;
  setLessonStep: (n: number) => void;
  stallChallengeCount: number;
  incrementStallChallenge: () => void;

  // Session
  sessionDistance: number;
  sessionTime: number;
  tickSession: (dt: number) => void;
  resetCar: () => void;
}

let msgIdCounter = 0;
let lastFeedbackTime = 0;
let lastFeedbackText = '';

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'menu',
  setPhase: (phase) => set({ phase }),

  car: createInitialCarState(),

  inputs: {
    clutch: 100,
    brake: 0,
    throttle: 0,
    steering: 0,
    gear: 0,
    startEngine: false,
    handbrake: false,
  },

  updateInputs: (partial) =>
    set((s) => ({ inputs: { ...s.inputs, ...partial } })),

  tickPhysics: (deltaTime, roadSlope = 0) => {
    const { car, inputs } = get();
    const prevCar = car;
    const nextCar = updateCarPhysics(car, inputs, deltaTime, roadSlope);

    // Audio
    const audioModule = (window as any).__audioModule;
    if (audioModule) {
      audioModule.updateEngineSound(nextCar.rpm, nextCar.engineOn);
      if (nextCar.isStalled && !prevCar.isStalled) {
        audioModule.playStallSound();
      }
    }

    // Haptics
    if (nextCar.shouldVibrate && !prevCar.shouldVibrate) {
      if ('vibrate' in navigator) navigator.vibrate(80);
    }
    if (nextCar.isStalled && !prevCar.isStalled) {
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    }

    // Instructor feedback (throttle: max 1 per 3 seconds)
    const now = Date.now();
    const feedback = getInstructorFeedback(nextCar, prevCar);
    if (feedback && now - lastFeedbackTime > 3000 && feedback !== lastFeedbackText) {
      lastFeedbackTime = now;
      lastFeedbackText = feedback;
      const type = feedback.includes('stalled') ? 'warning'
        : feedback.includes('!') ? 'warning'
        : 'tip';
      get().addMessage(feedback, type);
    }

    set({ car: nextCar });
  },

  messages: [],
  addMessage: (text, type) => {
    const msg: InstructorMessage = {
      id: ++msgIdCounter,
      text,
      type,
      timestamp: Date.now(),
    };
    set((s) => ({ messages: [msg, ...s.messages].slice(0, 5) }));
  },
  clearOldMessages: () => {
    const cutoff = Date.now() - 5000;
    set((s) => ({ messages: s.messages.filter((m) => m.timestamp > cutoff) }));
  },

  skills: {
    clutchControl: 0,
    gearSelection: 0,
    smoothBraking: 0,
    hillStarts: 0,
    parkingAccuracy: 0,
  },

  updateSkills: () => {
    const { car } = get();
    set((s) => ({
      skills: {
        clutchControl: Math.min(100, s.skills.clutchControl +
          (car.smoothnessScore > 80 ? 0.05 : -0.02)),
        gearSelection: Math.min(100, s.skills.gearSelection +
          (car.speed > 5 && car.gear > 0 ? 0.03 : 0)),
        smoothBraking: Math.min(100, s.skills.smoothBraking +
          (car.brakePedal > 10 && car.brakePedal < 50 ? 0.04 : 0)),
        hillStarts: s.skills.hillStarts,
        parkingAccuracy: s.skills.parkingAccuracy,
      },
    }));
  },

  lessonStep: 0,
  setLessonStep: (n) => set({ lessonStep: n }),

  stallChallengeCount: 0,
  incrementStallChallenge: () =>
    set((s) => ({ stallChallengeCount: s.stallChallengeCount + 1 })),

  sessionDistance: 0,
  sessionTime: 0,
  tickSession: (dt) =>
    set((s) => ({
      sessionDistance: s.sessionDistance + Math.abs(s.car.speed * dt / 3.6),
      sessionTime: s.sessionTime + dt,
    })),

  resetCar: () => {
    const initial = createInitialCarState();
    initial.x = 200;
    initial.y = 300;
    set({ car: initial, inputs: {
      clutch: 100, brake: 0, throttle: 0,
      steering: 0, gear: 0, startEngine: false, handbrake: false,
    }});
  },
}));
