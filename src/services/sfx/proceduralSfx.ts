/**
 * Web Audio 程序化 SFX — 當 /sounds/*.wav 不存在時的 fallback
 */
import type { SoundId } from './soundConfig';

type PresetKind = 'tone' | 'noise' | 'sweep';

interface SfxPreset {
  kind: PresetKind;
  duration: number;
  gain: number;
  freq?: number;
  freqEnd?: number;
  wave?: OscillatorType;
}

const PRESETS: Record<SoundId, SfxPreset> = {
  basic_shoot: { kind: 'tone', freq: 920, duration: 0.05, gain: 0.12, wave: 'square' },
  machine_shoot: { kind: 'tone', freq: 640, duration: 0.04, gain: 0.1, wave: 'square' },
  sniper_shoot: { kind: 'sweep', freq: 480, freqEnd: 220, duration: 0.12, gain: 0.14, wave: 'sawtooth' },
  cannon_shoot: { kind: 'noise', duration: 0.14, gain: 0.18 },
  enemy_hit: { kind: 'tone', freq: 280, duration: 0.05, gain: 0.1, wave: 'triangle' },
  enemy_death: { kind: 'sweep', freq: 360, freqEnd: 80, duration: 0.18, gain: 0.14, wave: 'sawtooth' },
  coin_collect: { kind: 'tone', freq: 880, duration: 0.08, gain: 0.12, wave: 'sine' },
  wave_start: { kind: 'sweep', freq: 220, freqEnd: 440, duration: 0.35, gain: 0.16, wave: 'triangle' },
  pause: { kind: 'tone', freq: 520, duration: 0.06, gain: 0.08, wave: 'sine' },
  button_click: { kind: 'tone', freq: 1200, duration: 0.025, gain: 0.08, wave: 'square' },
  button_hover: { kind: 'tone', freq: 760, duration: 0.02, gain: 0.05, wave: 'sine' },
  game_over: { kind: 'sweep', freq: 280, freqEnd: 60, duration: 0.55, gain: 0.2, wave: 'sawtooth' },
  error: { kind: 'tone', freq: 180, duration: 0.1, gain: 0.14, wave: 'square' },
};

let ctx: AudioContext | null = null;
const noiseCache = new Map<number, AudioBuffer>();

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function getNoiseBuffer(duration: number, audioCtx: AudioContext): AudioBuffer {
  const key = Math.round(duration * 1000);
  const cached = noiseCache.get(key);
  if (cached) return cached;

  const len = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  noiseCache.set(key, buf);
  return buf;
}

/** 播放程序化音效（volume 0~1） */
export function playProceduralSfx(id: SoundId, volume: number): void {
  if (typeof window === 'undefined') return;

  const preset = PRESETS[id];
  const audioCtx = getCtx();
  const t0 = audioCtx.currentTime;
  const dur = preset.duration;
  const peak = Math.max(0, Math.min(1, preset.gain * volume));

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(peak, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  gain.connect(audioCtx.destination);

  if (preset.kind === 'noise') {
    const src = audioCtx.createBufferSource();
    src.buffer = getNoiseBuffer(dur, audioCtx);
    src.connect(gain);
    src.start(t0);
    src.stop(t0 + dur);
    return;
  }

  const osc = audioCtx.createOscillator();
  osc.type = preset.wave ?? 'sine';
  if (preset.kind === 'sweep' && preset.freq != null && preset.freqEnd != null) {
    osc.frequency.setValueAtTime(preset.freq, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, preset.freqEnd), t0 + dur);
  } else if (preset.freq != null) {
    osc.frequency.value = preset.freq;
  }
  osc.connect(gain);
  osc.start(t0);
  osc.stop(t0 + dur);
}

/** 解鎖 AudioContext（首次互動） */
export function unlockProceduralSfx(): void {
  if (typeof window === 'undefined') return;
  const audioCtx = getCtx();
  if (audioCtx.state === 'suspended') void audioCtx.resume();
}
