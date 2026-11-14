import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface CustomNumberInputProps {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export const CustomNumberInput = ({
  value,
  onChange,
  label,
  min,
  max,
  step = 1,
  className = ''
}: CustomNumberInputProps) => {
  const handleIncrement = () => {
    const next = value + step;
    if (max === undefined || next <= max) onChange(parseFloat(next.toFixed(2)));
  };

  const handleDecrement = () => {
    const next = value - step;
    if (min === undefined || next >= min) onChange(parseFloat(next.toFixed(2)));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className={`flex items-center gap-1 group/input ${className}`}>
      <div className="relative flex items-center">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          step={step}
          min={min}
          max={max}
          className="w-16 bg-transparent outline-none arc-num text-lg font-mono font-bold text-[var(--arc-ink)] tracking-wider text-center drop- focus:bg-[var(--arc-deck-2)]  transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {/* 自訂的上下箭頭按鈕 */}
        <div className="absolute right-0 flex flex-col opacity-0 group-hover/input:opacity-100 transition-opacity translate-x-full pl-1">
          <button 
            type="button" 
            onClick={handleIncrement} 
            className="text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)] bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)] -t-[4px] p-0.5 focus:outline-none flex items-center justify-center transition-colors mb-[1px]"
            tabIndex={-1}
          >
            <ChevronUpIcon className="w-2.5 h-2.5" />
          </button>
          <button 
            type="button" 
            onClick={handleDecrement} 
            className="text-[var(--arc-ink-4)] hover:text-[var(--arc-ink)] bg-[var(--arc-deck-2)] hover:bg-[var(--arc-deck-3)] -b-[4px] p-0.5 focus:outline-none flex items-center justify-center transition-colors"
            tabIndex={-1}
          >
            <ChevronDownIcon className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
      {label && <span className="arc-micro text-[10px] text-[var(--arc-ink-4)] font-sans tracking-widest ml-4">{label}</span>}
    </div>
  );
};
