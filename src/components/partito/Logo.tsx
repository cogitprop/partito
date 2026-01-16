import React from 'react';
import { cn } from '@/lib/utils';
import partitoLogo from '@/assets/partito-logo.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
  };

  return (
    <img
      src={partitoLogo}
      alt="Partito"
      className={cn(sizeClasses[size], 'w-auto', className)}
    />
  );
};
