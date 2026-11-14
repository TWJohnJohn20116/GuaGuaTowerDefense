import { motion } from 'framer-motion';
import { type ReactNode, forwardRef } from 'react';
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
  const Component = onClick ? motion.button : motion.div;
  const clickProps = onClick ? { onClick } : {};

  if (renderCustomContent) {
    return (
      <Component
        ref={ref as any}
        className={className}
        whileHover={onClick ? { scale: 0.995, y: -2 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        {...clickProps}
      >
        {renderCustomContent()}
      </Component>
    );
  }

  return (
    <Component
      ref={ref as any}
      className={`group flex flex-col text-left ${SCENE_GLASS.workshopCard} ${onClick ? SCENE_GLASS.workshopCardHover : ''} ${fullWidth ? 'col-span-full' : ''} ${className}`}
      whileHover={{ scale: 0.995, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      {...clickProps}
    >
      {cover && (
        <div className={`relative w-full ${coverHeight} overflow-hidden ${SCENE_GLASS.workshopCover}`}>
          {cover}
        </div>
      )}
      <div className="relative p-6 flex items-start gap-4 transition-colors">
        {icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center text-[var(--hl-ink-2)] transition-all duration-500 group-hover:text-[var(--hl-ink)] ${SCENE_GLASS.workshopIcon}`}>
            <div className="scale-110">{icon}</div>
          </div>
        )}
        <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[3rem]">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-[var(--hl-ink)] tracking-wide truncate">{title}</h3>
            {badge && (
              <span className={`px-2.5 py-0.5 ${SCENE_GLASS.workshopBadge}`}>
                {badge}
              </span>
            )}
          </div>
          {description && <p className="text-[11px] font-medium tracking-wide text-[var(--hl-ink-4)] mt-1 line-clamp-2">{description}</p>}
        </div>
      </div>
      {children && (
        <div className="px-6 pb-6 pt-2 flex-1 flex flex-col bg-transparent">
          {children}
        </div>
      )}
    </Component>
  );
});
