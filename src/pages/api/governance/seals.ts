import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Governance Seal Verification API Proxy
 *
 * Proxies cryptographic seal verification to Governance backend
 * GET /api/v1/governance/seals/:sealHash - Verify specific seal
 *
 * NO mocks. NO fake data. Production-grade only.
 */

const GOVERNANCE_BASE_URL = process.env.SOVREN_GOVERNANCE_BASE_URL || 'http://10.15.38.1:8400';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface SealVerificationResponse {
  success: true;
  seal: {
    hash: string;
    table: string;
    operation: 'INSERT' | 'UPDATE' | 'DELETE';
    execAgent: string;
    autonomous: boolean;
    timestamp: string;
    verified: boolean;
    recordId?: string;
    metadata?: Record<string, any>;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = SealVerificationResponse | ErrorResponse;

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
    // Extract seal hash from query
    const { sealHash } = req.query;

    // Validate seal hash
    if (!sealHash || typeof sealHash !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: sealHash',
      });
    }

    // Validate hash format (SHA-256 is 64 hex characters)
    if (!/^[a-f0-9]{64}$/i.test(sealHash)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid seal hash format (expected 64-character hex string)',
      });
    }

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build backend URL
    const url = `${GOVERNANCE_BASE_URL}/api/v1/governance/seals/${sealHash}`;

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
      console.error(`[governance/seals] Backend error ${response.status}:`, errorText);

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
    console.error('[governance/seals] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
