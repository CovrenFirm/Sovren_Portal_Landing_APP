import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import { getEngine, EngineMetadata } from '@/config/engines';

/**
 * Engine Detail Page
 *
 * ui-engineer + data-pipeline implementation
 * Detailed view of individual engine metrics and orchestration
 *
 * NO mocks. Real data only.
 */

interface EngineMetrics {
  id: string;
  status: 'healthy' | 'degraded' | 'unknown';
  metrics: Record<string, number>;
}

export default function EngineDetailPage() {
  const router = useRouter();
  const { engineId } = router.query;

  const [engine, setEngine] = useState<EngineMetadata | null>(null);
  const [metrics, setMetrics] = useState<EngineMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (engineId && typeof engineId === 'string') {
      const engineMeta = getEngine(engineId);
      if (engineMeta) {
        setEngine(engineMeta);
        loadMetrics(engineId);
      } else {
        setError('Engine not found');
        setLoading(false);
      }
    }
  }, [engineId]);

  const loadMetrics = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/engines/metrics?engineId=${id}`);

      if (!response.ok) {
        throw new Error(`Metrics API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.engines && data.engines.length > 0) {
        setMetrics(data.engines[0]);
      }
    } catch (err) {
      console.error('[Engine Detail] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PortalLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading engine data...</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  if (error || !engine) {
    return (
      <PortalLayout>
        <div className="space-y-6">
          <Link href="/app/engines" className="text-gray-400 hover:text-white transition-colors">
            ← Back to Engines
          </Link>
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-8 text-center">
            <p className="text-red-400 text-lg mb-2">Engine not found</p>
            <p className="text-gray-400">{error || 'Invalid engine ID'}</p>
          </div>
        </div>
      </PortalLayout>
    );
  }

  const getStatusColor = () => {
    if (!metrics) return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    switch (metrics.status) {
      case 'healthy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'degraded':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'unknown':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <>
      <Head>
        <title>{engine.name} - Engines - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/app/engines" className="text-gray-400 hover:text-white transition-colors">
              ← Back to Engines
            </Link>
            <button
              onClick={() => engineId && typeof engineId === 'string' && loadMetrics(engineId)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Header */}
          <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 border border-violet-800/50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{engine.name}</h1>
                <p className="text-lg text-gray-300 mb-3">{engine.description}</p>
                <p className="text-sm text-gray-400">{engine.role}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                {metrics?.status.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Metrics</h2>

            {!engine.metricsAvailable ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">📊</div>
                <p className="text-gray-400 text-lg mb-2">Not Instrumented</p>
                <p className="text-sm text-gray-500">This engine does not expose metrics yet</p>
              </div>
            ) : !metrics || Object.keys(metrics.metrics).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3 opacity-50">⏳</div>
                <p className="text-gray-400 text-lg mb-2">No Activity Yet</p>
                <p className="text-sm text-gray-500">Waiting for events to generate metrics</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metrics.metrics).map(([key, value]) => (
                  <div key={key} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toFixed(2) : value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Orchestration Context */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Orchestration Context</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Upstream Dependencies</h3>
                {engine.upstreamDependencies.length === 0 ? (
                  <p className="text-sm text-gray-500">No dependencies</p>
                ) : (
                  <div className="space-y-2">
                    {engine.upstreamDependencies.map((dep) => (
                      <div key={dep} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-white">{dep.replace(/_/g, ' ').toUpperCase()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Downstream Consumers</h3>
                {engine.downstreamConsumers.length === 0 ? (
                  <p className="text-sm text-gray-500">No consumers</p>
                ) : (
                  <div className="space-y-2">
                    {engine.downstreamConsumers.map((consumer) => (
                      <div key={consumer} className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <p className="text-sm text-white">{consumer.replace(/_/g, ' ').toUpperCase()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
