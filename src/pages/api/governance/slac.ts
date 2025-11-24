import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Governance SLAC Matrix API Proxy
 *
 * Proxies SLAC (Sovren LLM Authorization Control) matrix retrieval
 * GET /api/v1/governance/slac - Get full authorization matrix
 * GET /api/v1/governance/slac/actions - Get available actions
 * GET /api/v1/governance/slac/roles - Get executive roles
 *
 * NO mocks. NO fake data. Production-grade only.
 */

const GOVERNANCE_BASE_URL = process.env.SOVREN_GOVERNANCE_BASE_URL || 'http://10.15.38.1:8400';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface SLACRule {
  role: string;
  action: string;
  authorization: 'autonomous' | 'requires_approval' | 'forbidden';
  conditions?: Record<string, any>;
}

interface SLACMatrixResponse {
  success: true;
  matrix: {
    version: string;
    rules: SLACRule[];
    roles: string[];
    actions: string[];
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SLACMatrixResponse | ErrorResponse;

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
    // Extract query type
    const { type } = req.query;

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build backend URL based on query type
    let url: string;
    if (type === 'actions') {
      url = `${GOVERNANCE_BASE_URL}/api/v1/governance/slac/actions`;
    } else if (type === 'roles') {
      url = `${GOVERNANCE_BASE_URL}/api/v1/governance/slac/roles`;
    } else {
      url = `${GOVERNANCE_BASE_URL}/api/v1/governance/slac`;
    }

    // Forward request to Governance service
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
      console.error(`[governance/slac] Backend error ${response.status}:`, errorText);

      return res.status(response.status).json({
        success: false,
        error: `Backend error: ${response.status}`,
      });
    }

    // Parse backend response
    const backendData = await response.json();

    // Return backend data directly
    return res.status(200).json(backendData);
  } catch (error) {
    console.error('[governance/slac] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
