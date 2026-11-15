/**
 * Mod 腳本編輯器 — 單支腳本的工作台
 *
 * 左半是「這支腳本能做什麼」（hook／權限／節流），右半是程式碼；
 * 底部即時顯示語法狀態、缺權限提示與最近日誌。
 */
import { useEffect, useMemo, useState } from 'react';
import type { CustomScriptData, ModScriptHook, ModScriptPermission } from '@/types/modScript';
import { checkScriptSyntax } from '@/mod-script/sandbox';
import { missingPermissions } from '@/mod-script/permissions';
import { MOD_SCRIPT_HOOKS, MOD_SCRIPT_LIMITS, MOD_SCRIPT_PERMISSIONS } from '@/mod-script/limits';
import { useModScriptStore } from '@/store/modScriptStore';
import { useModStore } from '@/store/modStore';
import { verifyModSignature, type ModSignatureResult } from '@/mod-script/signing';
import { useTranslation } from '@/i18n';
import { fillTemplate } from '@/i18n/fileMetaExtraLabels';
import { CopyIcon, PlayIcon, TrashIcon } from '@/components/ui/Icons';
import { Btn, Input, Key, Num, SegHead, Toggle } from '@/components/hl';
import { createScriptSkeleton } from './scriptTemplate';
import { ScriptCodeEditor } from './ScriptCodeEditor';

