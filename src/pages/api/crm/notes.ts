import type { NextApiRequest, NextApiResponse } from 'next';
import type { Note } from '@/types/crm';

const CRM_SERVICE_URL = 'http://10.15.38.1:8350';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function proxyRequest(
  req: NextApiRequest,
  endpoint: string
): Promise<{ status: number; data: any }> {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return {
      status: 401,
      data: { success: false, error: 'Unauthorized - Missing authorization token' }
    };
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': authToken
  };

  const url = `${CRM_SERVICE_URL}${endpoint}`;
  const options: RequestInit = {
    method: req.method,
    headers
  };

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    options.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return {
      status: response.status,
      data
    };
  } catch (error) {
    console.error('CRM service error:', error);
    return {
      status: 500,
      data: {
        success: false,
        error: 'Failed to communicate with CRM service',
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<Note | Note[]>>
) {
  const { method, query } = req;
  const { id } = query;

  let endpoint = '/api/crm/notes';

  if (id && typeof id === 'string') {
    endpoint = `/api/crm/notes/${id}`;
  }

  // Handle query parameters for GET requests
  if (method === 'GET' && Object.keys(query).length > 0) {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (key !== 'id' && value) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }
  }

  switch (method) {
    case 'GET':
      // GET /api/crm/notes or GET /api/crm/notes/:id
      const getResult = await proxyRequest(req, endpoint);
      return res.status(getResult.status).json(getResult.data);

    case 'POST':
      // POST /api/crm/notes - Create new note
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }
      const postResult = await proxyRequest(req, endpoint);
      return res.status(postResult.status).json(postResult.data);

    case 'PUT':
      // PUT /api/crm/notes/:id - Full update
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Note ID is required for PUT requests'
        });
      }
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }
      const putResult = await proxyRequest(req, endpoint);
      return res.status(putResult.status).json(putResult.data);

    case 'PATCH':
      // PATCH /api/crm/notes/:id - Partial update
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Note ID is required for PATCH requests'
        });
      }
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: 'Request body is required'
        });
      }
      const patchResult = await proxyRequest(req, endpoint);
      return res.status(patchResult.status).json(patchResult.data);

    case 'DELETE':
      // DELETE /api/crm/notes/:id
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Note ID is required for DELETE requests'
        });
      }
      const deleteResult = await proxyRequest(req, endpoint);
      return res.status(deleteResult.status).json(deleteResult.data);

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
      return res.status(405).json({
        success: false,
        error: `Method ${method} Not Allowed`
      });
  }
}
