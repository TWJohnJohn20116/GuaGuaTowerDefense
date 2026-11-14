/**
 * BGM 播放引擎：檔案優先，失敗時 fallback 程序化 ambient
 */
import {
  CROSSFADE_SEC,
  MUSIC_TRACKS,
  STINGER_RETURN,
  type MusicTrackId,
} from './musicConfig';
import { ProceduralAmbient } from './proceduralAmbient';
import { getMusicArrayBuffer, getMusicBlobUrl } from '../audioCache/audioFetchService';
import {
  loadMenuArrayBuffer,
  loadMenuBlobUrl,
  pickNextMenuTrackIndex,
  readMenuPlaybackContext,
  resolveMenuTrackCount,
  revokeMenuBlobUrl,
  shouldLoopMenuTrack,
} from './menuMusicPlayback';

type ActivePlayback =
  | { kind: 'buffer'; source: AudioBufferSourceNode }
  | { kind: 'media'; audio: HTMLAudioElement; node: MediaElementAudioSourceNode }
  | { kind: 'procedural'; ambient: ProceduralAmbient };

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private channelA: GainNode | null = null;
  private channelB: GainNode | null = null;
  private activeChannel: 'A' | 'B' = 'A';
  private playbackA: ActivePlayback | null = null;
  private playbackB: ActivePlayback | null = null;
  private unlocked = false;
  private currentTrack: MusicTrackId | null = null;
  private bufferCache = new Map<MusicTrackId, AudioBuffer>();
  private menuBufferCache = new Map<string, AudioBuffer>();
  private menuTrackIndex = 0;
  private menuAlbumId: string | null = null;
  private duckFactor = 1;
  private userVolume = 0.5;
  private enabled = true;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    const ctx = this.ensureContext();
    if (ctx.state === 'suspended') void ctx.resume();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.applyMasterGain(0.05);
  }

  setVolume(volume: number): void {
    this.userVolume = Math.max(0, Math.min(1, volume));
    this.applyMasterGain(0.05);
  }

  setDuck(factor: number): void {
    this.duckFactor = Math.max(0, Math.min(1, factor));
    this.applyMasterGain(0.25);
  }

  async playTrack(trackId: MusicTrackId, force = false): Promise<void> {
    if (!this.unlocked) return;

    if (trackId === 'menu') {
      await this.syncMenuAlbumContext();
    }

    const sameTrack = this.currentTrack === trackId;
    const procedural = this.isProceduralActive();
    if (sameTrack && !force && !procedural) return;

    // 快取就緒後，從程序化 ambient 升級為真實音檔
    if (sameTrack && (force || procedural)) {
      this.bufferCache.delete(trackId);
      this.menuBufferCache.clear();
      revokeMenuBlobUrl();
      this.currentTrack = null;
      this.clearFadeTimer();
      this.stopPlaybackOnChannel('A');
      this.stopPlaybackOnChannel('B');
      this.playbackA = null;
      this.playbackB = null;
      this.channelA!.gain.value = 0;
      this.channelB!.gain.value = 0;
    }

    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const fadeSec = CROSSFADE_SEC;

    const incoming = this.activeChannel === 'A' ? this.channelB! : this.channelA!;
    const outgoing = this.activeChannel === 'A' ? this.channelA! : this.channelB!;

    this.clearFadeTimer();
    this.stopPlaybackOnChannel(this.activeChannel === 'A' ? 'B' : 'A');

    let playback: ActivePlayback;
    try {
      playback = await this.createBufferPlayback(trackId, incoming, ctx);
    } catch {
      try {
        playback = await this.createMediaPlayback(trackId, incoming, ctx);
      } catch {
        playback = this.createProceduralPlayback(trackId, incoming, ctx);
      }
    }

    incoming.gain.cancelScheduledValues(now);
    incoming.gain.setValueAtTime(0, now);
    incoming.gain.linearRampToValueAtTime(1, now + fadeSec);

    outgoing.gain.cancelScheduledValues(now);
    outgoing.gain.setValueAtTime(outgoing.gain.value, now);
    outgoing.gain.linearRampToValueAtTime(0, now + fadeSec);

    const prevChannel = this.activeChannel;
    this.activeChannel = prevChannel === 'A' ? 'B' : 'A';
    if (this.activeChannel === 'A') this.playbackA = playback;
    else this.playbackB = playback;

    this.currentTrack = trackId;

    this.fadeTimer = setTimeout(() => {
      this.stopPlaybackOnChannel(prevChannel);
      this.fadeTimer = null;
    }, fadeSec * 1000 + 60);
  }

  stop(): void {
    this.clearFadeTimer();
    this.stopPlaybackOnChannel('A');
    this.stopPlaybackOnChannel('B');
    this.playbackA = null;
    this.playbackB = null;
    this.currentTrack = null;
    revokeMenuBlobUrl();
  }

  private async syncMenuAlbumContext(): Promise<void> {
    const ctx = readMenuPlaybackContext(this.menuTrackIndex);
    if (this.menuAlbumId !== ctx.albumId) {
      this.menuAlbumId = ctx.albumId;
      this.menuTrackIndex = 0;
      this.menuBufferCache.clear();
      revokeMenuBlobUrl();
    }
    if (ctx.useRemoteAlbum) {
      await resolveMenuTrackCount(ctx.albumId);
    }
  }

  private async advanceMenuTrack(): Promise<void> {
    const ctx = readMenuPlaybackContext(this.menuTrackIndex);
    if (!ctx.useRemoteAlbum) return;
    const count = await resolveMenuTrackCount(ctx.albumId);
    if (count <= 1) return;
    this.menuTrackIndex = pickNextMenuTrackIndex({ ...ctx, trackCount: count });
    this.menuBufferCache.clear();
    revokeMenuBlobUrl();
    this.currentTrack = null;
    await this.playTrack('menu', true);
  }

  private menuBufferCacheKey(): string {
    const ctx = readMenuPlaybackContext(this.menuTrackIndex);
    return ctx.useRemoteAlbum ? `${ctx.albumId}:${this.menuTrackIndex}` : 'default';
  }

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.channelA = this.ctx.createGain();
      this.channelB = this.ctx.createGain();
      this.channelA.gain.value = 0;
      this.channelB.gain.value = 0;
      this.channelA.connect(this.masterGain);
      this.channelB.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      this.applyMasterGain(0);
    }
    return this.ctx;
  }

  private applyMasterGain(rampSec: number): void {
    if (!this.ctx || !this.masterGain) return;
    const target = this.enabled ? this.userVolume * this.duckFactor : 0;
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + rampSec);
  }

  private async loadBuffer(trackId: MusicTrackId, ctx: AudioContext): Promise<AudioBuffer> {
    if (trackId === 'menu') {
      const menuCtx = readMenuPlaybackContext(this.menuTrackIndex);
      const cacheKey = this.menuBufferCacheKey();
      const cachedMenu = this.menuBufferCache.get(cacheKey);
      if (cachedMenu) return cachedMenu;

      if (menuCtx.useRemoteAlbum) {
        const remote = await loadMenuArrayBuffer(menuCtx);
        if (remote?.byteLength) {
          try {
            const buffer = await ctx.decodeAudioData(remote.slice(0));
            this.menuBufferCache.set(cacheKey, buffer);
            return buffer;
          } catch {
            throw new Error(`decode failed: menu album ${menuCtx.albumId}`);
          }
        }
      }
    }

    const cached = this.bufferCache.get(trackId);
    if (cached) return cached;

    const { src } = MUSIC_TRACKS[trackId];

    try {
      const res = await fetch(src);
      if (res.ok) {
        const data = await res.arrayBuffer();
        const buffer = await ctx.decodeAudioData(data.slice(0));
        this.bufferCache.set(trackId, buffer);
        return buffer;
      }
    } catch {
      /* 本地檔不可用，嘗試 API 快取 */
    }

    const remote = trackId === 'menu'
      ? await loadMenuArrayBuffer(readMenuPlaybackContext(this.menuTrackIndex))
      : await getMusicArrayBuffer(trackId);
    if (remote?.byteLength) {
      try {
        const buffer = await ctx.decodeAudioData(remote.slice(0));
        if (trackId === 'menu') {
          this.menuBufferCache.set(this.menuBufferCacheKey(), buffer);
        } else {
          this.bufferCache.set(trackId, buffer);
        }
        return buffer;
      } catch {
        throw new Error(`decode failed: ${trackId}`);
      }
    }

    throw new Error(`no music buffer: ${trackId}`);
  }

  private isProceduralActive(): boolean {
    return (
      this.playbackA?.kind === 'procedural' ||
      this.playbackB?.kind === 'procedural'
    );
  }

  private async createMediaPlayback(
    trackId: MusicTrackId,
    dest: GainNode,
    ctx: AudioContext,
  ): Promise<ActivePlayback> {
    const menuCtx = trackId === 'menu' ? readMenuPlaybackContext(this.menuTrackIndex) : null;
    const url = trackId === 'menu' && menuCtx
      ? await loadMenuBlobUrl(menuCtx)
      : await getMusicBlobUrl(trackId);
    if (!url) throw new Error(`no music blob: ${trackId}`);

    const def = MUSIC_TRACKS[trackId];
    let loop = def.loop;
    if (trackId === 'menu' && menuCtx?.useRemoteAlbum) {
      const count = await resolveMenuTrackCount(menuCtx.albumId);
      loop = shouldLoopMenuTrack(count, true);
    }

    const audio = new Audio(url);
    audio.loop = loop;
    audio.preload = 'auto';
    const node = ctx.createMediaElementSource(audio);
    node.connect(dest);
    await audio.play().catch(() => {
      /* 自動播放限制時仍保留節點，等使用者互動後可再 play */
    });

    if (!loop) {
      audio.onended = () => {
        if (this.currentTrack === trackId) {
          if (trackId === 'menu' && menuCtx?.useRemoteAlbum) {
            void this.advanceMenuTrack();
            return;
          }
          const returnId = STINGER_RETURN[trackId as 'victory' | 'defeat'];
          if (returnId) void this.playTrack(returnId);
        }
      };
    }

    return { kind: 'media', audio, node };
  }

  private async createBufferPlayback(
    trackId: MusicTrackId,
    dest: GainNode,
    ctx: AudioContext,
  ): Promise<ActivePlayback> {
    const def = MUSIC_TRACKS[trackId];
    const menuCtx = trackId === 'menu' ? readMenuPlaybackContext(this.menuTrackIndex) : null;
    let loop = def.loop;
    if (trackId === 'menu' && menuCtx?.useRemoteAlbum) {
      const count = await resolveMenuTrackCount(menuCtx.albumId);
      loop = shouldLoopMenuTrack(count, true);
    }

    const buffer = await this.loadBuffer(trackId, ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(dest);
    source.start();

    if (!loop) {
      source.onended = () => {
        if (this.currentTrack === trackId) {
          if (trackId === 'menu' && menuCtx?.useRemoteAlbum) {
            void this.advanceMenuTrack();
            return;
          }
          const returnId = STINGER_RETURN[trackId as 'victory' | 'defeat'];
          if (returnId) void this.playTrack(returnId);
        }
      };
    }

    return { kind: 'buffer', source };
  }

  private createProceduralPlayback(
    trackId: MusicTrackId,
    dest: GainNode,
    ctx: AudioContext,
  ): ActivePlayback {
    const ambient = new ProceduralAmbient(ctx, trackId, dest);
    ambient.start();
    return { kind: 'procedural', ambient };
  }

  private stopPlaybackOnChannel(ch: 'A' | 'B'): void {
    const pb = ch === 'A' ? this.playbackA : this.playbackB;
    if (!pb) return;
    try {
      if (pb.kind === 'buffer') {
        pb.source.stop();
        pb.source.disconnect();
      } else if (pb.kind === 'media') {
        pb.audio.pause();
        pb.audio.src = '';
        pb.node.disconnect();
      } else {
        pb.ambient.stop();
      }
    } catch {
      /* no-op */
    }
    if (ch === 'A') this.playbackA = null;
    else this.playbackB = null;
  }

  private clearFadeTimer(): void {
    if (this.fadeTimer != null) {
      clearTimeout(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
}
