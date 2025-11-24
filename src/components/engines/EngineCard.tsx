'use client';

import Link from 'next/link';

/**
 * Engine Card Component
 *
 * ui-engineer implementation
 * Displays engine status and key metrics
 */

interface EngineCardProps {
  id: string;
  name: string;
  category: 'ai' | 'orchestration' | 'integration' | 'infrastructure';
  status: 'healthy' | 'degraded' | 'unknown';
  metricsAvailable: boolean;
  keyMetrics?: Array<{ label: string; value: string | number }>;
}

export default function EngineCard({
  id,
  name,
  category,
  status,
  metricsAvailable,
  keyMetrics = [],
}: EngineCardProps) {
  const getCategoryColor = () => {
    switch (category) {
      case 'ai':
        return 'from-violet-900/30 to-purple-900/30 border-violet-700/50';
      case 'orchestration':
        return 'from-indigo-900/30 to-blue-900/30 border-indigo-700/50';
      case 'integration':
        return 'from-emerald-900/30 to-teal-900/30 border-emerald-700/50';
      case 'infrastructure':
        return 'from-amber-900/30 to-orange-900/30 border-amber-700/50';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'degraded':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'unknown':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'healthy':
        return '✓';
      case 'degraded':
        return '⚠';
      case 'unknown':
        return '?';
    }
  };

  return (
    <div className={`bg-gradient-to-br ${getCategoryColor()} backdrop-blur-sm border rounded-xl p-6 hover:scale-105 transition-transform`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{name}</h3>
          <p className="text-xs text-gray-400 capitalize">{category}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
          {getStatusIcon()} {status.toUpperCase()}
        </span>
      </div>

      {!metricsAvailable ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">Not Instrumented</p>
          <p className="text-xs text-gray-600 mt-1">No metrics exposed</p>
        </div>
      ) : keyMetrics.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">No Activity Yet</p>
          <p className="text-xs text-gray-600 mt-1">Waiting for events</p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {keyMetrics.slice(0, 3).map((metric, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{metric.label}</span>
              <span className="text-white font-medium">{metric.value}</span>
            </div>
          ))}
        </div>
      )}

      <Link
        href={`/app/engines/${id}`}
        className="block w-full text-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}
