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

    // Forward to subscribers API (adjust endpoint as needed)
    const response = await fetch('http://10.66.0.2:8400/api/profile', {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Profile API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
