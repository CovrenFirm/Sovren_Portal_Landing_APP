import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Multimodal Attachment List API Proxy
 *
 * backend-core implementation
 * Lists attachments for a CRM entity
 *
 * NO mocks. Production-grade only.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface Attachment {
  id: string;
  filename: string;
  mediaType: string;
  size: number;
  createdAt: string;
  uploadId: string;
  analysisStatus?: string;
}

interface ListResponse {
  success: true;
  attachments: Attachment[];
  total: number;
}

interface ErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = ListResponse | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: `Method ${req.method} not allowed`,
    });
  }

  try {
    const { entityType, entityId } = req.query;

    // Validate required parameters
    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: entityType, entityId',
      });
    }

    if (entityType !== 'contact' && entityType !== 'deal') {
      return res.status(400).json({
        success: false,
        error: 'entityType must be "contact" or "deal"',
      });
    }

    // sec-architect: Extract tenant from session
    const tenantId = DEMO_TENANT_ID;

    // backend-core: Fetch attachments from CRM
    const url = `${CRM_BASE_URL}/api/v1/crm/attachments?entityType=${entityType}&entityId=${entityId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('[multimodal/list] Backend error:', errorText);

      return res.status(response.status).json({
        success: false,
        error: `Backend error: ${response.status}`,
      });
    }

    const data = await response.json();

    // Handle various backend response formats
    let attachments: Attachment[] = [];

    if (data.success && data.data) {
      attachments = Array.isArray(data.data) ? data.data : data.data.data || [];
    } else if (data.attachments) {
      attachments = data.attachments;
    } else if (Array.isArray(data)) {
      attachments = data;
    }

    return res.status(200).json({
      success: true,
      attachments,
      total: attachments.length,
    });
  } catch (error) {
    console.error('[multimodal/list] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
