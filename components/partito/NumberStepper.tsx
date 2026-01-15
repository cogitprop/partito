import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {label && (
        <span className="text-base text-warm-gray-700">{label}</span>
      )}
      <div className="flex items-center border border-warm-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className={cn(
            'w-10 h-10 flex items-center justify-center transition-colors',
            value <= min 
              ? 'text-warm-gray-300 cursor-not-allowed' 
              : 'text-warm-gray-700 hover:bg-warm-gray-50'
          )}
          aria-label="Decrease"
        >
          <Icon name="minus" size={18} />
        </button>
        <span className="w-12 text-center text-base font-medium text-warm-gray-900 border-x border-warm-gray-300 py-2">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className={cn(
            'w-10 h-10 flex items-center justify-center transition-colors',
            value >= max 
              ? 'text-warm-gray-300 cursor-not-allowed' 
              : 'text-warm-gray-700 hover:bg-warm-gray-50'
          )}
          aria-label="Increase"
        >
          <Icon name="plus" size={18} />
        </button>
      </div>
    </div>
  );
};
