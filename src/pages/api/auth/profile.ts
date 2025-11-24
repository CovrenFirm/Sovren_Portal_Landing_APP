import type { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@/types/auth';
import { ApiResponse } from '@/types/common';

const BACKEND_URL = 'http://10.15.38.1:8250';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<User>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Extract authorization token from headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No authorization token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Forward request to backend via WireGuard tunnel
    const response = await fetch(`${BACKEND_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.message || data.error || 'Failed to fetch profile',
      });
    }

    // Return user profile data
    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        subscriber_id: data.subscriber_id,
        tenant_id: data.tenant_id,
        tier: data.tier,
      },
    });
  } catch (error) {
    console.error('Profile API error:', error);

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
