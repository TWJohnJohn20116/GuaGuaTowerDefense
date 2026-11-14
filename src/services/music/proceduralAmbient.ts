/**
 * Web Audio 程序化 ambient — 當 /music/*.ogg 不存在時的 fallback
 * 北歐極簡風：低音量 pad + 緩慢 LFO，不搶 SFX 注意力
 */
import type { MusicTrackId } from './musicConfig';

interface LayerDef {
  freq: number;
  type: OscillatorType;
  gain: number;
  lfoRate?: number;
  lfoDepth?: number;
}

const PRESETS: Record<MusicTrackId, LayerDef[]> = {
  menu: [
    { freq: 110, type: 'sine', gain: 0.04, lfoRate: 0.08, lfoDepth: 6 },
    { freq: 165, type: 'triangle', gain: 0.025, lfoRate: 0.05, lfoDepth: 4 },
    { freq: 220, type: 'sine', gain: 0.015 },
  ],
  battle: [
    { freq: 98, type: 'sawtooth', gain: 0.022, lfoRate: 0.18, lfoDepth: 8 },
    { freq: 147, type: 'square', gain: 0.012, lfoRate: 0.24, lfoDepth: 5 },
    { freq: 196, type: 'triangle', gain: 0.018, lfoRate: 0.12, lfoDepth: 6 },
  ],
  victory: [
    { freq: 131, type: 'sine', gain: 0.035, lfoRate: 0.1, lfoDepth: 5 },
    { freq: 196, type: 'triangle', gain: 0.028 },
    { freq: 262, type: 'sine', gain: 0.02, lfoRate: 0.06, lfoDepth: 3 },
  ],
  defeat: [
    { freq: 87, type: 'sine', gain: 0.038, lfoRate: 0.04, lfoDepth: 7 },
    { freq: 117, type: 'triangle', gain: 0.02, lfoRate: 0.03, lfoDepth: 4 },
  ],
};

export class ProceduralAmbient {
  private nodes: AudioNode[] = [];
  private started = false;

  constructor(
    private ctx: AudioContext,
    private trackId: MusicTrackId,
    private dest: AudioNode,
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;

    const layers = PRESETS[this.trackId];
    for (const layer of layers) {
      const osc = this.ctx.createOscillator();
      osc.type = layer.type;
      osc.frequency.value = layer.freq;

      const gain = this.ctx.createGain();
      gain.gain.value = layer.gain;

      if (layer.lfoRate != null && layer.lfoDepth != null) {
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = layer.lfoRate;
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = layer.lfoDepth;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();
        this.nodes.push(lfo, lfoGain);
      }

      osc.connect(gain);
      gain.connect(this.dest);
      osc.start();
      this.nodes.push(osc, gain);
    }
  }

  stop(when = 0): void {
    for (const node of this.nodes) {
      try {
        if (node instanceof OscillatorNode) node.stop(when);
        node.disconnect();
      } catch {
        /* no-op */
      }
    }
    this.nodes = [];
    this.started = false;
  }
}
