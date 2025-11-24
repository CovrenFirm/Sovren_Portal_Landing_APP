import { NextApiRequest, NextApiResponse } from 'next';

/**
 * CRM Summary Analytics API
 *
 * backend-core implementation
 * Aggregates CRM metrics from real backend
 *
 * NO mocks. Production-grade only.
 */

const CRM_BASE_URL = process.env.SOVREN_CRM_BASE_URL || 'http://10.15.38.1:8080';
const DEMO_TENANT_ID = process.env.DEMO_TENANT_ID || '00000000-0000-0000-0000-000000000099';

interface CRMSummaryResponse {
  success: boolean;
  data?: {
    totalContacts: number;
    totalCompanies: number;
    totalDeals: number;
    dealsWon: number;
    dealsLost: number;
    dealsActive: number;
    dealsByStage: { stage: string; count: number; totalValue: number }[];
    totalRevenue: number;
    forecastRevenue: number;
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CRMSummaryResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    // Get tenant ID from session or use demo
    const tenantId = DEMO_TENANT_ID; // TODO: Extract from auth session when available

    // Fetch contacts
    const contactsResponse = await fetch(`${CRM_BASE_URL}/api/v1/crm/contacts`, {
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    if (!contactsResponse.ok) {
      throw new Error(`Contacts API failed: ${contactsResponse.status}`);
    }

    const contactsData = await contactsResponse.json();
    const totalContacts = contactsData.data?.total || contactsData.total || 0;

    // Fetch companies
    const companiesResponse = await fetch(`${CRM_BASE_URL}/api/v1/crm/companies`, {
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    const companiesData = companiesResponse.ok ? await companiesResponse.json() : { data: { total: 0 } };
    const totalCompanies = companiesData.data?.total || companiesData.total || 0;

    // Fetch deals
    const dealsResponse = await fetch(`${CRM_BASE_URL}/api/v1/crm/deals`, {
      headers: {
        'X-Tenant-ID': tenantId,
        'Content-Type': 'application/json',
      },
    });

    if (!dealsResponse.ok) {
      throw new Error(`Deals API failed: ${dealsResponse.status}`);
    }

    const dealsData = await dealsResponse.json();
    const deals = dealsData.data?.data || dealsData.data || [];
    const totalDeals = dealsData.data?.total || dealsData.total || deals.length;

    // Aggregate deal metrics
    const dealsWon = deals.filter((d: any) => d.pipelineStage === 'won').length;
    const dealsLost = deals.filter((d: any) => d.pipelineStage === 'lost').length;
    const dealsActive = totalDeals - dealsWon - dealsLost;

    // Group by stage
    const stageMap: Record<string, { count: number; totalValue: number }> = {};

    deals.forEach((deal: any) => {
      const stage = deal.pipelineStage || 'unknown';
      if (!stageMap[stage]) {
        stageMap[stage] = { count: 0, totalValue: 0 };
      }
      stageMap[stage].count++;
      stageMap[stage].totalValue += Number(deal.value || 0);
    });

    const dealsByStage = Object.entries(stageMap).map(([stage, data]) => ({
      stage,
      count: data.count,
      totalValue: data.totalValue,
    }));

    // Calculate revenue
    const totalRevenue = deals
      .filter((d: any) => d.pipelineStage === 'won')
      .reduce((sum: number, d: any) => sum + Number(d.value || 0), 0);

    const forecastRevenue = deals
      .filter((d: any) => d.pipelineStage !== 'won' && d.pipelineStage !== 'lost')
      .reduce((sum: number, d: any) => {
        const value = Number(d.value || 0);
        const probability = Number(d.probability || 0) / 100;
        return sum + (value * probability);
      }, 0);

    return res.status(200).json({
      success: true,
      data: {
        totalContacts,
        totalCompanies,
        totalDeals,
        dealsWon,
        dealsLost,
        dealsActive,
        dealsByStage,
        totalRevenue,
        forecastRevenue,
      },
    });
  } catch (error) {
    console.error('[CRM Summary] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch CRM summary',
    });
  }
}
