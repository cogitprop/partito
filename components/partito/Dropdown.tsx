import React, { useState, useRef, useEffect } from 'react';
import { Icon, IconName } from './Icon';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  align = 'left',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={cn('relative inline-block', className)} ref={ref}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-2 bg-white border border-warm-gray-100 rounded-lg shadow-lg z-50 min-w-[200px] animate-fade-in py-1',
            align === 'left' ? 'left-0' : 'right-0'
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: IconName;
  destructive?: boolean;
  disabled?: boolean;
  className?: string;
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  children,
  onClick,
  icon,
  destructive = false,
  disabled = false,
  className,
}) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-2.5 text-sm font-body text-left flex items-center gap-3 transition-colors',
        destructive ? 'text-error' : 'text-warm-gray-700',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-cream',
        className
      )}
    >
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
};

// Dropdown separator
export const DropdownSeparator: React.FC = () => (
  <div className="h-px bg-warm-gray-100 my-1" />
);
