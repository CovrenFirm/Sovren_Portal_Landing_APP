/**
 * CRM API client for sovren-crm-service
 * All calls go through Next.js API routes to hide WireGuard backend from browser
 */

interface CRMContact {
  contact_id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  company_id?: string;
  company_name?: string;
  lifecycle_stage?: string;
  lead_score?: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

interface CRMDeal {
  deal_id: string;
  tenant_id: string;
  name: string;
  company_id?: string;
  company_name?: string;
  contact_id?: string;
  contact_name?: string;
  stage: string;
  amount?: number;
  probability?: number;
  close_date?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

interface CRMActivity {
  activity_id: string;
  tenant_id: string;
  activity_type: string;
  contact_id?: string;
  contact_name?: string;
  deal_id?: string;
  deal_name?: string;
  description?: string;
  activity_date: string;
  created_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch contacts list
 */
export async function getContacts(token: string): Promise<CRMContact[]> {
  const response = await fetch('/api/crm/contacts', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<CRMContact[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch contacts');
  }

  return result.data || [];
}

/**
 * Fetch single contact by ID
 */
export async function getContactById(contactId: string, token: string): Promise<CRMContact> {
  const response = await fetch(`/api/crm/contacts?id=${contactId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<CRMContact> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch contact');
  }

  return result.data!;
}

/**
 * Fetch deals list
 */
export async function getDeals(token: string): Promise<CRMDeal[]> {
  const response = await fetch('/api/crm/deals', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<CRMDeal[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch deals');
  }

  return result.data || [];
}

/**
 * Fetch single deal by ID
 */
export async function getDealById(dealId: string, token: string): Promise<CRMDeal> {
  const response = await fetch(`/api/crm/deals?id=${dealId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<CRMDeal> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch deal');
  }

  return result.data!;
}

/**
 * Fetch recent activities
 */
export async function getRecentActivities(token: string, limit: number = 10): Promise<CRMActivity[]> {
  const response = await fetch(`/api/crm/activities?limit=${limit}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<CRMActivity[]> = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to fetch activities');
  }

  return result.data || [];
}

export type { CRMContact, CRMDeal, CRMActivity };
