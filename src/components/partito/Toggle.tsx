import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const toggleId = `toggle-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <label
      htmlFor={toggleId}
      className={cn(
        'flex items-center justify-between cursor-pointer select-none',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      {label && <span className="text-base text-warm-gray-700">{label}</span>}
      <div className="relative">
        <input
          id={toggleId}
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
            'w-12 h-7 rounded-full transition-colors duration-200',
            checked ? 'bg-coral' : 'bg-warm-gray-300',
            isFocused && 'ring-2 ring-coral/30'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 absolute top-1',
              checked ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </div>
      </div>
    </label>
  );
};
