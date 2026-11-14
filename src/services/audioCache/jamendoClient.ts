/**
 * Jamendo API — 搜尋並下載 CC 授權 BGM
 * https://developer.jamendo.com/v3.0
 */
import {
  JAMENDO_BASE,
  JAMENDO_CLIENT_ID,
  JAMENDO_SEARCH,
  type AudioAttribution,
} from './audioApiConfig';
import type { MusicTrackId } from '../music/musicConfig';

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  audio: string;
  shareurl: string;
  license_ccurl?: string;
  track_id?: string;
  track_name?: string;
}

interface JamendoSearchResponse {
  headers: { status: string; code: number };
  results: JamendoTrack[];
}

function buildAttribution(track: JamendoTrack): AudioAttribution {
  return {
    title: track.name,
    author: track.artist_name,
    url: track.shareurl || `https://www.jamendo.com/track/${track.id}`,
    license: track.license_ccurl || 'Creative Commons (Jamendo)',
    source: 'jamendo',
  };
}

async function downloadJamendoTrackFile(trackId: string): Promise<{ data: ArrayBuffer; mimeType: string } | null> {
  const fileParams = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    id: trackId,
  });
  const fileRes = await fetch(`${JAMENDO_BASE}/tracks/file?${fileParams}`);
  if (!fileRes.ok) return null;
  const data = await fileRes.arrayBuffer();
  const mimeType = fileRes.headers.get('content-type') ?? 'audio/mpeg';
  return { data, mimeType };
}

interface JamendoSearchSpec {
  tags?: string;
  duration_min?: number;
  duration_max?: number;
  limit?: number;
  albumId?: number;
}

/** 搜尋多首曲目（標籤或專輯） */
export async function searchJamendoTracks(spec: JamendoSearchSpec): Promise<JamendoTrack[]> {
  if (!isJamendoConfigured()) return [];

  const limit = Math.min(Math.max(spec.limit ?? 1, 1), 10);
  const params = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit: String(limit),
    order: 'popularity_total',
    audioformat: 'mp32',
  });

  let url: string;
  if (spec.albumId != null) {
    params.set('id', String(spec.albumId));
    url = `${JAMENDO_BASE}/albums/tracks/?${params}`;
  } else {
    if (spec.tags) params.set('tags', spec.tags);
    params.set('include', 'musicinfo');
    if (spec.duration_min != null && spec.duration_max != null) {
      params.set('durationbetween', `${spec.duration_min}_${spec.duration_max}`);
    }
    url = `${JAMENDO_BASE}/tracks/?${params}`;
  }

  const searchRes = await fetch(url);
  if (!searchRes.ok) return [];

  const json = (await searchRes.json()) as JamendoSearchResponse;
  return (json.results ?? []).map(normalizeJamendoTrack);
}

function normalizeJamendoTrack(raw: JamendoTrack): JamendoTrack {
  if (raw.track_id) {
    return {
      id: String(raw.track_id),
      name: raw.track_name ?? raw.name,
      artist_name: raw.artist_name,
      audio: raw.audio,
      shareurl: raw.shareurl || `https://www.jamendo.com/track/${raw.track_id}`,
      license_ccurl: raw.license_ccurl,
    };
  }
  return raw;
}

/** 下載單首 Jamendo 曲目 */
export async function fetchJamendoTrackById(
  jamendoId: string,
  meta?: Pick<JamendoTrack, 'name' | 'artist_name' | 'shareurl' | 'license_ccurl'>,
): Promise<{ data: ArrayBuffer; mimeType: string; attribution: AudioAttribution } | null> {
  if (!isJamendoConfigured()) return null;
  const file = await downloadJamendoTrackFile(jamendoId);
  if (!file) return null;
  return {
    ...file,
    attribution: meta
      ? buildAttribution({ id: jamendoId, audio: '', ...meta, name: meta.name, artist_name: meta.artist_name })
      : {
          title: `Track ${jamendoId}`,
          author: 'Jamendo Artist',
          url: `https://www.jamendo.com/track/${jamendoId}`,
          license: 'Creative Commons (Jamendo)',
          source: 'jamendo',
        },
  };
}

export function isJamendoConfigured(): boolean {
  return Boolean(JAMENDO_CLIENT_ID);
}

export async function fetchJamendoTrack(
  trackId: MusicTrackId,
): Promise<{ data: ArrayBuffer; mimeType: string; attribution: AudioAttribution } | null> {
  if (!isJamendoConfigured()) return null;

  const spec = JAMENDO_SEARCH[trackId];
  const params = new URLSearchParams({
    client_id: JAMENDO_CLIENT_ID,
    format: 'json',
    limit: '1',
    order: 'popularity_total',
    tags: spec.tags,
    include: 'musicinfo',
  });
  if (spec.duration_min != null && spec.duration_max != null) {
    params.set('durationbetween', `${spec.duration_min}_${spec.duration_max}`);
  }

  const searchRes = await fetch(`${JAMENDO_BASE}/tracks/?${params}`);
  if (!searchRes.ok) return null;

  const json = (await searchRes.json()) as JamendoSearchResponse;
  const track = json.results?.[0];
  if (!track?.id) return null;

  const file = await downloadJamendoTrackFile(track.id);
  if (!file) return null;

  return {
    ...file,
    attribution: buildAttribution(track),
  };
}
