'use client';

/**
 * System Health Summary Component
 *
 * sre-ops implementation
 * Displays system health status from Prometheus or graceful degradation
 */

interface SystemMetrics {
  available: boolean;
  crmHealthy: boolean;
  shadowBoardHealthy: boolean;
  avgResponseTimeMs?: number;
  errorRate?: number;
  timestamp: string;
}

interface SystemHealthSummaryProps {
  metrics: SystemMetrics;
}

export default function SystemHealthSummary({ metrics }: SystemHealthSummaryProps) {
  const getStatusColor = (healthy: boolean): string => {
    return healthy ? 'text-emerald-400' : 'text-red-400';
  };

  const getStatusIcon = (healthy: boolean): string => {
    return healthy ? '✓' : '✗';
  };

  const getStatusBg = (healthy: boolean): string => {
    return healthy
      ? 'bg-emerald-900/20 border-emerald-700/50'
      : 'bg-red-900/20 border-red-700/50';
  };

  if (!metrics.available) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">System Health</h3>
          <span className="px-3 py-1 bg-amber-900/30 border border-amber-700/50 rounded-full text-xs text-amber-400">
            Limited Monitoring
          </span>
        </div>

        <div className="space-y-3">
          <div className={`border rounded-lg p-3 ${getStatusBg(metrics.crmHealthy)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">CRM Service</span>
              <span className={`text-lg font-bold ${getStatusColor(metrics.crmHealthy)}`}>
                {getStatusIcon(metrics.crmHealthy)} {metrics.crmHealthy ? 'Healthy' : 'Down'}
              </span>
            </div>
          </div>

          <div className={`border rounded-lg p-3 ${getStatusBg(metrics.shadowBoardHealthy)}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Shadow Board</span>
              <span
                className={`text-lg font-bold ${getStatusColor(metrics.shadowBoardHealthy)}`}
              >
                {getStatusIcon(metrics.shadowBoardHealthy)}{' '}
                {metrics.shadowBoardHealthy ? 'Healthy' : 'Down'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Prometheus metrics unavailable. Showing basic health checks only.
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
        </p>
      </div>
    );
  }

  // Full metrics available
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <span className="px-3 py-1 bg-emerald-900/30 border border-emerald-700/50 rounded-full text-xs text-emerald-400">
          All Systems Operational
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`border rounded-lg p-3 ${getStatusBg(metrics.crmHealthy)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">CRM</span>
            <span className={`font-bold ${getStatusColor(metrics.crmHealthy)}`}>
              {getStatusIcon(metrics.crmHealthy)}
            </span>
          </div>
        </div>

        <div className={`border rounded-lg p-3 ${getStatusBg(metrics.shadowBoardHealthy)}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Shadow Board</span>
            <span className={`font-bold ${getStatusColor(metrics.shadowBoardHealthy)}`}>
              {getStatusIcon(metrics.shadowBoardHealthy)}
            </span>
          </div>
        </div>
      </div>

      {metrics.avgResponseTimeMs !== undefined && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Avg Response Time</span>
            <span className="text-lg font-bold text-indigo-400">
              {metrics.avgResponseTimeMs}ms
            </span>
          </div>
        </div>
      )}

      {metrics.errorRate !== undefined && (
        <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Error Rate</span>
            <span
              className={`text-lg font-bold ${
                metrics.errorRate > 1 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {metrics.errorRate.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-4">
        Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
      </p>
    </div>
  );
}
