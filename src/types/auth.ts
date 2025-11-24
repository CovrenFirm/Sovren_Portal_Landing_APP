export interface User {
  id: string;
  email: string;
  name?: string;
  subscriber_id: string;
  tenant_id: string;
  tier: 'FOUNDER' | 'SOLO' | 'PROFESSIONAL' | 'BUSINESS';
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  refresh_token: string;
  subscriber_id: string;
  tenant_id: string;
  tier: string;
  expires_in: number;
}
