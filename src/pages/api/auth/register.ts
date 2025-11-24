import type { NextApiRequest, NextApiResponse } from 'next';
import { RegisterRequest, AuthResponse } from '@/types/auth';
import { ApiResponse } from '@/types/common';

const BACKEND_URL = 'http://10.15.38.1:8250';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<AuthResponse>>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const { email, password, name } = req.body as RegisterRequest;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Forward request to backend via WireGuard tunnel
    const response = await fetch(`${BACKEND_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.message || data.error || 'Registration failed',
      });
    }

    // Return successful registration response
    return res.status(201).json({
      success: true,
      data: {
        success: true,
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        subscriber_id: data.subscriber_id,
        tenant_id: data.tenant_id,
        tier: data.tier,
        expires_in: data.expires_in,
      },
    });
  } catch (error) {
    console.error('Register API error:', error);

    // Handle connection errors
    if (error instanceof Error && error.message.includes('fetch')) {
      return res.status(503).json({
        success: false,
        error: 'Unable to connect to authentication service',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
