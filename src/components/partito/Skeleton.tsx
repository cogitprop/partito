import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = '20px',
  className,
  rounded = 'md',
}) => {
  const roundedStyles = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-r from-warm-gray-100 via-warm-gray-50 to-warm-gray-100 bg-[length:200%_100%] animate-shimmer',
        roundedStyles[rounded],
        className
      )}
      style={{ width, height }}
    />
  );
};

// Common skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('flex flex-col gap-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height="16px"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-xl border border-warm-gray-100', className)}>
    <Skeleton height="24px" width="60%" className="mb-4" />
    <SkeletonText lines={2} />
    <div className="flex gap-2 mt-4">
      <Skeleton height="32px" width="80px" rounded="full" />
      <Skeleton height="32px" width="80px" rounded="full" />
    </div>
  </div>
);

export const SkeletonAvatar: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className,
}) => (
  <Skeleton
    width={`${size}px`}
    height={`${size}px`}
    rounded="full"
    className={className}
  />
);
