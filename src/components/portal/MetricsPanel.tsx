'use client';

import { TransformationMetrics } from '@/types/metrics';
import { cn } from '@/lib/cn';

interface MetricsPanelProps {
  metrics: TransformationMetrics | null;
  loading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}

function MetricCard({ title, value, subtitle, icon, trend, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-8 w-32 rounded bg-slate-800" />
          <div className="h-3 w-20 rounded bg-slate-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/80 to-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-slate-700 hover:shadow-lg hover:shadow-cyan-500/10">
      {/* Background Glow Effect */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />

      <div className="relative">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-xl">
              {icon}
            </div>
            <h3 className="text-sm font-medium text-slate-400">{title}</h3>
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-2">
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export function MetricsPanel({ metrics, loading, className }: MetricsPanelProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const timeSavedValue = metrics?.metrics.time_saved_hours || 0;
  const revenueValue = metrics?.metrics.revenue_opportunities_total || 0;
  const errorsValue = metrics?.metrics.errors_prevented || 0;

  return (
    <div className={cn('grid gap-6 md:grid-cols-3', className)}>
      {/* Time Saved Card */}
      <MetricCard
        title="Time Saved"
        value={loading ? '...' : `${formatNumber(timeSavedValue)}h`}
        subtitle={
          loading
            ? ''
            : `Valued at ${formatCurrency(metrics?.metrics.time_saved_value_usd || 0)}`
        }
        icon="⏱️"
        trend={{
          value: 12.5,
          isPositive: true,
        }}
        loading={loading}
      />

      {/* Revenue Opportunities Card */}
      <MetricCard
        title="Revenue Opportunities"
        value={loading ? '...' : formatCurrency(revenueValue)}
        subtitle={
          loading
            ? ''
            : `${metrics?.metrics.revenue_opportunities.length || 0} opportunities identified`
        }
        icon="💰"
        trend={{
          value: 8.3,
          isPositive: true,
        }}
        loading={loading}
      />

      {/* Errors Prevented Card */}
      <MetricCard
        title="Errors Prevented"
        value={loading ? '...' : formatNumber(errorsValue)}
        subtitle={
          loading
            ? ''
            : `Saving ${formatCurrency(metrics?.metrics.errors_prevented_value || 0)}`
        }
        icon="🛡️"
        trend={{
          value: 15.7,
          isPositive: true,
        }}
        loading={loading}
      />
    </div>
  );
}
