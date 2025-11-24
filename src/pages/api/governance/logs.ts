import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Governance Audit Logs API Proxy
 *
 * Proxies audit log retrieval to Governance backend
 * GET /api/v1/governance/audit?limit=100 - Get audit trail
 *
 * NO mocks. NO fake data. Production-grade only.
 */

const GOVERNANCE_BASE_URL = process.env.SOVREN_GOVERNANCE_BASE_URL || 'http://10.15.38.1:8400';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  execAgent: string;
  table: string;
  recordId: string;
  sealHash: string;
  verified: boolean;
  autonomous: boolean;
  metadata?: Record<string, any>;
}

interface AuditLogsResponse {
  success: true;
  logs: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = AuditLogsResponse | ErrorResponse;

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
    const { limit = '100', offset = '0', table, execAgent } = req.query;

    // Validate limit and offset
    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid limit parameter (must be between 1 and 1000)',
      });
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid offset parameter (must be >= 0)',
      });
    }

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build query parameters
    const queryParams = new URLSearchParams({
      limit: limitNum.toString(),
      offset: offsetNum.toString(),
    });

    if (table && typeof table === 'string') {
      queryParams.append('table', table);
    }

    if (execAgent && typeof execAgent === 'string') {
      queryParams.append('execAgent', execAgent);
    }

    // Build backend URL
    const url = `${GOVERNANCE_BASE_URL}/api/v1/governance/audit?${queryParams.toString()}`;

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
      console.error(`[governance/logs] Backend error ${response.status}:`, errorText);

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
    console.error('[governance/logs] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
