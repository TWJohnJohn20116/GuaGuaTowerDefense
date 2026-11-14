/**
 * 自定義輸入框組件
 * Custom Input Component with beautiful styling
 */

import { useState, forwardRef, InputHTMLAttributes } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchIcon, CrossIcon, WarningIcon } from './Icons';

interface CustomInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  icon?: string | React.ReactNode;
  label?: string;
  error?: string;
  hint?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'ghost' | 'glass';
  fullWidth?: boolean;
  clearable?: boolean;
  onClear?: () => void;
}

export const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({
  icon,
  label,
  error,
  hint,
  size = 'md',
  variant = 'glass',
  fullWidth = true,
  clearable = false,
  onClear,
  className = '',
  disabled,
  value,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const sizeClasses = {
    sm: {
      input: 'px-3 py-1.5 text-sm',
      icon: 'text-sm w-8',
      label: 'text-xs mb-1',
    },
    md: {
      input: 'px-4 py-2.5 text-sm',
      icon: 'text-base w-10',
      label: 'text-sm mb-1.5',
    },
    lg: {
      input: 'px-5 py-3 text-base',
      icon: 'text-lg w-12',
      label: 'text-base mb-2',
    },
  };

  const variantClasses = {
    default: `
      bg-[var(--cn-card-2)] border-[3px] border-[var(--cn-line-soft)] 
      focus:border-[rgba(111,140,255,0.38)] focus:ring-1 focus:ring-[var(--cn-sky)]
      hover:border-[var(--arc-line-strong)] text-[var(--arc-ink)] 
      ${error ? 'border-[rgba(255,61,113,0.38)] focus:border-[var(--cn-alert)] focus:ring-[var(--cn-alert)]/20 bg-[rgba(255,61,113,0.12)]' : ''}
    `,
    filled: `
      bg-[var(--arc-deck-2)] border border-transparent
      focus:bg-[var(--arc-deck-3)] focus:border-[rgba(111,140,255,0.38)] focus:ring-1 focus:ring-[var(--cn-sky)]
      hover:bg-[var(--arc-deck-3)] text-[var(--arc-ink)] 
      ${error ? 'bg-[rgba(255,61,113,0.12)] focus:bg-[rgba(255,61,113,0.12)]' : ''}
    `,
    ghost: `
      bg-transparent border border-transparent
      focus:bg-[var(--arc-deck-2)] focus:border-[var(--cn-line-soft)]
      hover:bg-[var(--cn-card-2)] text-[var(--arc-ink)]
      ${error ? 'text-[var(--arc-alert)] placeholder:text-[var(--arc-alert)]/50' : ''}
    `,
    glass: `
      bg-[var(--cn-card-2)] border-[3px] border-[var(--cn-line-soft)] 
      focus:bg-[var(--cn-card-2)] focus:border-[var(--arc-line-strong)]
      hover:bg-[var(--cn-card-2)] hover:border-[var(--arc-line-strong)] text-[var(--arc-ink)] placeholder-white/30
      ${error ? 'border-[rgba(255,61,113,0.38)] focus:border-[var(--cn-alert)] bg-[rgba(255,61,113,0.12)]' : ''}
    `
  };

  const hasValue = value !== undefined && value !== '';
  const showClearButton = clearable && hasValue && !disabled;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* 標籤 */}
      {label && (
        <label className={`
          arc-label block font-extrabold tracking-widest text-[var(--arc-ink-3)] uppercase
          flex items-center gap-1.5
          ${sizeClasses[size].label}
        `}>
          {label}
        </label>
      )}

      {/* 輸入框容器 */}
      <div className="relative group">
        {/* 前置圖標 */}
        {icon && (
          <div className={`
            absolute left-0 top-0 bottom-0
            flex items-center justify-center
            pointer-events-none transition-colors duration-300
            ${sizeClasses[size].icon}
            ${error 
              ? 'text-[var(--arc-alert)]' 
              : isFocused 
                ? 'text-[var(--arc-ink)]'
                : 'text-[var(--arc-ink-4)] group-hover:text-[var(--arc-ink-3)]'}
          `}>
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
          </div>
        )}

        {/* 輸入框 */}
        <input
          ref={ref}
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          className={`
            w-full rounded-sm
            placeholder-white/30
            outline-none
            ${sizeClasses[size].input}
            ${variantClasses[variant]}
            ${icon ? 'pl-10' : ''}
            ${showClearButton ? 'pr-10' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          {...props}
        />

        {/* 清除按鈕 */}
        <AnimatePresence>
          {showClearButton && (
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear?.();
              }}
              className={`
                absolute right-0 top-0 bottom-0
                flex items-center justify-center
                text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)]
                transition-colors w-10
              `}
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <CrossIcon className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* 焦點動畫光暈 (Glass 模式專屬底線) */}
        {isFocused && variant === 'glass' && (
          <motion.div
            layoutId={`input-focus-${props.name || 'default'}`}
            className="absolute bottom-0 left-2 right-2 h-[1px] bg-[var(--arc-deck-3)] -t-full pointer-events-none"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </div>

      {/* 錯誤訊息 */}
      <AnimatePresence>
        {error && (
          <motion.p
            className="mt-1.5 text-xs text-[var(--arc-alert)] flex items-center gap-1.5 font-medium"
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
          >
            <WarningIcon className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* 提示文字 */}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-[var(--arc-ink-4)] font-bold tracking-widest uppercase">
          {hint}
        </p>
      )}
    </div>
  );
});

CustomInput.displayName = 'CustomInput';

/**
 * 搜尋輸入框 - 預設帶搜尋圖標
 */
export const SearchInput = forwardRef<HTMLInputElement, Omit<CustomInputProps, 'icon'>>(
  (props, ref) => (
    <CustomInput
      ref={ref}
      icon={<SearchIcon className="w-4 h-4" />}
      placeholder="搜尋..."
      clearable
      {...props}
    />
  )
);

SearchInput.displayName = 'SearchInput';

/**
 * 數字輸入框
 */
const NumberInput = forwardRef<HTMLInputElement, CustomInputProps>(
  (props, ref) => (
    <CustomInput
      ref={ref}
      type="number"
      {...props}
    />
  )
);

NumberInput.displayName = 'NumberInput';

export default CustomInput;
