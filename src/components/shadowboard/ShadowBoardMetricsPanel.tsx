'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Shadow Board Metrics Panel
 *
 * Displays real Shadow Board performance metrics from backend
 * NO fake data. NO simulated metrics. Only real backend responses.
 */

interface ShadowBoardMetrics {
  totalAnalyses: number;
  avgAnalysisTimeMs: number;
  recommendationsAccepted: number;
  recommendationsRejected: number;
  topExecutive: {
    name: string;
    analysisCount: number;
    successRate: number;
  };
  analysesByType: Record<string, number>;
  impactMetrics: {
    dealsInfluenced: number;
    revenueImpact: number;
  };
}

interface MetricsResponse {
  success: boolean;
  data?: ShadowBoardMetrics;
  error?: string;
}

export default function ShadowBoardMetricsPanel() {
  const [metrics, setMetrics] = useState<ShadowBoardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/shadowboard/metrics?days_back=30');
      const data: MetricsResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }

      setMetrics(data.data || null);
    } catch (err) {
      console.error('[ShadowBoardMetricsPanel] Error fetching metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-gray-400">Loading Shadow Board metrics...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-red-400 mb-2">Metrics unavailable</div>
            <div className="text-sm text-gray-500">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!metrics) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-4xl mb-4 opacity-50">📊</div>
            <div className="text-gray-400">No Shadow Board activity yet</div>
            <div className="text-sm text-gray-500 mt-2">
              Metrics will appear once AI executives begin analyzing CRM data
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate acceptance rate
  const totalRecommendations =
    metrics.recommendationsAccepted + metrics.recommendationsRejected;
  const acceptanceRate =
    totalRecommendations > 0
      ? (metrics.recommendationsAccepted / totalRecommendations) * 100
      : 0;

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-1">
          Shadow Board Intelligence Metrics
        </h3>
        <p className="text-sm text-gray-400">Last 30 days</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Analyses */}
        <MetricCard
          label="Total Analyses"
          value={metrics.totalAnalyses.toLocaleString()}
          icon="🧠"
          color="indigo"
        />

        {/* Avg Analysis Time */}
        <MetricCard
          label="Avg Analysis Time"
          value={`${(metrics.avgAnalysisTimeMs / 1000).toFixed(2)}s`}
          icon="⚡"
          color="cyan"
        />

        {/* Acceptance Rate */}
        <MetricCard
          label="Acceptance Rate"
          value={`${acceptanceRate.toFixed(1)}%`}
          subtitle={`${metrics.recommendationsAccepted} / ${totalRecommendations}`}
          icon="✅"
          color="green"
        />

        {/* Deals Influenced */}
        <MetricCard
          label="Deals Influenced"
          value={metrics.impactMetrics.dealsInfluenced.toLocaleString()}
          icon="💼"
          color="purple"
        />
      </div>

      {/* Revenue Impact */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Revenue Impact</div>
              <div className="text-2xl font-bold text-emerald-400">
                ${(metrics.impactMetrics.revenueImpact / 1000000).toFixed(2)}M
              </div>
            </div>
            <div className="text-4xl opacity-50">💰</div>
          </div>
        </div>
      </div>

      {/* Top Executive */}
      {metrics.topExecutive && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-400 mb-3">
            Top Performing Executive
          </h4>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white mb-1">
                  {metrics.topExecutive.name}
                </div>
                <div className="text-sm text-gray-400">
                  {metrics.topExecutive.analysisCount} analyses •{' '}
                  {(metrics.topExecutive.successRate * 100).toFixed(1)}% success rate
                </div>
              </div>
              <div className="text-3xl">🏆</div>
            </div>
          </div>
        </div>
      )}

      {/* Analyses by Type */}
      {Object.keys(metrics.analysesByType).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-400 mb-3">
            Analyses by Type
          </h4>
          <div className="space-y-2">
            {Object.entries(metrics.analysesByType)
              .sort(([, a], [, b]) => b - a)
              .map(([type, count]) => (
                <div
                  key={type}
                  className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-300 capitalize">
                      {type.replace(/_/g, ' ')}
                    </div>
                    <div className="text-sm font-semibold text-white">{count}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  subtitle?: string;
  icon: string;
  color: 'indigo' | 'cyan' | 'green' | 'purple' | 'orange';
}

function MetricCard({ label, value, subtitle, icon, color }: MetricCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-900/20 to-purple-900/20 border-indigo-800/50',
    cyan: 'from-cyan-900/20 to-blue-900/20 border-cyan-800/50',
    green: 'from-green-900/20 to-emerald-900/20 border-green-800/50',
    purple: 'from-purple-900/20 to-fuchsia-900/20 border-purple-800/50',
    orange: 'from-orange-900/20 to-amber-900/20 border-orange-800/50',
  };

  return (
    <div
      className={cn(
        'bg-gradient-to-br border rounded-lg p-4',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-xs text-gray-400 uppercase tracking-wide">{label}</div>
        <div className="text-2xl opacity-50">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
