'use client';

/**
 * KPI Card Component
 *
 * ui-engineer implementation
 * Displays key performance indicator with optional change indicator
 */

interface KpiCardProps {
  title: string;
  value: string | number;
  changeIndicator?: {
    value: number;
    label?: string;
  };
  icon?: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

export default function KpiCard({
  title,
  value,
  changeIndicator,
  icon,
  variant = 'default',
}: KpiCardProps) {
  const variantStyles = {
    default: 'from-gray-900/50 to-gray-800/50 border-gray-700',
    success: 'from-emerald-900/30 to-emerald-800/30 border-emerald-700/50',
    warning: 'from-amber-900/30 to-amber-800/30 border-amber-700/50',
    info: 'from-indigo-900/30 to-indigo-800/30 border-indigo-700/50',
  };

  const iconStyles = {
    default: 'text-gray-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-indigo-400',
  };

  return (
    <div
      className={`bg-gradient-to-br ${variantStyles[variant]} backdrop-blur-sm border rounded-xl p-6 transition-all hover:scale-105`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>

          {changeIndicator && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={`text-xs font-medium ${
                  changeIndicator.value >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {changeIndicator.value >= 0 ? '↑' : '↓'}{' '}
                {Math.abs(changeIndicator.value)}%
              </span>
              {changeIndicator.label && (
                <span className="text-xs text-gray-500">{changeIndicator.label}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className={`text-3xl ${iconStyles[variant]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
