import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import PortalLayout from '@/components/PortalLayout';
import { requireAuth } from '@/lib/auth';
import EngineCard from '@/components/engines/EngineCard';
import { getAllEngines, EngineMetadata } from '@/config/engines';

/**
 * Engine Command View
 *
 * ui-engineer + backend-core implementation
 * Dashboard for Sovren engine orchestration
 *
 * NO mocks. Real metrics only.
 */

interface EngineStatus {
  id: string;
  status: 'healthy' | 'degraded' | 'unknown';
  metrics: Record<string, number>;
}

export default function EnginesPage() {
  const [engineStatuses, setEngineStatuses] = useState<Record<string, EngineStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engines = getAllEngines();

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/engines/metrics');

      if (!response.ok) {
        throw new Error(`Metrics API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.engines) {
        const statusMap: Record<string, EngineStatus> = {};
        data.engines.forEach((e: any) => {
          statusMap[e.id] = {
            id: e.id,
            status: e.status,
            metrics: e.metrics,
          };
        });
        setEngineStatuses(statusMap);
      }
    } catch (err) {
      console.error('[Engines] Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getKeyMetrics = (engine: EngineMetadata): Array<{ label: string; value: string | number }> => {
    const status = engineStatuses[engine.id];
    if (!status || !engine.metricsAvailable) return [];

    const metrics: Array<{ label: string; value: string | number }> = [];

    // Shadow Board
    if (engine.id === 'shadow_board') {
      const total = status.metrics.shadowboard_analysis_total || 0;
      const failures = status.metrics.shadowboard_analysis_failures_total || 0;
      const avgDuration = status.metrics.shadowboard_analysis_duration_seconds || 0;

      metrics.push({ label: 'Total Analyses', value: total });
      metrics.push({ label: 'Failures', value: failures });
      metrics.push({ label: 'Avg Duration', value: `${(avgDuration * 1000).toFixed(0)}ms` });
    }

    // PhD Engine
    if (engine.id === 'phd_engine') {
      const total = status.metrics.phd_engine_execution_total || 0;
      const exceptions = status.metrics.phd_engine_exceptions_total || 0;
      const queueDepth = status.metrics.phd_engine_queue_depth || 0;

      metrics.push({ label: 'Executions', value: total });
      metrics.push({ label: 'Exceptions', value: exceptions });
      metrics.push({ label: 'Queue Depth', value: queueDepth });
    }

    // Redis Pipeline
    if (engine.id === 'redis_pipeline') {
      const published = status.metrics.redis_events_published_total || 0;
      const consumed = status.metrics.redis_events_consumed_total || 0;
      const queueDepth = status.metrics.redis_queue_depth || 0;

      metrics.push({ label: 'Events Published', value: published });
      metrics.push({ label: 'Events Consumed', value: consumed });
      metrics.push({ label: 'Queue Depth', value: queueDepth });
    }

    // CRM Integration
    if (engine.id === 'crm_integration') {
      const requests = status.metrics.crm_api_requests_total || 0;
      const contactsCreated = status.metrics.crm_contact_created_total || 0;

      metrics.push({ label: 'API Requests', value: requests });
      metrics.push({ label: 'Contacts Created', value: contactsCreated });
    }

    return metrics;
  };

  const groupedEngines = {
    ai: engines.filter(e => e.category === 'ai'),
    orchestration: engines.filter(e => e.category === 'orchestration'),
    integration: engines.filter(e => e.category === 'integration'),
    infrastructure: engines.filter(e => e.category === 'infrastructure'),
  };

  return (
    <>
      <Head>
        <title>Engine Orchestration - Sovren AI</title>
      </Head>
      <PortalLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Engine Command View</h1>
              <p className="text-gray-400">Real-time orchestration and telemetry</p>
            </div>
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {Object.entries(groupedEngines).map(([category, categoryEngines]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold text-white mb-4 capitalize">{category} Engines</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryEngines.map((engine) => (
                  <EngineCard
                    key={engine.id}
                    id={engine.id}
                    name={engine.name}
                    category={engine.category}
                    status={engineStatuses[engine.id]?.status || 'unknown'}
                    metricsAvailable={engine.metricsAvailable}
                    keyMetrics={getKeyMetrics(engine)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </PortalLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  return requireAuth(context);
};
