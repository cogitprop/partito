import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string | null;
  helper?: string;
  showCounter?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  type = 'text',
  disabled = false,
  required = false,
  id,
  maxLength,
  showCounter = false,
  value,
  className,
  onChange,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const [isFocused, setIsFocused] = useState(false);
  
  const currentLength = typeof value === 'string' ? value.length : 0;
  
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-warm-gray-700"
        >
          {label} {required && <span className="text-coral">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          'h-12 px-4 text-base font-body text-warm-gray-900 bg-white border rounded-md outline-none transition-all duration-200',
          error 
            ? 'border-error' 
            : isFocused 
              ? 'border-coral ring-3 ring-coral/10' 
              : 'border-warm-gray-300',
          disabled && 'bg-warm-gray-50 cursor-not-allowed'
        )}
        {...props}
      />
      {showCounter && maxLength && (
        <div className="text-right">
          <span className={cn(
            'text-xs',
            currentLength > maxLength * 0.9 ? 'text-warning' : 'text-warm-gray-500'
          )}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
      {error && (
        <span id={errorId} className="text-sm text-error flex items-center gap-1">
          <Icon name="x-circle" size={14} /> {error}
        </span>
      )}
      {helper && !error && (
        <span className="text-xs text-warm-gray-500">{helper}</span>
      )}
    </div>
  );
};
