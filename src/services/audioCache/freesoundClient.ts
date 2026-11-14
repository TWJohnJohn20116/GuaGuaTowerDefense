/**
 * Freesound API — 搜尋並下載 preview MP3（免 OAuth）
 * https://freesound.org/docs/api/
 */
import {
  FREESOUND_API_KEY,
  FREESOUND_BASE,
  FREESOUND_SEARCH,
  type AudioAttribution,
} from './audioApiConfig';
import type { SoundId } from '../sfx/soundConfig';

interface FreesoundPreview {
  'preview-hq-mp3'?: string;
  'preview-lq-mp3'?: string;
}

interface FreesoundResult {
  id: number;
  name: string;
  username: string;
  previews: FreesoundPreview;
  license: string;
  url: string;
}

interface FreesoundSearchResponse {
  count: number;
  results: FreesoundResult[];
}

export function isFreesoundConfigured(): boolean {
  return Boolean(FREESOUND_API_KEY);
}

export async function fetchFreesoundPreview(
  soundId: SoundId,
): Promise<{ data: ArrayBuffer; mimeType: string; attribution: AudioAttribution } | null> {
  if (!isFreesoundConfigured()) return null;

  const query = FREESOUND_SEARCH[soundId];
  const params = new URLSearchParams({
    query,
    token: FREESOUND_API_KEY,
    page_size: '1',
    sort: 'rating_desc',
    fields: 'id,name,username,previews,license,url',
  });

  const searchRes = await fetch(`${FREESOUND_BASE}/search/text/?${params}`);
  if (!searchRes.ok) return null;

  const json = (await searchRes.json()) as FreesoundSearchResponse;
  const hit = json.results?.[0];
  const previewUrl =
    hit?.previews?.['preview-hq-mp3'] ?? hit?.previews?.['preview-lq-mp3'];
  if (!hit || !previewUrl) return null;

  const fileRes = await fetch(previewUrl);
  if (!fileRes.ok) return null;

  const data = await fileRes.arrayBuffer();
  return {
    data,
    mimeType: 'audio/mpeg',
    attribution: {
      title: hit.name,
      author: hit.username,
      url: hit.url,
      license: hit.license,
      source: 'freesound',
    },
  };
}
