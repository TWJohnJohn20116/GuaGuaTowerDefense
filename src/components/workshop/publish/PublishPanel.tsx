/**
 * 發佈頁：.ggmod 封裝、簽章、翻譯包
 *
 * 這一頁不自己保管世界狀態：專案、資產全部從 workshopStore 讀，寫回也走 store action；
 * 打包／簽章／翻譯包都是純函式，這裡只負責接線與呈現。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/i18n';
import { useWorkshopStore } from '@/store/workshopStore';
import type { WorkshopProject } from '@/types/workshop';
import { Btn, Deck, Empty, Field, Input, Num, SegHead, Toggle } from '@/components/hl';
import {
  GGMOD_EXTENSION,
  type GgmodFile,
  type GgmodIssue,
  type GgmodThumbnail,
} from '@/workshop/package/format';
import { packProject, serializeGgmod, type PackAssetSource, type PackProjectSource } from '@/workshop/package/pack';
import { unpackGgmod, type UnpackResult } from '@/workshop/package/unpack';
import {
  isFingerprintTrusted,
  loadSigningKey,
  rotateSigningKey,
  setFingerprintTrusted,
  signGgmod,
  signatureFingerprint,
  verifyGgmodSignature,
  type GgmodSigningKey,
} from '@/workshop/package/sign';
import {
  I18N_PACK_EXTENSION,
  collectTranslatableEntries,
  createI18nPack,
  createMissingKeyPack,
  mergeI18nPack,
  parseI18nPack,
  serializeI18nPack,
  type I18nMergeMode,
  type I18nMergeReport,
} from '@/workshop/i18nPack';

export interface PublishPanelProps {
  projectId: string;
  levelId?: string;
}

const LICENSES: WorkshopProject['license'][] = ['all-rights-reserved', 'cc-by-4.0', 'cc-by-sa-4.0', 'cc0-1.0', 'mit'];

/** 專案直接引用的資產 id（含專案層與每個關卡） */
function collectAssetIds(project: WorkshopProject): string[] {
  const ids = new Set<string>();
  const push = (id: string | null): void => {
    if (id) ids.add(id);
  };
  const pushRef = (ref: { assetId: string } | null | undefined): void => {
    if (ref) ids.add(ref.assetId);
  };
  pushRef(project.ruleSetRef);
  for (const ref of project.assetRefs) pushRef(ref);
  for (const level of project.levels) {
    push(level.mapAssetId);
    pushRef(level.ruleSetRef);
    for (const ref of level.towerRefs) pushRef(ref);
    for (const ref of level.scriptRefs) pushRef(ref);
    for (const ref of level.artRefs) pushRef(ref);
  }
  return [...ids];
}

/** data URL → 封裝用的 { mediaType, base64 }；不是 data URL 就當沒有縮圖 */
function parseThumbnail(dataUrl: string): GgmodThumbnail | null {
  if (!dataUrl) return null;
  const match = /^data:([^;,]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2] };
}

function toDataUrl(thumbnail: GgmodThumbnail): string {
  return `data:${thumbnail.mediaType};base64,${thumbnail.base64}`;
}

function isLicense(value: string): value is WorkshopProject['license'] {
  return (LICENSES as string[]).includes(value);
}

