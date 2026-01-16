import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const checkboxId = `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        'flex items-center gap-3 cursor-pointer select-none',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <div className="relative">
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="sr-only"
        />
        <div
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-150',
            checked 
              ? 'bg-sage border-sage' 
              : 'bg-warm-gray-100 border-warm-gray-400',
            isFocused && 'ring-2 ring-sage/30'
          )}
        >
          {checked && <Icon name="check" size={14} className="text-white" />}
        </div>
      </div>
      <span className="text-base text-warm-gray-700">{label}</span>
    </label>
  );
};
