import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Engine Metrics API
 *
 * backend-core + sre-ops implementation
 * Proxies Prometheus metrics from CRM service
 *
 * NO mocks. Real metrics only.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';

interface EngineMetrics {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unknown';
  metrics: Record<string, number>;
}

interface MetricsResponse {
  success: boolean;
  engines: EngineMetrics[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MetricsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, engines: [], error: 'Method not allowed' });
  }

  try {
    const { engineId } = req.query;

    // Fetch Prometheus metrics from CRM service
    const response = await fetch(`${CRM_BASE_URL}/metrics`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Metrics endpoint failed: ${response.status}`);
    }

    const metricsText = await response.text();
    const engines = parsePrometheusMetrics(metricsText, engineId as string | undefined);

    return res.status(200).json({
      success: true,
      engines,
    });
  } catch (error) {
    console.error('[engines/metrics] Error:', error);
    return res.status(500).json({
      success: false,
      engines: [],
      error: error instanceof Error ? error.message : 'Failed to fetch metrics',
    });
  }
}

function parsePrometheusMetrics(text: string, filterEngineId?: string): EngineMetrics[] {
  const lines = text.split('\n');
  const engines: Record<string, EngineMetrics> = {};

  // Initialize known engines
  const engineDefinitions = [
    { id: 'shadow_board', name: 'Shadow Board AI', prefix: 'shadowboard_' },
    { id: 'phd_engine', name: 'PhD Digital Doppelgänger', prefix: 'phd_engine_' },
    { id: 'redis_pipeline', name: 'Redis Event Pipeline', prefix: 'redis_' },
    { id: 'crm_integration', name: 'CRM Integration System', prefix: 'crm_' },
  ];

  for (const def of engineDefinitions) {
    if (!filterEngineId || filterEngineId === def.id) {
      engines[def.id] = {
        id: def.id,
        name: def.name,
        status: 'unknown',
        metrics: {},
      };
    }
  }

  // Parse metrics
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;

    for (const def of engineDefinitions) {
      if (filterEngineId && filterEngineId !== def.id) continue;

      if (line.startsWith(def.prefix)) {
        const match = line.match(/^([a-z_]+)(?:\{[^}]*\})?\s+([\d.]+)$/);
        if (match) {
          const [, metricName, value] = match;
          engines[def.id].metrics[metricName] = parseFloat(value);
          engines[def.id].status = 'healthy';
        }
      }
    }

    // Special case: service health
    if (line.includes('service_health_status')) {
      const match = line.match(/service_health_status\{service_name="([^"]+)"\}\s+([\d.]+)/);
      if (match) {
        const [, serviceName, value] = match;
        if (serviceName === 'crm' && (!filterEngineId || filterEngineId === 'crm_integration')) {
          engines.crm_integration.metrics.service_health_status = parseFloat(value);
          engines.crm_integration.status = parseFloat(value) === 1 ? 'healthy' : 'degraded';
        } else if (serviceName === 'shadowboard' && (!filterEngineId || filterEngineId === 'shadow_board')) {
          engines.shadow_board.metrics.service_health_status = parseFloat(value);
          engines.shadow_board.status = parseFloat(value) === 1 ? 'healthy' : 'degraded';
        }
      }
    }
  }

  return Object.values(engines);
}