function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|\s]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function downloadText(fileName: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function packedProject(source: WorkshopProject, levelId?: string): PackProjectSource {
  return {
    id: source.id,
    name: source.name,
    description: source.description,
    version: source.version,
    author: source.author,
    license: source.license,
    levelIds: source.levels.map((level) => level.id),
    data: {
      levels: levelId ? source.levels.filter((level) => level.id === levelId) : source.levels,
      winConditions: source.winConditions ?? null,
      ruleSetRef: source.ruleSetRef,
      assetRefs: source.assetRefs,
      // 引用版本快照：來源 id + 版本，重建時才對得回工坊資產
      assetVersions: source.assetRefs.map((ref) => ({ assetId: ref.assetId, version: ref.version })),
    },
    thumbnail: parseThumbnail(source.thumbnail),
  };
}

export function PublishPanel({ projectId, levelId }: PublishPanelProps) {
  const { t } = useTranslation();
  const p = t.studio.publish;

  const project = useWorkshopStore((state) => state.getProject(projectId));
  // 直接訂閱 assets 陣列：listAssets 是穩定的函式參考，拿它當 useMemo 依賴會讓預覽永遠停在舊資產
  const assets = useWorkshopStore((state) => state.assets);
  const updateProject = useWorkshopStore((state) => state.updateProject);
  const createProject = useWorkshopStore((state) => state.createProject);

  const [signingKey, setSigningKey] = useState<GgmodSigningKey | null>(null);
  const [keyTrusted, setKeyTrusted] = useState(false);
  const [storedFingerprint, setStoredFingerprint] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [issues, setIssues] = useState<GgmodIssue[]>([]);
  const [imported, setImported] = useState<UnpackResult | null>(null);
  const [packTrusted, setPackTrusted] = useState(false);
  const [locale, setLocale] = useState('en');
  const [mergeMode, setMergeMode] = useState<I18nMergeMode>('fill');
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [packReport, setPackReport] = useState<I18nMergeReport | null>(null);

  const packInputRef = useRef<HTMLInputElement | null>(null);
  const i18nInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  const referencedIds = useMemo(() => (project ? collectAssetIds(project) : []), [project]);
  const missingAssetIds = useMemo(() => {
    const known = new Set(assets.map((asset) => asset.id));
    return referencedIds.filter((id) => !known.has(id));
  }, [assets, referencedIds]);

  const assetSources = useMemo<PackAssetSource[]>(() => {
    const byId = new Map(assets.map((asset) => [asset.id, asset]));
    const sources: PackAssetSource[] = [];
    for (const id of referencedIds) {
      const asset = byId.get(id);
      if (!asset) continue;
      sources.push({
        assetId: asset.id,
        kind: asset.kind,
        name: asset.name,
        version: asset.version,
        data: asset.data,
        // 依賴只用 id 記錄；版本對得上就一起快照，對不上代表需要先補資產
        dependsOn: (asset.dependsOn ?? []).map((depId) => ({
          assetId: depId,
          version: byId.get(depId)?.version ?? '',
        })),
      });
    }
    return sources;
  }, [assets, referencedIds]);

  /** 即時打包預覽：UI 的大小統計與錯誤都來自它，不是猜的 */
  const preview = useMemo(() => {
    if (!project) return null;
    return packProject({ project: packedProject(project, levelId), assets: assetSources, generator: 'guagua-studio' });
  }, [project, assetSources, levelId]);

  const translationSource = useMemo(() => {
    if (!project) return {};
    if (levelId) {
      const level = project.levels.find((item) => item.id === levelId);
      return collectTranslatableEntries(level ?? {}, level ? `levels.${levelId}` : '');
    }
    return collectTranslatableEntries(project);
  }, [project, levelId]);
  const requiredKeys = useMemo(() => Object.keys(translationSource), [translationSource]);

  useEffect(() => {
    let alive = true;
    void loadSigningKey().then((key) => {
      if (!alive) return;
      setSigningKey(key);
      setKeyTrusted(key ? isFingerprintTrusted(key.fingerprint) : false);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 專案換了就把上一包的翻譯與匯入結果清掉，避免把 A 的譯文匯進 B
  useEffect(() => {
    setTranslations({});
    setPackReport(null);
    setImported(null);
    setIssues([]);
    setNotice(null);
  }, [projectId]);

  useEffect(() => {
    let alive = true;
    void signatureFingerprint(project?.signature ?? null).then((fp) => {
      if (alive) setStoredFingerprint(fp);
    });
    return () => {
      alive = false;
    };
  }, [project?.signature]);

  const handleExport = useCallback(async () => {
    if (!project || !preview) return;
    if (!preview.ok) {
      setIssues(preview.errors);
      setNotice({ tone: 'error', text: p.exportFailed.replace('{reason}', preview.errors[0]?.code ?? '') });
      return;
    }
    let file: GgmodFile = preview.value;
    if (signingKey) {
      const signed = await signGgmod(file, signingKey);
      if (!signed.ok) {
        setIssues(signed.errors);
        setNotice({ tone: 'error', text: p.signatureKeyMissing });
        return;
      }
      file = signed.value;
      updateProject(project.id, { signature: file.signature });
    }
    downloadText(`${safeFileName(project.name)}-${safeFileName(project.version)}${GGMOD_EXTENSION}`, serializeGgmod(file));
    setIssues([]);
    setNotice({ tone: 'ok', text: p.exportOk });
  }, [project, preview, signingKey, updateProject, p]);

  const handleImport = useCallback(
    async (file: File) => {
      const raw = await file.text();
      const result = await unpackGgmod(raw, { verifySignature: verifyGgmodSignature });
      if (!result.ok) {
        setImported(null);
        setIssues(result.errors);
        setNotice({
          tone: 'error',
          text: p.importError.replace('{reason}', result.errors[0]?.code ?? ''),
        });
        return;
      }
      setIssues([]);
      setImported(result.value);
      setPackTrusted(
        result.value.fingerprint ? isFingerprintTrusted(result.value.fingerprint) : false,
      );
      setNotice({ tone: 'ok', text: p.importOk });
    },
    [p],
  );

  /** 匯入只重建專案殼（metadata／縮圖）；資產與關卡還原需要 store 的匯入 action */
  const handleRestoreProject = useCallback(() => {
    if (!imported) return;
    const id = createProject(imported.file.project.name);
    updateProject(id, {
      description: imported.file.project.description,
      version: imported.file.project.version,
      author: imported.file.project.author,
      license: isLicense(imported.file.project.license) ? imported.file.project.license : 'all-rights-reserved',
      thumbnail: imported.file.thumbnail ? toDataUrl(imported.file.thumbnail) : '',
      signature: imported.file.signature,
    });
    setNotice({ tone: 'ok', text: p.importOk });
  }, [imported, createProject, updateProject, p]);

  const handleThumbnail = useCallback(
    (file: File) => {
      if (!project) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') updateProject(project.id, { thumbnail: reader.result });
      };
      reader.readAsDataURL(file);
    },
    [project, updateProject],
  );

  const handleExportPack = useCallback(() => {
    if (!project) return;
    const created = createI18nPack({ locale, entries: translations, projectId: project.id });
    if (!created.ok) {
      setNotice({ tone: 'error', text: created.errors[0]?.code ?? '' });
      return;
    }
    downloadText(
      `${safeFileName(project.name)}-${safeFileName(locale)}${I18N_PACK_EXTENSION}`,
      serializeI18nPack(created.value),
    );
    setNotice({ tone: 'ok', text: p.packExported });
  }, [project, locale, translations, p]);

  const handleExportMissing = useCallback(() => {
    if (!project) return;
    const base = createI18nPack({ locale, entries: translations, projectId: project.id });
    if (!base.ok) {
      setNotice({ tone: 'error', text: base.errors[0]?.code ?? '' });
      return;
    }
    const missing = packReport?.missing ?? requiredKeys;
    const pack = createMissingKeyPack(base.value, missing);
    if (!pack.ok) {
      setNotice({ tone: 'error', text: pack.errors[0]?.code ?? '' });
      return;
    }
    downloadText(
      `${safeFileName(project.name)}-${safeFileName(locale)}-missing${I18N_PACK_EXTENSION}`,
      serializeI18nPack(pack.value),
    );
    setNotice({ tone: 'ok', text: p.packExported });
  }, [project, locale, translations, packReport, requiredKeys, p]);

  const handleImportPack = useCallback(
    async (file: File) => {
      const raw = await file.text();
      const parsed = parseI18nPack(raw);
      if (!parsed.ok) {
        setNotice({ tone: 'error', text: p.importError.replace('{reason}', parsed.errors[0]?.code ?? '') });
        return;
      }
      const merged = mergeI18nPack(translations, parsed.value, requiredKeys, mergeMode);
      setTranslations(merged.entries);
      setPackReport(merged.report);
      setLocale(parsed.value.locale);
      setNotice({
        tone: 'ok',
        text: p.packMerged
          .replace('{filled}', String(merged.report.filled.length))
          .replace('{kept}', String(merged.report.kept.length)),
      });
    },
    [translations, requiredKeys, mergeMode, p],
  );

  if (!project) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <Empty title={p.noProject} hint={t.studio.dashboard.noProjectsHint} />
      </div>
    );
  }

  const packedOk = preview && preview.ok ? preview.value : null;
  const sizeKb = packedOk ? (packedOk.stats.totalBytes / 1024).toFixed(1) : '0';
  const assetCount = packedOk ? packedOk.stats.assetCount : assetSources.length;
  const signatureState = project.signature ? p.signed : p.unsigned;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3">
      <SegHead
        label={p.title}
        right={
          <span className="flex items-center gap-2">
            <span className="rounded-full border-2 border-[var(--cn-line-soft)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--cn-ink-2)]">
              {t.studio.dashboard.levelsCount.replace('{count}', String(project.levels.length))}
            </span>
            <span className="rounded-full border-2 border-[var(--cn-line-soft)] px-2 py-0.5 text-[11px] font-extrabold text-[var(--cn-ink-2)]">
              {t.studio.dashboard.assetsCount.replace('{count}', String(assetCount))}
            </span>
          </span>
        }
      />

      {notice && (
        <Deck tone={notice.tone === 'error' ? 'sunken' : 'base'} className="px-3 py-2">
          <span className="text-[12.5px] font-bold text-[var(--cn-ink)]">{notice.text}</span>
        </Deck>
      )}

      {issues.length > 0 && (
        <Deck tone="sunken" className="flex flex-col gap-1.5 px-3 py-2">
          <span className="arc-label">{p.errors}</span>
          {issues.map((issue) => (
            <span key={`${issue.code}-${issue.path ?? ''}`} className="font-mono text-[11.5px] text-[var(--cn-ink-2)]">
              {issue.code}
              {issue.path ? ` · ${issue.path}` : ''}
            </span>
          ))}
        </Deck>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <Deck className="flex flex-col gap-1 p-4">
          <span className="arc-label">{p.thumbnail}</span>
          <div className="mt-1 flex items-start gap-3">
            <div className="flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line-soft)] bg-[var(--cn-card-2)]">
              {project.thumbnail ? (
                <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[11px] font-bold text-[var(--cn-ink-3)]">{p.thumbnail}</span>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Btn size="sm" onClick={() => thumbInputRef.current?.click()}>
                {p.thumbnail}
              </Btn>
              <Num value={sizeKb} unit="KB" tone="muted" size="sm" />
            </div>
          </div>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleThumbnail(file);
              e.target.value = '';
            }}
          />

          <Field label={p.version}>
            <Input
              value={project.version}
              onChange={(e) => updateProject(project.id, { version: e.target.value })}
              className="h-8 w-28 text-[12px]"
            />
          </Field>
          <Field label={p.author}>
            <Input
              value={project.author}
              onChange={(e) => updateProject(project.id, { author: e.target.value })}
              className="h-8 w-40 text-[12px]"
            />
          </Field>
          <Field label={p.license}>
            <select
              value={project.license}
              onChange={(e) => {
                const next = e.target.value;
                if (isLicense(next)) updateProject(project.id, { license: next });
              }}
              className="h-8 rounded-[10px] border-[3px] border-[var(--cn-line)] bg-[var(--cn-card)] px-2 text-[12px] font-bold text-[var(--cn-ink)]"
            >
              {LICENSES.map((license) => (
                <option key={license} value={license}>
                  {license}
                </option>
              ))}
            </select>
          </Field>
        </Deck>

        <Deck className="flex flex-col gap-1 p-4">
          <span className="arc-label">{p.signature}</span>
          <Field label={p.signature}>
            <span className="text-[12.5px] font-extrabold text-[var(--cn-ink)]">{signatureState}</span>
          </Field>
          <Field label={p.fingerprint.replace('{fp}', storedFingerprint ?? '—')}>
            <span className="font-mono text-[11.5px] text-[var(--cn-ink-2)]">{storedFingerprint ?? '—'}</span>
          </Field>
          <Field label={p.signingKey} hint={p.trustHint}>
            <span className="font-mono text-[11.5px] text-[var(--cn-ink-2)]">{signingKey?.fingerprint ?? '—'}</span>
          </Field>
          <Field label={p.trustKey}>
            <span className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[var(--cn-ink-2)]">{keyTrusted ? p.trusted : p.untrusted}</span>
              <Toggle
                on={keyTrusted}
                label={p.trustKey}
                disabled={!signingKey}
                onChange={(next) => {
                  if (!signingKey) return;
                  setFingerprintTrusted(signingKey.fingerprint, next);
                  setKeyTrusted(next);
                }}
              />
            </span>
          </Field>
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => {
                void rotateSigningKey().then((key) => {
                  setSigningKey(key);
                  setKeyTrusted(key ? isFingerprintTrusted(key.fingerprint) : false);
                });
              }}
            >
              {p.rotateKey}
            </Btn>
          </div>
        </Deck>

        <Deck className="flex flex-col gap-2 p-4">
          <span className="arc-label">{p.file}</span>
          <span className="text-[12px] font-semibold text-[var(--cn-ink-2)]">
            {p.size.replace('{kb}', sizeKb)}
          </span>
          {missingAssetIds.length > 0 && (
            <span className="font-mono text-[11.5px] text-[var(--cn-alarm-text)]">
              {p.missingAssets.replace('{count}', String(missingAssetIds.length))}
            </span>
          )}
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" variant="signal" onClick={() => void handleExport()}>
              {p.export}
            </Btn>
            <Btn size="sm" onClick={() => packInputRef.current?.click()}>
              {p.import}
            </Btn>
          </div>
          <input
            ref={packInputRef}
            type="file"
            accept={`.ggmod,application/json`}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImport(file);
              e.target.value = '';
            }}
          />

          {imported && (
            <div className="mt-1 flex flex-col gap-1.5 rounded-[var(--cn-r-sm)] border-[3px] border-[var(--cn-line-soft)] p-2.5">
              <span className="arc-label">{p.importPreview}</span>
              <Field label={p.version}>
                <span className="text-[12px] font-bold text-[var(--cn-ink)]">{imported.file.project.version}</span>
              </Field>
              <Field label={p.author}>
                <span className="text-[12px] font-bold text-[var(--cn-ink)]">{imported.file.project.author}</span>
              </Field>
              <Field label={p.signature}>
                <span className="text-[12px] font-bold text-[var(--cn-ink)]">
                  {imported.signatureStatus === 'valid'
                    ? p.signed
                    : imported.signatureStatus === 'unsigned'
                      ? p.unsigned
                      : p.signatureInvalid}
                </span>
              </Field>
              <Field label={p.fingerprint.replace('{fp}', imported.fingerprint ?? '—')}>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11.5px] text-[var(--cn-ink-2)]">{imported.fingerprint ?? '—'}</span>
                  <Toggle
                    on={packTrusted}
                    label={p.trustKey}
                    disabled={!imported.fingerprint}
                    onChange={(next) => {
                      if (!imported.fingerprint) return;
                      setFingerprintTrusted(imported.fingerprint, next);
                      setPackTrusted(next);
                    }}
                  />
                </span>
              </Field>
              <Btn size="sm" variant="line" onClick={handleRestoreProject}>
                {p.importAsProject}
              </Btn>
            </div>
          )}
        </Deck>

        <Deck className="flex flex-col gap-2 p-4">
          <span className="arc-label">{p.i18nPack}</span>
          <Field label={p.locale}>
            <Input
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="h-8 w-24 text-[12px] font-mono"
            />
          </Field>
          <Field label={p.mergeMode}>
            <span className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-[var(--cn-ink-2)]">
                {mergeMode === 'fill' ? p.mergeFill : p.mergeOverwrite}
              </span>
              <Toggle
                on={mergeMode === 'overwrite'}
                label={p.mergeMode}
                onChange={(next) => setMergeMode(next ? 'overwrite' : 'fill')}
              />
            </span>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" variant="signal" onClick={handleExportPack}>
              {p.exportPack}
            </Btn>
            <Btn size="sm" onClick={() => i18nInputRef.current?.click()}>
              {p.importPack}
            </Btn>
            <Btn size="sm" variant="ghost" onClick={handleExportMissing}>
              {p.exportMissing}
            </Btn>
          </div>
          <input
            ref={i18nInputRef}
            type="file"
            accept={`${I18N_PACK_EXTENSION},application/json`}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleImportPack(file);
              e.target.value = '';
            }}
          />
          <Field label={p.missingKeys.replace('{count}', String(packReport?.missing.length ?? requiredKeys.length))}>
            <Num value={packReport?.missing.length ?? requiredKeys.length} tone="caution" size="sm" />
          </Field>
          <Field label={p.extraKeys.replace('{count}', String(packReport?.extra.length ?? 0))}>
            <Num value={packReport?.extra.length ?? 0} tone="muted" size="sm" />
          </Field>
          <Field label={p.requiredKeys.replace('{count}', String(requiredKeys.length))}>
            <Num value={requiredKeys.length} tone="muted" size="sm" />
          </Field>
        </Deck>
      </div>
    </div>
  );
}
