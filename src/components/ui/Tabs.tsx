import React from 'react';
import { motion } from 'framer-motion';

interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  gradient?: string; // e.g. ' '
}

type TabsVariant = 'default' | 'pills' | 'underline' | 'solid' | 'minimal' | 'cards' | 'glass';

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  variant?: TabsVariant;
  className?: string;
  tabClassName?: string;
  fullWidth?: boolean;
  wrap?: boolean;
}

export function Tabs<T extends string = string>({ 
  tabs, 
  activeId, 
  onChange, 
  variant = 'default',
  className = '', 
  tabClassName = '',
  fullWidth = true,
  wrap = false
}: TabsProps<T>) {
  // Container styles based on variant
  const getContainerStyles = () => {
    const baseStyles = wrap 
      ? "flex flex-wrap items-center gap-y-2 gap-x-2" 
      : "flex items-center overflow-x-auto scrollbar-none mask-edges-x px-2 -mx-2";
    const widthStyles = fullWidth && !wrap ? "w-full min-w-max" : fullWidth ? "w-full" : "";
    
    switch (variant) {
      case 'default':
      case 'glass':
        return `${baseStyles} ${widthStyles} gap-1.5 p-1.5  bg-[var(--cn-card-2)] border-[3px] border-[var(--cn-line-soft)] `;
      case 'pills':
        return `${baseStyles} ${widthStyles} p-1.5 bg-[var(--cn-card-2)]  border-[3px] border-[var(--cn-line-soft)]`;
      case 'underline':
        return `${baseStyles} ${widthStyles} gap-4 border-b border-[var(--cn-line-soft)]`;
      case 'solid':
        return `${baseStyles} ${widthStyles} p-1 bg-[var(--cn-card-2)] border-[3px] border-[var(--cn-line-soft)] `;
      case 'minimal':
        return `${baseStyles} ${widthStyles} gap-2`;
      case 'cards':
        return `${baseStyles} ${widthStyles} gap-2`;
      default:
        return `${baseStyles} ${widthStyles} gap-1.5 p-1.5  bg-[var(--cn-card-2)] border-[3px] border-[var(--cn-line-soft)]`;
    }
  };

  // Tab button styles based on variant
  const getTabStyles = (isActive: boolean, gradient: string) => {
    const baseStyles = "relative flex items-center justify-center gap-2 font-bold tracking-widest text-xs uppercase whitespace-nowrap flex-shrink-0 transition-all duration-300 outline-none overflow-hidden";
    const flexStyles = fullWidth ? "flex-1" : wrap ? "flex-1 min-w-[100px]" : "";
    
    switch (variant) {
      case 'default':
        return `${baseStyles} ${flexStyles} px-4 py-2.5 
          ${isActive
            ? `bg-[var(--arc-deck-2)] ${gradient} text-[var(--arc-ink)] `
            : 'text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)] hover:bg-[var(--arc-deck-2)]'
          }`;
      
      case 'pills':
        return `${baseStyles} ${flexStyles} px-5 py-2.5 
          ${isActive
            ? `bg-[var(--arc-deck-2)] ${gradient} text-[var(--arc-ink)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)] border border-[var(--arc-line-strong)]`
            : 'bg-[var(--cn-card-2)] text-[var(--arc-ink-4)] border-[3px] border-[var(--cn-line-soft)] hover:bg-[var(--arc-deck-2)] hover:text-[var(--arc-ink)]'
          }`;
          
      case 'underline':
          return `${baseStyles} ${flexStyles} px-1 py-3 hover:text-[var(--arc-ink)]
            ${isActive ? 'text-[var(--arc-ink)]' : 'text-[var(--arc-ink-4)]'}`;
          
      case 'solid':
          return `${baseStyles} ${flexStyles} px-4 py-2.5 
            ${isActive
              ? 'bg-[var(--arc-deck-3)] text-[var(--arc-ink)]  border-[3px] border-[var(--cn-line-soft)]'
              : 'text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)] hover:bg-[var(--arc-deck-2)]'
            }`;
          
      case 'minimal':
        case 'glass':
          return `${baseStyles} ${flexStyles} px-3 py-1.5 
            ${isActive ? 'text-[var(--arc-ink)] font-black tracking-widest uppercase text-[11px]' : 'text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)] font-bold tracking-widest uppercase text-[11px]'}`;
          
      case 'cards':
        return `${baseStyles} ${flexStyles} px-4 py-3 -t-xl border-t border-l border-r border-transparent
          ${isActive 
            ? 'bg-[var(--cn-card-2)] border-[var(--cn-line-soft)] text-[var(--arc-ink)] z-10' 
            : 'bg-[var(--cn-card-2)] text-[var(--arc-ink-4)] hover:bg-[var(--arc-deck-2)] border-b border-[var(--cn-line-soft)]'}`;
            
      default:
        return baseStyles;
    }
  };

  return (
    <div className={`${getContainerStyles()} rounded-sm ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeId === tab.id;
        const activeGradient = tab.gradient || 'from-nordic-primary to-nordic-accent';
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${getTabStyles(isActive, activeGradient)} ${tabClassName}`}
            whileHover={!isActive ? { scale: 0.98 } : {}}
            whileTap={{ scale: 0.95 }}
          >
            {/* Background animations for some variants */}
            {isActive && variant === 'underline' && (
              <motion.div
                layoutId={`underline-${activeGradient}`}
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--arc-deck-2)]   -t-full shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            
            {isActive && (variant === 'pills' || variant === 'solid' || variant === 'default' || variant === 'minimal' || variant === 'glass') && (
              <motion.div
                layoutId="activeTabBackground"
                className={`absolute inset-0 ${
                  variant === 'solid' 
                    ? 'bg-[var(--arc-deck-3)] border border-[var(--arc-line-strong)] shadow-[0_4px_0_-2px_rgba(46,36,64,0.16)]'
                    : variant === 'minimal' || variant === 'glass'
                      ? 'bg-[var(--arc-deck-3)] border-[3px] border-[var(--cn-line-soft)] '
                      : 'bg-[var(--arc-deck-3)] border-[3px] border-[var(--cn-line-soft)] shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
                }  mix-blend-overlay pointer-events-none`}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            {tab.icon && (
              <span className={`flex-shrink-0 flex items-center justify-center relative z-10 ${isActive && (variant === 'default' || variant === 'pills') ? '[&>svg]:!text-[var(--arc-ink)]' : ''}`}>
                {tab.icon}
              </span>
            )}
            <span className="relative z-10">{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`
                flex-shrink-0 px-2 py-0.5  text-[9px] font-extrabold leading-none relative z-10 
                ${isActive && (variant === 'default' || variant === 'pills') ? 'bg-[var(--cn-card-2)] text-[var(--arc-ink)] border border-black/20' : 'bg-[var(--cn-card-2)] text-[var(--arc-ink-3)] border-[3px] border-[var(--cn-line-soft)]'}
              `}>
                {tab.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
