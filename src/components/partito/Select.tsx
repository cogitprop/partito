import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string | null;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
  error,
  disabled = false,
  required = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
  
  const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
  
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <div ref={ref} className={cn('relative flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-warm-gray-700"
        >
          {label} {required && <span className="text-coral">*</span>}
        </label>
      )}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'h-12 px-4 text-base font-body bg-white border rounded-md outline-none flex items-center justify-between text-left transition-all duration-200',
          selectedOption ? 'text-warm-gray-900' : 'text-warm-gray-500',
          error 
            ? 'border-error' 
            : (isOpen || isFocused) 
              ? 'border-coral ring-3 ring-coral/10' 
              : 'border-warm-gray-300',
          disabled ? 'bg-warm-gray-50 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <Icon name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} className="text-warm-gray-500" />
      </button>
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-warm-gray-100 rounded-md shadow-lg z-50 max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-3 text-base font-body text-left flex items-center justify-between hover:bg-cream transition-colors',
                option.value === value ? 'text-coral' : 'text-warm-gray-700'
              )}
            >
              {option.label}
              {option.value === value && <Icon name="check" size={16} className="text-coral" />}
            </button>
          ))}
        </div>
      )}
      {error && (
        <span className="text-sm text-error flex items-center gap-1">
          <Icon name="x-circle" size={14} /> {error}
        </span>
      )}
    </div>
  );
};
