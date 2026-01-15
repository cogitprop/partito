import React, { useId } from 'react';
import { cn } from '@/lib/utils';

interface RadioProps {
  checked: boolean;
  onChange: (value: string) => void;
  label?: string;
  value: string;
  disabled?: boolean;
  className?: string;
}

export const Radio: React.FC<RadioProps> = ({
  checked,
  onChange,
  label,
  value,
  disabled = false,
  className,
}) => {
  const radioId = useId();

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <button
        id={radioId}
        role="radio"
        type="button"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(value)}
        className={cn(
          'w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center transition-all duration-150 outline-none flex-shrink-0',
          checked ? 'border-coral' : 'border-warm-gray-300',
          disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          'focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2'
        )}
      >
        {checked && (
          <span className="w-2.5 h-2.5 rounded-full bg-coral" />
        )}
      </button>
      {label && (
        <label
          htmlFor={radioId}
          className={cn(
            'text-base text-warm-gray-700',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
};

// Radio Group for managing multiple radios
interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  name?: string;
  direction?: 'horizontal' | 'vertical';
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  onChange,
  options,
  direction = 'vertical',
  className,
}) => {
  return (
    <div
      role="radiogroup"
      className={cn(
        'flex gap-3',
        direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap',
        className
      )}
    >
      {options.map((option) => (
        <Radio
          key={option.value}
          value={option.value}
          label={option.label}
          checked={value === option.value}
          onChange={onChange}
          disabled={option.disabled}
        />
      ))}
    </div>
  );
};
