import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shadow Board Executive Scores Proxy
 *
 * Returns executive metadata (CEO/CFO/CTO scores) for contacts and deals
 * Proxies to CRM backend to retrieve metadata fields
 *
 * NO mocks. NO fake data. Only real backend metadata.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface ExecutiveScores {
  // CEO scores
  ceo_fit_score?: number;
  ceo_qualified_at?: string;

  // CFO scores
  cfo_revenue_potential?: number;
  cfo_ltv_estimate?: number;
  cfo_risk_level?: string;

  // CTO scores
  cto_technical_fit?: number;
  cto_complexity?: string;
  cto_timeline_estimate?: string;
}

interface SuccessResponse {
  success: true;
  entityType: 'contact' | 'deal';
  entityId: string;
  scores: ExecutiveScores;
  metadata: Record<string, any>;
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
    // Extract query parameters
    const { entityType, entityId } = req.query;

    // Validate required parameters
    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: entityType and entityId',
      });
    }

    if (entityType !== 'contact' && entityType !== 'deal') {
      return res.status(400).json({
        success: false,
        error: 'entityType must be "contact" or "deal"',
      });
    }

    if (typeof entityId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'entityId must be a string',
      });
    }

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build backend URL based on entity type
    const endpoint = entityType === 'contact'
      ? `/api/v1/crm/contacts/${entityId}`
      : `/api/v1/crm/deals/${entityId}`;

    const url = `${CRM_BASE_URL}${endpoint}`;

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
      console.error(`[shadowboard/scores] Backend error ${response.status}:`, errorText);

      return res.status(response.status).json({
        success: false,
        error: `Backend error: ${response.status}`,
      });
    }

    // Parse backend response
    const backendData = await response.json();

    // Extract entity data (handle both direct data and wrapped responses)
    const entityData = backendData.data || backendData;

    // Extract executive scores from metadata
    const metadata = entityData.metadata || {};

    const scores: ExecutiveScores = {
      // CEO scores
      ceo_fit_score: metadata.ceo_fit_score,
      ceo_qualified_at: metadata.ceo_qualified_at,

      // CFO scores
      cfo_revenue_potential: metadata.cfo_revenue_potential,
      cfo_ltv_estimate: metadata.cfo_ltv_estimate,
      cfo_risk_level: metadata.cfo_risk_level,

      // CTO scores
      cto_technical_fit: metadata.cto_technical_fit,
      cto_complexity: metadata.cto_complexity,
      cto_timeline_estimate: metadata.cto_timeline_estimate,
    };

    return res.status(200).json({
      success: true,
      entityType: entityType as 'contact' | 'deal',
      entityId: entityId as string,
      scores,
      metadata,
    });
  } catch (error) {
    console.error('[shadowboard/scores] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
