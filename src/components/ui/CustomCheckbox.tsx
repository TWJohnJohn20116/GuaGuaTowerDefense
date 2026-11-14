import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
  color?: string; // e.g. 'orange-500', 'cyan-500'
  className?: string;
}

export function CustomCheckbox({
  checked,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  color = 'nordic-primary',
  className = '',
}: CustomCheckboxProps) {
  return (
    <label
      className={`
        flex items-center gap-4 p-4  border transition-all 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${checked 
          ? `border-${color}/30 bg-${color}/10 shadow-[0_0_20px_var(--color-${color},rgba(255,255,255,0.1))]` 
          : 'border-[var(--hl-line)] bg-[var(--hl-deck-2)] hover:bg-[var(--hl-deck-3)]'
        }
        ${className}
      `}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
          className="peer sr-only"
        />
        <div
          className={`
            w-6 h-6  border-2 flex items-center justify-center transition-all
            ${checked 
              ? `bg-${color} border-${color}` 
              : 'border-[var(--hl-line-strong)] bg-black/20 group-hover:border-[var(--hl-line-hot)]'
            }
          `}
        >
          <motion.svg
            initial={false}
            animate={checked ? "checked" : "unchecked"}
            variants={{
              checked: { scale: 1, opacity: 1 },
              unchecked: { scale: 0.5, opacity: 0 }
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-4 h-4 text-[var(--hl-ink)] pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </motion.svg>
        </div>
      </div>

      {icon && (
        <div className={`w-6 h-6 ${checked ? `text-${color}` : 'text-[var(--hl-ink-4)]'}`}>
          {icon}
        </div>
      )}

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <div className={`text-sm font-bold ${checked ? 'text-[var(--hl-ink)]' : 'text-[var(--hl-ink-3)]'}`}>
              {label}
            </div>
          )}
          {description && (
            <div className="text-[10px] text-[var(--hl-ink-4)] mt-0.5 tracking-wider">
              {description}
            </div>
          )}
        </div>
      )}
    </label>
  );
}
