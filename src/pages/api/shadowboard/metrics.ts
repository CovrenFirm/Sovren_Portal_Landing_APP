import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shadow Board Metrics Proxy
 *
 * Proxies requests to CRM service Shadow Board analytics endpoint
 * GET /api/v1/crm/analytics/shadow-board-metrics
 *
 * NO mocks. NO fake data. Only real backend responses.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || 'demo-tenant-001';

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

interface SuccessResponse {
  success: true;
  data: ShadowBoardMetrics;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SuccessResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Extract query parameters
    const daysBack = req.query.days_back || '30';

    // Build backend URL
    const url = `${CRM_BASE_URL}/api/v1/crm/analytics/shadow-board-metrics?days_back=${daysBack}`;

    // Forward request to CRM service
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    // Handle non-OK responses
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[shadowboard/metrics] Backend error ${response.status}:`, errorText);

      return res.status(response.status).json({
        success: false,
        error: `Backend error: ${response.status}`,
      });
    }

    // Parse and return backend data
    const backendData = await response.json();

    // Backend might return { success, data } or just the data directly
    // Handle both cases
    const data = backendData.data || backendData;

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('[shadowboard/metrics] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
