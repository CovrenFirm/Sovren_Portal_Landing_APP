import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Shadow Board AI Analysis Notes Proxy
 *
 * Proxies requests to CRM service notes endpoint, filtered for AI analysis
 * GET /api/v1/crm/notes?contactId=:id&noteType=ai_analysis
 *
 * NO mocks. NO fake data. Only real AI analysis notes from backend.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || 'demo-tenant-001';

interface AIAnalysisNote {
  id: string;
  createdAt: string;
  execAgent: string; // ceo | cfo | cto
  title: string;
  content: string;
  metadata: Record<string, any>;
  contactId?: string;
  dealId?: string;
}

interface SuccessResponse {
  success: true;
  notes: AIAnalysisNote[];
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

    // Extract tenant ID from session or use demo tenant
    // TODO: In production, extract from authenticated user's session
    const tenantId = DEMO_TENANT_ID;

    // Build backend URL based on entity type
    // Backend uses snake_case: contact_id, deal_id, note_type
    const entityParam = entityType === 'contact' ? 'contact_id' : 'deal_id';
    const url = `${CRM_BASE_URL}/api/v1/crm/notes?${entityParam}=${entityId}&note_type=ai_analysis`;

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
      console.error(`[shadowboard/notes] Backend error ${response.status}:`, errorText);

      return res.status(response.status).json({
        success: false,
        error: `Backend error: ${response.status}`,
      });
    }

    // Parse backend response
    const backendData = await response.json();

    // Backend returns: { success, data: { data: [...], total, limit, offset }, timestamp }
    let notes: any[] = [];

    if (backendData.success && backendData.data?.data) {
      notes = backendData.data.data;
    } else if (Array.isArray(backendData)) {
      notes = backendData;
    } else if (backendData.data && Array.isArray(backendData.data)) {
      notes = backendData.data;
    } else if (backendData.notes && Array.isArray(backendData.notes)) {
      notes = backendData.notes;
    }

    // Transform backend notes to our expected format
    const transformedNotes: AIAnalysisNote[] = notes.map((note: any) => {
      const content = note.content || note.note_content || '';
      const title = extractTitle(content);
      const execAgent = extractExecutiveAgent(content, title);

      return {
        id: note.id || note.note_id || '',
        createdAt: note.created_at || note.createdAt || new Date().toISOString(),
        execAgent,
        title,
        content,
        metadata: note.metadata || {},
        contactId: note.contact_id || note.contactId,
        dealId: note.deal_id || note.dealId,
      };
    });

    return res.status(200).json({
      success: true,
      notes: transformedNotes,
    });
  } catch (error) {
    console.error('[shadowboard/notes] Proxy error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

/**
 * Extract title from note content (first line or heading)
 */
function extractTitle(content: string): string {
  if (!content) return 'AI Analysis';

  // Try to extract markdown heading
  const headingMatch = content.match(/^#+ (.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }

  // Try to extract bold text
  const boldMatch = content.match(/^\*\*(.+?)\*\*/m);
  if (boldMatch) {
    return boldMatch[1].trim();
  }

  // Use first line
  const firstLine = content.split('\n')[0].trim();
  if (firstLine.length > 0 && firstLine.length < 100) {
    return firstLine;
  }

  return 'AI Analysis';
}

/**
 * Extract executive agent from note content
 * Looks for CEO, CFO, CTO, CMO, COO, etc. in title or content
 */
function extractExecutiveAgent(content: string, title: string): string {
  const text = `${title} ${content}`.toLowerCase();

  // Check for executive roles in order of specificity
  if (text.includes('ceo')) return 'CEO';
  if (text.includes('cfo')) return 'CFO';
  if (text.includes('cto')) return 'CTO';
  if (text.includes('cmo')) return 'CMO';
  if (text.includes('coo')) return 'COO';
  if (text.includes('chro')) return 'CHRO';
  if (text.includes('ciso')) return 'CISO';
  if (text.includes('clo')) return 'CLO';

  return 'Unknown';
}
