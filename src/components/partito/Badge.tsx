import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'going' | 'maybe' | 'not_going' | 'waitlist' | 'coral';
type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className,
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-warm-gray-100 text-warm-gray-700',
    going: 'bg-sage/20 text-sage',
    maybe: 'bg-honey/20 text-honey',
    not_going: 'bg-warm-gray-300/40 text-warm-gray-500',
    waitlist: 'bg-sky/20 text-sky',
    coral: 'bg-coral/20 text-coral',
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-0.5 text-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
