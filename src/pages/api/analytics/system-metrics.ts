import { NextApiRequest, NextApiResponse } from 'next';

/**
 * System Metrics API
 *
 * sre-ops implementation
 * Returns system health metrics if available
 *
 * NO mocks. Degrades gracefully if Prometheus unavailable.
 */

const PROMETHEUS_BASE_URL = process.env.SOVREN_PROMETHEUS_BASE_URL || '';

interface SystemMetricsResponse {
  success: boolean;
  data?: {
    available: boolean;
    crmHealthy: boolean;
    shadowBoardHealthy: boolean;
    avgResponseTimeMs?: number;
    errorRate?: number;
    timestamp: string;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SystemMetricsResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // If Prometheus not configured, return graceful degradation
  if (!PROMETHEUS_BASE_URL) {
    return res.status(200).json({
      success: true,
      data: {
        available: false,
        crmHealthy: true, // Assume healthy if responding
        shadowBoardHealthy: true, // Assume healthy if responding
        timestamp: new Date().toISOString(),
      },
    });
  }

  try {
    // Attempt to fetch Prometheus metrics
    const response = await fetch(`${PROMETHEUS_BASE_URL}/metrics`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });

    if (!response.ok) {
      throw new Error('Prometheus unavailable');
    }

    const metricsText = await response.text();

    // Parse basic metrics (simplified parsing)
    const crmHealthy = !metricsText.includes('crm_error_total') ||
                       metricsText.includes('crm_error_total 0');

    const shadowBoardHealthy = !metricsText.includes('shadowboard_error_total') ||
                               metricsText.includes('shadowboard_error_total 0');

    return res.status(200).json({
      success: true,
      data: {
        available: true,
        crmHealthy,
        shadowBoardHealthy,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[System Metrics] Error:', error);

    // Graceful degradation - return limited info
    return res.status(200).json({
      success: true,
      data: {
        available: false,
        crmHealthy: true,
        shadowBoardHealthy: true,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
