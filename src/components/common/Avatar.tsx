import React from 'react';
import { cn } from '@/lib/cn';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'square' | 'rounded';
  status?: 'online' | 'offline' | 'away' | 'busy';
  fallbackColor?: string;
  showStatus?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt,
      name,
      size = 'md',
      variant = 'circle',
      status,
      fallbackColor,
      showStatus = true,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-16 h-16 text-xl',
      '2xl': 'w-20 h-20 text-2xl',
    };

    const variants = {
      circle: 'rounded-full',
      square: 'rounded-none',
      rounded: 'rounded-lg',
    };

    const statusSizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3 h-3',
      xl: 'w-4 h-4',
      '2xl': 'w-5 h-5',
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const getInitials = (name: string): string => {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const getColorFromName = (name: string): string => {
      if (fallbackColor) return fallbackColor;

      const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-yellow-500',
        'bg-green-500',
        'bg-teal-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-purple-500',
        'bg-pink-500',
      ];

      const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
      return colors[index];
    };

    const showImage = src && !imageError;
    const initials = name ? getInitials(name) : '?';
    const backgroundColor = name ? getColorFromName(name) : 'bg-gray-500';

    return (
      <div ref={ref} className={cn('relative inline-block', className)} {...props}>
        <div
          className={cn(
            'flex items-center justify-center overflow-hidden',
            sizes[size],
            variants[variant],
            showImage ? 'bg-gray-200 dark:bg-gray-700' : `${backgroundColor} text-white`
          )}
        >
          {showImage ? (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <span className="font-semibold select-none">{initials}</span>
          )}
        </div>

        {status && showStatus && (
          <span
            className={cn(
              'absolute bottom-0 right-0 rounded-full ring-2 ring-white dark:ring-gray-800',
              statusSizes[size],
              statusColors[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
  size?: AvatarProps['size'];
  variant?: AvatarProps['variant'];
  children: React.ReactElement<AvatarProps>[];
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max = 5, size = 'md', variant = 'circle', children, ...props }, ref) => {
    const avatars = React.Children.toArray(children).slice(0, max);
    const remaining = React.Children.count(children) - max;

    const overlapClass = {
      xs: '-space-x-2',
      sm: '-space-x-2',
      md: '-space-x-3',
      lg: '-space-x-4',
      xl: '-space-x-5',
      '2xl': '-space-x-6',
    };

    return (
      <div
        ref={ref}
        className={cn('flex items-center', overlapClass[size], className)}
        {...props}
      >
        {avatars.map((avatar, index) =>
          React.cloneElement(avatar as React.ReactElement<AvatarProps>, {
            key: index,
            size,
            variant,
            className: cn(
              'ring-2 ring-white dark:ring-gray-800',
              (avatar as React.ReactElement<AvatarProps>).props.className
            ),
          })
        )}
        {remaining > 0 && (
          <Avatar
            size={size}
            variant={variant}
            name={`+${remaining}`}
            fallbackColor="bg-gray-600"
            className="ring-2 ring-white dark:ring-gray-800"
          />
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export default Avatar;
