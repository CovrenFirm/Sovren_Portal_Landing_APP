import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'default',
      disabled,
      type = 'text',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: cn(
        'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
        'focus:border-purple-500 focus:ring-purple-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      ),
      filled: cn(
        'border-0 bg-gray-100 dark:bg-gray-700',
        'focus:bg-white dark:focus:bg-gray-800 focus:ring-purple-500/20',
        error && 'bg-red-50 dark:bg-red-900/20 focus:ring-red-500/20'
      ),
      outlined: cn(
        'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
        'focus:border-purple-500 focus:ring-purple-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      ),
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              baseStyles,
              variants[variant],
              'w-full px-4 py-2.5 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'default',
      disabled,
      id,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none';

    const variants = {
      default: cn(
        'border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
        'focus:border-purple-500 focus:ring-purple-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      ),
      filled: cn(
        'border-0 bg-gray-100 dark:bg-gray-700',
        'focus:bg-white dark:focus:bg-gray-800 focus:ring-purple-500/20',
        error && 'bg-red-50 dark:bg-red-900/20 focus:ring-red-500/20'
      ),
      outlined: cn(
        'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
        'focus:border-purple-500 focus:ring-purple-500/20',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      ),
    };

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          className={cn(
            baseStyles,
            variants[variant],
            'w-full px-4 py-2.5 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400',
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export default Input;
