import { motion } from 'framer-motion';
import { type ReactNode, type MutableRefObject, forwardRef } from 'react';
import { SCENE_GLASS } from '@/components/ui/SceneWorkshopLayout';

export const WorkshopCard = forwardRef<HTMLDivElement | HTMLButtonElement, {
  title: string;
  description?: string;
  icon?: ReactNode;
  cover?: ReactNode;
  coverHeight?: string; // e.g. "h-32", "h-48"
  children?: ReactNode;
  badge?: string;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  renderCustomContent?: () => ReactNode; // 新增完全自訂內容的方法
}>(({
  title,
  description,
  icon,
  cover,
  coverHeight = "h-32",
  children,
  badge,
  fullWidth = false,
  className = '',
  onClick,
  renderCustomContent,
}, ref) => {
  // motion.div 與 motion.button 要的 ref 型別不同，但這裡兩者共用同一個元件；
  // 用具名回呼把 union 收斂成元素實際型別，避免用 any 轉型把整個 ref 的型別關掉。
  const setRef = (el: HTMLElement | null) => {
    const node = el as HTMLDivElement | HTMLButtonElement | null;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as MutableRefObject<HTMLDivElement | HTMLButtonElement | null>).current = node;
  };

  const whileHover = renderCustomContent && !onClick ? undefined : { scale: 0.995, y: -2 };
  const whileTap = onClick ? { scale: 0.98 } : undefined;
  const spring = { type: 'spring' as const, stiffness: 400, damping: 30 };
  const customClass = className;
  const cardClass = `group flex flex-col text-left ${SCENE_GLASS.workshopCard} ${onClick ? SCENE_GLASS.workshopCardHover : ''} ${fullWidth ? 'col-span-full' : ''} ${className}`;

  const content = renderCustomContent ? renderCustomContent() : (
    <>
      {cover && (
        <div className={`relative w-full ${coverHeight} overflow-hidden ${SCENE_GLASS.workshopCover}`}>
          {cover}
        </div>
      )}
      <div className="relative p-6 flex items-start gap-4 transition-colors">
        {icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-[var(--arc-ink-2)] transition-all duration-500 group-hover:text-[var(--arc-ink)] ${SCENE_GLASS.workshopIcon}`}>
            <div className="scale-110">{icon}</div>
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3rem]">
          <div className="flex items-center gap-3">
            <h3 className="arc-title text-base font-bold text-[var(--arc-ink)] tracking-wide truncate">{title}</h3>
            {badge && (
              <span className={`px-2.5 py-0.5 ${SCENE_GLASS.workshopBadge}`}>
                {badge}
              </span>
            )}
          </div>
          {description && <p className="arc-micro text-[11px] font-medium tracking-wide text-[var(--arc-ink-4)] mt-1 line-clamp-2">{description}</p>}
        </div>
      </div>
      {children && (
        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col bg-transparent">
          {children}
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <motion.button
        ref={setRef}
        className={renderCustomContent ? customClass : cardClass}
        whileHover={whileHover}
        whileTap={whileTap}
        transition={spring}
        onClick={onClick}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={setRef}
      className={renderCustomContent ? customClass : cardClass}
      whileHover={whileHover}
      whileTap={whileTap}
      transition={spring}
    >
      {content}
    </motion.div>
  );
});
