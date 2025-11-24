'use client';

/**
 * Shadow Board Impact Chart Component
 *
 * ui-engineer implementation
 * Displays Shadow Board performance and impact metrics
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
  analysesByType: {
    [key: string]: number;
  };
  impactMetrics: {
    dealsInfluenced: number;
    revenueImpact: number;
  };
}

interface ShadowBoardImpactChartProps {
  metrics: ShadowBoardMetrics;
}

export default function ShadowBoardImpactChart({ metrics }: ShadowBoardImpactChartProps) {
  const acceptanceRate =
    metrics.totalAnalyses > 0
      ? ((metrics.recommendationsAccepted / metrics.totalAnalyses) * 100).toFixed(1)
      : '0';

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatTime = (ms: number): string => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  const analysesByTypeArray = Object.entries(metrics.analysesByType).map(
    ([type, count]) => ({ type, count })
  );

  const maxTypeCount = Math.max(...analysesByTypeArray.map((a) => a.count), 1);

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Total Analyses</p>
          <p className="text-2xl font-bold text-white">{metrics.totalAnalyses}</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Avg Analysis Time</p>
          <p className="text-2xl font-bold text-indigo-400">
            {formatTime(metrics.avgAnalysisTimeMs)}
          </p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Acceptance Rate</p>
          <p className="text-2xl font-bold text-emerald-400">{acceptanceRate}%</p>
        </div>

        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Revenue Impact</p>
          <p className="text-2xl font-bold text-green-400">
            {formatCurrency(metrics.impactMetrics.revenueImpact)}
          </p>
        </div>
      </div>

      {/* Acceptance vs Rejection */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">
          Recommendation Outcomes
        </h4>
        <div className="flex gap-2 h-8">
          <div
            className="bg-emerald-500 rounded flex items-center justify-center text-xs font-medium text-white"
            style={{
              width: `${
                (metrics.recommendationsAccepted /
                  (metrics.recommendationsAccepted + metrics.recommendationsRejected)) *
                100
              }%`,
            }}
          >
            {metrics.recommendationsAccepted > 0 && metrics.recommendationsAccepted}
          </div>
          <div
            className="bg-red-500 rounded flex items-center justify-center text-xs font-medium text-white"
            style={{
              width: `${
                (metrics.recommendationsRejected /
                  (metrics.recommendationsAccepted + metrics.recommendationsRejected)) *
                100
              }%`,
            }}
          >
            {metrics.recommendationsRejected > 0 && metrics.recommendationsRejected}
          </div>
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-emerald-400">
            ✓ Accepted: {metrics.recommendationsAccepted}
          </span>
          <span className="text-red-400">✗ Rejected: {metrics.recommendationsRejected}</span>
        </div>
      </div>

      {/* Analyses by Type */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Analyses by Type</h4>
        <div className="space-y-2">
          {analysesByTypeArray.map((item) => {
            const percentage = (item.count / maxTypeCount) * 100;
            const label = item.type
              .split('_')
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(' ');

            return (
              <div key={item.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-medium">{item.count}</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-violet-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Executive */}
      <div className="bg-gradient-to-r from-violet-900/20 to-purple-900/20 border border-violet-700/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Top Performing Executive</p>
            <p className="text-xl font-bold text-white">{metrics.topExecutive.name}</p>
            <p className="text-sm text-gray-400">
              {metrics.topExecutive.analysisCount} analyses
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-emerald-400">
              {(metrics.topExecutive.successRate * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
