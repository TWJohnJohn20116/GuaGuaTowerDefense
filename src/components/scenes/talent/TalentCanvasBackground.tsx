// 天賦樹 · 畫布背景（十字軸線，無光暈無漸層）
export function TalentCanvasBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute left-0 top-1/2 h-px w-full bg-[var(--hl-line)] opacity-60" />
      <span className="absolute left-1/2 top-0 h-full w-px bg-[var(--hl-line)] opacity-60" />
      <span className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 border border-[var(--hl-line-strong)]" />
    </div>
  );
}

export default TalentCanvasBackground;