interface ScriptEditorProps {
  script: CustomScriptData;
  onChange: (script: CustomScriptData) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SectionHead({ no, title, hint }: { no: string; title: string; hint?: string }) {
  return (
    <SegHead
      className="min-w-0"
      label={
        <span className="flex items-center gap-2">
          <Key>{no}</Key>
          <span className="text-[var(--cn-ink-2)]">{title}</span>
        </span>
      }
      right={hint ? <span className="shrink-0 font-mono text-[9.5px] text-[var(--cn-ink-4)]">{hint}</span> : undefined}
    />
  );
}

export function ScriptEditor({ script, onChange, onDelete, onDuplicate }: ScriptEditorProps) {
  const { t } = useTranslation();
  const m = t.modEditorExt;
  const logs = useModScriptStore((s) => s.logs);
  const scriptingEnabled = useModScriptStore((s) => s.enabled);
  const setScriptingEnabled = useModScriptStore((s) => s.setEnabled);
  const status = useModScriptStore((s) => s.statuses.find((item) => item.scriptId === script.id));
  const scriptState = useModScriptStore((s) => s.scriptState[script.id]);
  const clearScriptState = useModScriptStore((s) => s.clearScriptState);
  const stateKeys = Object.keys(scriptState ?? {}).length;
  const trustMode = useModScriptStore((s) => s.trustMode);
  const setTrustMode = useModScriptStore((s) => s.setTrustMode);
  const trustedFingerprints = useModScriptStore((s) => s.trustedKeyFingerprints);
  const trustKey = useModScriptStore((s) => s.trustKey);
  const ownerMod = useModStore((s) => s.mods.find((item) => item.metadata.id === script.modId));
  const [signature, setSignature] = useState<ModSignatureResult | null>(null);

  useEffect(() => {
    if (!ownerMod) {
      setSignature(null);
      return;
    }
    let alive = true;
    void verifyModSignature(ownerMod).then((result) => {
      if (alive) setSignature(result);
    });
    return () => {
      alive = false;
    };
  }, [ownerMod]);

  const fingerprint = signature?.fingerprint ?? null;
  const keyIsTrusted = fingerprint !== null && trustedFingerprints.includes(fingerprint);
  const signatureLabel = !ownerMod
    ? m.scriptSigNoMod
    : signature === null
      ? '—'
      : signature.status === 'unsigned'
        ? m.scriptSigUnsigned
        : signature.status === 'valid'
          ? m.scriptSigValid
          : signature.status === 'invalid'
            ? m.scriptSigInvalid
            : m.scriptSigError;

  const syntaxError = useMemo(() => checkScriptSyntax(script.code), [script.code]);
  const missing = useMemo(
    () => missingPermissions(script.code, script.permissions),
    [script.code, script.permissions],
  );
  const recentLogs = useMemo(
    () => logs.filter((entry) => entry.scriptId === script.id).slice(-6),
    [logs, script.id],
  );
  const lineCount = useMemo(() => script.code.split('\n').length, [script.code]);

  const toggleHook = (hook: ModScriptHook) => {
    const hooks = script.hooks.includes(hook)
      ? script.hooks.filter((item) => item !== hook)
      : [...script.hooks, hook];
    onChange({ ...script, hooks });
  };

  const togglePermission = (permission: ModScriptPermission) => {
    const permissions = script.permissions.includes(permission)
      ? script.permissions.filter((item) => item !== permission)
      : [...script.permissions, permission];
    onChange({ ...script, permissions });
  };

  const statusLabel =
    status?.state === 'running' ? m.scriptStatusRunning
      : status?.state === 'error' ? m.scriptStatusError
        : status?.state === 'disabled' ? m.scriptStatusDisabled
          : m.scriptStatusIdle;

  return (
    <div className="flex flex-col gap-3 px-3 py-3">
      {/* 名稱 / 描述 / 動作 */}
      <div className="flex flex-wrap items-start gap-2">
        <Input
          value={script.name}
          onChange={(e) => onChange({ ...script, name: e.target.value })}
          placeholder={m.scriptNamePh}
          className="h-8 w-56 text-[12px]"
        />
        <Input
          value={script.description}
          onChange={(e) => onChange({ ...script, description: e.target.value })}
          placeholder={m.scriptDescPh}
          className="h-8 min-w-0 flex-1 text-[12px]"
        />
        <Btn size="sm" variant="line" icon={<CopyIcon className="h-3.5 w-3.5" />} onClick={onDuplicate}>
          {m.duplicate}
        </Btn>
        <Btn size="sm" variant="line" icon={<TrashIcon className="h-3.5 w-3.5" />} onClick={onDelete}>
          {m.delete}
        </Btn>
      </div>

      {/* 全域開關 + 狀態 */}
      <div className="flex flex-wrap items-center gap-3 border-y border-[var(--cn-line-soft)] py-2">
        <span className="arc-label">{m.scriptGlobalSwitch}</span>
        <Toggle on={scriptingEnabled} onChange={setScriptingEnabled} label={m.scriptGlobalSwitch} />
        <span className="ml-auto flex items-center gap-1.5">
          <PlayIcon className="h-3 w-3 text-[var(--cn-ink-3)]" />
          <span className="font-mono text-[10px] text-[var(--cn-ink-2)]">{statusLabel}</span>
          <Num value={String(status?.calls ?? 0).padStart(3, '0')} tone="muted" size="sm" />
        </span>
      </div>

      {/* 簽章與信任 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--cn-line-soft)] pb-2">
        <span className="arc-label">{m.scriptTrustTitle}</span>
        <Btn
          size="sm"
          variant={trustMode === 'all' ? 'signal' : 'line'}
          onClick={() => setTrustMode('all')}
        >
          {m.scriptTrustAll}
        </Btn>
        <Btn
          size="sm"
          variant={trustMode === 'signed' ? 'signal' : 'line'}
          onClick={() => setTrustMode('signed')}
        >
          {m.scriptTrustSigned}
        </Btn>
        <span className="ml-auto font-mono text-[10px] text-[var(--cn-ink-3)]">{signatureLabel}</span>
        {fingerprint && (
          <span className="font-mono text-[9.5px] text-[var(--cn-ink-4)]">
            {fillTemplate(m.scriptSigFingerprint, { fp: fingerprint })}
          </span>
        )}
        {fingerprint && signature?.status === 'valid' && !keyIsTrusted && (
          <Btn size="sm" variant="line" onClick={() => trustKey(fingerprint)}>
            {m.scriptTrustKey}
          </Btn>
        )}
        {keyIsTrusted && (
          <span className="font-mono text-[9.5px] text-[var(--cn-vital-text)]">{m.scriptTrustedKey}</span>
        )}
        <span className="w-full font-mono text-[9.5px] text-[var(--cn-ink-4)]">{m.scriptTrustHint}</span>
      </div>

      {/* 01 hook */}
      <SectionHead no="01" title={m.scriptHooksTitle} hint={m.scriptHooksHint} />
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
        {MOD_SCRIPT_HOOKS.map((hook) => {
          const active = script.hooks.includes(hook);
          return (
            <button
              key={hook}
              type="button"
              onClick={() => toggleHook(hook)}
              className={`flex items-center justify-between border px-2 py-1.5 text-left transition-colors ${
                active
                  ? 'border-[var(--arc-gold)] text-[var(--arc-ink)]'
                  : 'border-[var(--cn-line-soft)] text-[var(--cn-ink-3)] hover:border-[var(--arc-line)]'
              }`}
            >
              <span className="truncate font-mono text-[10.5px]">{hook}</span>
              <span className="ml-2 shrink-0 font-mono text-[9px] text-[var(--cn-ink-4)]">
                {m.scriptHooks[hook]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 02 權限 */}
      <SectionHead no="02" title={m.scriptPermsTitle} hint={m.scriptPermsHint} />
      <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
        {MOD_SCRIPT_PERMISSIONS.map((permission) => {
          const active = script.permissions.includes(permission);
          return (
            <button
              key={permission}
              type="button"
              onClick={() => togglePermission(permission)}
              className={`flex items-center justify-between border px-2 py-1.5 text-left transition-colors ${
                active
                  ? 'border-[var(--arc-gold)] text-[var(--arc-ink)]'
                  : 'border-[var(--cn-line-soft)] text-[var(--cn-ink-3)] hover:border-[var(--arc-line)]'
              }`}
            >
              <span className="truncate font-mono text-[10.5px]">{permission}</span>
              <span className="ml-2 shrink-0 text-[9.5px] text-[var(--cn-ink-4)]">
                {m.scriptPerms[permission]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 03 程式碼 */}
      <SectionHead
        no="03"
        title={m.scriptCodeTitle}
        hint={fillTemplate(m.scriptCodeHint, { lines: String(lineCount), max: String(MOD_SCRIPT_LIMITS.maxCodeLength) })}
      />
      <ScriptCodeEditor
        value={script.code}
        onChange={(code) => onChange({ ...script, code })}
        placeholder={m.scriptCodePh}
        hint={m.scriptAutocompleteHint}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Btn
          size="sm"
          variant="line"
          onClick={() => onChange({ ...script, code: createScriptSkeleton() })}
        >
          {m.scriptInsertSkeleton}
        </Btn>
        <label className="flex items-center gap-1.5">
          <span className="arc-label">{m.scriptThrottleLabel}</span>
          <Input
            type="number"
            min={0}
            max={60000}
            value={script.throttleMs ?? 0}
            onChange={(e) => onChange({ ...script, throttleMs: Math.max(0, Number(e.target.value) || 0) })}
            className="h-7 w-20 px-1.5 text-center font-mono text-[11px]"
          />
          <span className="text-[10px] text-[var(--cn-ink-4)]">{m.scriptThrottleHint}</span>
        </label>
        <Btn size="sm" variant="ghost" onClick={() => clearScriptState(script.id)}>
          {fillTemplate(m.scriptClearState, { count: String(stateKeys) })}
        </Btn>
        <span
          className={`ml-auto font-mono text-[10.5px] ${
            syntaxError ? 'text-[var(--cn-alert-text)]' : 'text-[var(--cn-vital-text)]'
          }`}
        >
          {syntaxError ? fillTemplate(m.scriptSyntaxError, { message: syntaxError }) : m.scriptSyntaxOk}
        </span>
      </div>

      {missing.length > 0 && (
        <div className="border-l-2 border-l-[var(--cn-caution-text)] pl-2 font-mono text-[10.5px] text-[var(--cn-caution-text)]">
          {fillTemplate(m.scriptMissingPerms, { perms: missing.join(', ') })}
        </div>
      )}

      {/* 04 日誌 */}
      <SectionHead no="04" title={m.scriptLogsTitle} hint={m.scriptLogsHint} />
      {recentLogs.length === 0 ? (
        <span className="font-mono text-[10.5px] text-[var(--cn-ink-4)]">{m.scriptLogsEmpty}</span>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--cn-line-soft)] border border-[var(--cn-line-soft)]">
          {recentLogs.map((entry, index) => (
            <div key={`${entry.at}-${index}`} className="flex items-baseline gap-2 px-2 py-1">
              <span className="shrink-0 font-mono text-[9px] text-[var(--cn-ink-4)]">
                {new Date(entry.at).toLocaleTimeString()}
              </span>
              <span
                className={`shrink-0 font-mono text-[9px] uppercase ${
                  entry.level === 'error' ? 'text-[var(--cn-alert-text)]'
                    : entry.level === 'warn' ? 'text-[var(--cn-caution-text)]'
                      : 'text-[var(--cn-ink-3)]'
                }`}
              >
                {entry.level}
              </span>
              <span className="min-w-0 flex-1 truncate text-[11px] text-[var(--cn-ink-2)]">{entry.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
