import React from 'react';
import { Icon, IconName } from './Icon';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div className="w-[120px] h-[120px] rounded-full bg-cream flex items-center justify-center mb-6">
          <Icon name={icon} size={48} className="text-warm-gray-400" />
        </div>
      )}
      <h3 className="text-xl font-semibold font-heading text-warm-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-base text-warm-gray-500 max-w-[320px] mb-6">
        {description}
      </p>
      {action && actionLabel && (
        <Button onClick={action}>{actionLabel}</Button>
      )}
    </div>
  );
};
