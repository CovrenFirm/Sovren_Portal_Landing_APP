import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shadow Board Analytics API
 *
 * backend-core implementation
 * Proxies to real Shadow Board metrics endpoint
 *
 * NO mocks. Production-grade only.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

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

interface ShadowBoardResponse {
  success: boolean;
  data?: ShadowBoardMetrics;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ShadowBoardResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get tenant ID from session or use demo
    const tenantId = DEMO_TENANT_ID; // TODO: Extract from auth session when available

    const response = await fetch(
      `${CRM_BASE_URL}/api/v1/crm/analytics/shadow-board-metrics`,
      {
        headers: {
          'X-Tenant-ID': tenantId,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Shadow Board metrics API failed: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !result.data) {
      throw new Error('Invalid Shadow Board metrics response');
    }

    return res.status(200).json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('[Shadow Board Analytics] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch Shadow Board metrics',
    });
  }
}
