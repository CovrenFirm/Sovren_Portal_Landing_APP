import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Governance Constitution API Proxy
 *
 * Proxies constitution retrieval to Governance backend
 * GET /api/v1/governance/constitution - Get full constitution
 * GET /api/v1/governance/sections/:id - Get specific section
 *
 * NO mocks. NO fake data. Production-grade only.
 */

const GOVERNANCE_BASE_URL = process.env.SOVREN_GOVERNANCE_BASE_URL || 'http://10.15.38.1:8400';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface ConstitutionSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface ConstitutionResponse {
  success: true;
  constitution: {
    version: string;
    lastUpdated: string;
    sections: ConstitutionSection[];
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = ConstitutionResponse | ErrorResponse;

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
    // Extract section ID if provided
    const { sectionId } = req.query;

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build backend URL
    let url: string;
    if (sectionId && typeof sectionId === 'string') {
      url = `${GOVERNANCE_BASE_URL}/api/v1/governance/sections/${sectionId}`;
    } else {
      url = `${GOVERNANCE_BASE_URL}/api/v1/governance/constitution`;
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
      console.error(`[governance/constitution] Backend error ${response.status}:`, errorText);

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
    console.error('[governance/constitution] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
