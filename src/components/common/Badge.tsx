import React from 'react';
import { cn } from '@/lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  dot?: boolean;
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = 'default',
      size = 'md',
      rounded = false,
      dot = false,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200';

    const variants = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      outline: 'border-2 border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
    };

    const sizes = {
      sm: 'text-xs px-2 py-0.5 gap-1',
      md: 'text-sm px-2.5 py-1 gap-1.5',
      lg: 'text-base px-3 py-1.5 gap-2',
    };

    const dotColors = {
      default: 'bg-gray-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      purple: 'bg-purple-500',
      outline: 'bg-gray-500',
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          rounded ? 'rounded-full' : 'rounded-md',
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'rounded-full',
              dotColors[variant],
              dotSizes[size]
            )}
          />
        )}
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export interface StatusBadgeProps extends Omit<BadgeProps, 'variant' | 'dot'> {
  status: 'active' | 'inactive' | 'pending' | 'success' | 'failed' | 'processing';
}

export const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const statusConfig = {
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'default' as const, label: 'Inactive' },
      pending: { variant: 'warning' as const, label: 'Pending' },
      success: { variant: 'success' as const, label: 'Success' },
      failed: { variant: 'error' as const, label: 'Failed' },
      processing: { variant: 'info' as const, label: 'Processing' },
    };

    const config = statusConfig[status];

    return (
      <Badge ref={ref} variant={config.variant} dot {...props}>
        {config.label}
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

export default Badge;
