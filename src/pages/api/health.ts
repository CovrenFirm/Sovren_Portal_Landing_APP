import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/common';

interface HealthData {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  version: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<HealthData>>
) {
  // Accept both GET and HEAD for healthchecks
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    const healthData: HealthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };

    return res.status(200).json({
      success: true,
      data: healthData,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}
