// ─── Web Audio Engine ─────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let distortion: WaveShaperNode | null = null;
let filterNode: BiquadFilterNode | null = null;
let isInitialized = false;

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 256;
  const curve = new Float32Array(new ArrayBuffer(samples * 4));
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

export function initAudio(): void {
  if (isInitialized) return;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();
    distortion = audioCtx.createWaveShaper();
    filterNode = audioCtx.createBiquadFilter();

    oscillator.type = 'sawtooth';
    oscillator.frequency.value = 40;
    
    distortion.curve = makeDistortionCurve(50);
    distortion.oversample = '4x';
    
    filterNode.type = 'lowpass';
    filterNode.frequency.value = 800;
    
    gainNode.gain.value = 0;

    oscillator.connect(distortion);
    distortion.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    isInitialized = true;
  } catch (e) {
    console.warn('Web Audio not available:', e);
  }
}

export function updateEngineSound(rpm: number, engineOn: boolean): void {
  if (!audioCtx || !oscillator || !gainNode || !filterNode) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (!engineOn) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    return;
  }

  // Map RPM to frequency (engine rumble)
  const baseFreq = 25 + (rpm / 6000) * 120;
  oscillator.frequency.setTargetAtTime(baseFreq, audioCtx.currentTime, 0.05);
  
  // Volume based on RPM
  const volume = rpm < 400 ? 0 : 0.08 + (rpm / 6000) * 0.15;
  gainNode.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.05);
  
  // Filter cutoff — higher RPM = brighter sound
  const cutoff = 400 + (rpm / 6000) * 2000;
  filterNode.frequency.setTargetAtTime(cutoff, audioCtx.currentTime, 0.05);
}

export function playStallSound(): void {
  if (!audioCtx || !gainNode) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  // Quick fade out + sputter
  gainNode.gain.setTargetAtTime(0.2, audioCtx.currentTime, 0.01);
  gainNode.gain.setTargetAtTime(0, audioCtx.currentTime + 0.1, 0.05);
}

export function triggerHaptic(duration: number = 100): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(duration);
  }
}

export function resumeAudio(): void {
  if (audioCtx?.state === 'suspended') {
    audioCtx.resume();
  }
}
