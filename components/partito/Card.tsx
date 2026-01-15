import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'content';
  hover?: boolean;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hover = false,
  className,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();
  
  const variantStyles = {
    default: 'bg-white border border-warm-gray-100 rounded-xl shadow-md',
    content: 'bg-cream rounded-lg',
  };
  
  return (
    <div
      className={cn(
        'p-6',
        variantStyles[variant],
        hover && !reducedMotion && isHovered && 'transform -translate-y-0.5 shadow-lg',
        !reducedMotion && 'transition-all duration-200',
        onClick && 'cursor-pointer',
        className
      )}
      onMouseEnter={() => hover && setIsHovered(true)}
      onMouseLeave={() => hover && setIsHovered(false)}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
