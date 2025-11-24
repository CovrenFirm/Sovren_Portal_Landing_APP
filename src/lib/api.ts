/**
 * Sovren API Client
 * Handles all HTTP requests to backend services via API routes
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: HeadersInit;
  body?: any;
  token?: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', headers = {}, body, token } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'Request failed', error);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),

  register: (data: { email: string; password: string; name?: string }) =>
    request('/auth/register', { method: 'POST', body: data }),

  profile: (token: string) =>
    request('/auth/profile', { token }),

  // Executives
  getExecutives: (token: string) =>
    request('/executives/list', { token }),

  interactWithExecutive: (executiveId: string, message: string, token: string) =>
    request('/executives/interact', { method: 'POST', body: { executiveId, message }, token }),

  // CRM - Contacts
  getContacts: (token: string) =>
    request('/crm/contacts', { token }),

  getContact: (id: string, token: string) =>
    request(`/crm/contacts?id=${id}`, { token }),

  createContact: (data: any, token: string) =>
    request('/crm/contacts', { method: 'POST', body: data, token }),

  updateContact: (id: string, data: any, token: string) =>
    request(`/crm/contacts?id=${id}`, { method: 'PUT', body: data, token }),

  deleteContact: (id: string, token: string) =>
    request(`/crm/contacts?id=${id}`, { method: 'DELETE', token }),

  // CRM - Companies
  getCompanies: (token: string) =>
    request('/crm/companies', { token }),

  // CRM - Deals
  getDeals: (token: string) =>
    request('/crm/deals', { token }),

  // CRM - Tasks
  getTasks: (token: string) =>
    request('/crm/tasks', { token }),

  createTask: (data: any, token: string) =>
    request('/crm/tasks', { method: 'POST', body: data, token }),

  updateTask: (id: string, data: any, token: string) =>
    request(`/crm/tasks?id=${id}`, { method: 'PUT', body: data, token }),

  deleteTask: (id: string, token: string) =>
    request(`/crm/tasks?id=${id}`, { method: 'DELETE', token }),

  // CRM - Notes
  getNotes: (token: string) =>
    request('/crm/notes', { token }),

  createNote: (data: any, token: string) =>
    request('/crm/notes', { method: 'POST', body: data, token }),

  // CRM - Activities
  getActivities: (token: string) =>
    request('/crm/activities', { token }),

  // Governance
  getSeals: (token: string) =>
    request('/governance/seals', { token }),

  // Metrics
  getMetrics: (token: string, timeframe?: string) =>
    request(`/metrics/transformation${timeframe ? `?timeframe=${timeframe}` : ''}`, { token }),

  // Voice
  voiceDemo: (persona: string, text: string) =>
    request('/voice-demo', { method: 'POST', body: { persona, text } }),

  // Deliberations
  getDeliberations: (token: string) =>
    request('/deliberations/list', { token }),

  getDeliberation: (deliberationId: string, token: string) =>
    request(`/deliberations/${deliberationId}`, { token }),

  getDeliberationMessages: (deliberationId: string, token: string) =>
    request(`/deliberations/${deliberationId}/messages`, { token }),
};

export { ApiError };
