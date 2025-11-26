import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For development, always use localhost. For production, use WireGuard IP
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://10.66.0.2:8400'
      : 'http://localhost:8400';
    
    console.log('[Login API] Environment:', process.env.NODE_ENV);
    console.log('[Login API] Using base URL:', baseUrl);
    console.log('[Login API] Request body:', req.body);

    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('[Login API] Response status:', response.status);

    const data = await response.json();
    console.log('[Login API] Response data:', data);

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[Login API] Detailed error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
