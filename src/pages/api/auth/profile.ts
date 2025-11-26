import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ error: 'No authorization token' });
    }

    // For development, always use localhost. For production, use WireGuard IP
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'http://10.66.0.2:8400'
      : 'http://localhost:8400';

    console.log('[Profile API] Environment:', process.env.NODE_ENV);
    console.log('[Profile API] Using base URL:', baseUrl);

    const response = await fetch(`${baseUrl}/api/profile`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    console.log('[Profile API] Response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('[Profile API] Detailed error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
